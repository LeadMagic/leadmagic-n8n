import type {
  IExecuteFunctions,
  IHttpRequestOptions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from "n8n-workflow";
import {
  NodeApiError,
  NodeOperationError,
  NodeConnectionTypes,
} from "n8n-workflow";
import {
  advertisementOperations,
  b2bAdDetailsFields,
  b2bAdsFields,
  googleAdsFields,
  metaAdsFields,
} from "./descriptions/AdvertisementDescription";

import {
  companyFundingFields,
  companyOperations,
  companySearchFields,
  competitorsSearchFields,
  technographicsFields,
} from "./descriptions/CompanyDescription";
import { creditOperations } from "./descriptions/CreditDescription";
import {
  emailFinderFields,
  emailOperations,
  emailValidateFields,
  personalEmailFields,
  socialToWorkEmailFields,
} from "./descriptions/EmailDescription";
import { jobOperations, jobSearchFields } from "./descriptions/JobDescription";
import {
  emailToProfileFields,
  employeeFinderFields,
  jobChangeDetectorFields,
  mobileFinderFields,
  peopleOperations,
  profileOperations,
  profileSearchFields,
  roleFinderFields,
} from "./descriptions/ProfileDescription";

import { outputFields } from "./descriptions/OutputDescription";
import {
  companyDiscoveryFields,
  jobSearchV3Fields,
  localLeadFields,
  localLeadOperations,
  lookalikeFields,
  peopleSearchFields,
} from "./descriptions/SearchDescription";
import { projectResponse } from "./output";
import { request } from "./request";
import {
  clean,
  mergeBody,
  parseAdditionalJson,
  runSearch,
  splitList,
  type SearchSpec,
} from "./search";

function publicErrorMessage(error: unknown): string {
  return error instanceof NodeApiError || error instanceof NodeOperationError
    ? error.message
    : "LeadMagic operation failed; check inputs and account limits";
}

function collection(
  ctx: IExecuteFunctions,
  name: string,
  itemIndex: number,
): IDataObject {
  const value = ctx.getNodeParameter(name, itemIndex, {});
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as IDataObject)
    : {};
}

function withFilters(
  body: IDataObject,
  key: string,
  filters: IDataObject,
): IDataObject {
  const cleaned = clean(filters);
  return Object.keys(cleaned).length ? { ...body, [key]: cleaned } : body;
}

/** Build the request for a V3 search operation, or undefined for other operations. */
function searchSpec(
  ctx: IExecuteFunctions,
  resource: string,
  operation: string,
  i: number,
): SearchSpec | undefined {
  const param = (name: string) => ctx.getNodeParameter(name, i, "") as string;
  let spec: SearchSpec | undefined;

  if (resource === "people" && operation === "searchPeople") {
    const people = collection(ctx, "peopleFilters", i);
    const { company_name, linkedin_url, query, include_company, roles } =
      people;
    const peopleFilters = { ...people };
    for (const key of [
      "company_name",
      "linkedin_url",
      "query",
      "include_company",
      "roles",
    ])
      delete peopleFilters[key];
    let body = clean({
      company_domain: param("company_domain").trim(),
      company_name,
      linkedin_url,
      titles: param("titles"),
      roles,
      query,
      include_company,
    });
    body = withFilters(body, "people_filters", peopleFilters);
    body = withFilters(
      body,
      "company_filters",
      collection(ctx, "companyFilters", i),
    );
    spec = {
      path: "/v3/people/search",
      recordsKey: "people",
      paging: "cursor",
      maxPageSize: 50,
      body,
    };
  } else if (resource === "company" && operation === "searchCompanies") {
    let body = clean({
      query: param("query").trim(),
      ...collection(ctx, "companyLookup", i),
    });
    body = withFilters(
      body,
      "company_filters",
      collection(ctx, "companyFilters", i),
    );
    spec = {
      path: "/v3/companies/search",
      recordsKey: "companies",
      paging: "cursor",
      maxPageSize: 50,
      body,
    };
  } else if (resource === "company" && operation === "findLookalikes") {
    let body = clean({
      company_domain: param("company_domain").trim(),
      ...collection(ctx, "seedOptions", i),
    });
    body = withFilters(
      body,
      "company_filters",
      collection(ctx, "companyFilters", i),
    );
    spec = {
      path: "/v3/companies/lookalike",
      recordsKey: "companies",
      paging: "offset",
      maxPageSize: 100,
      body,
    };
  } else if (resource === "localLead" && operation === "searchLocalLeads") {
    const filters = collection(ctx, "localFilters", i);
    const country = splitList(param("country"));
    const body = clean({
      country: country.length > 1 ? country : country[0],
      category_contains: param("category_contains").trim(),
      ...filters,
    });
    spec = {
      path: "/v3/local-leads/search",
      recordsKey: "leads",
      paging: "fixedCursor",
      maxPageSize: 25,
      body,
    };
  } else if (resource === "job" && operation === "searchJobs") {
    const filters = collection(ctx, "jobFilters", i);
    const body: IDataObject = {};
    const include = splitList(param("titlesInclude"));
    const exclude = splitList(filters.titlesExclude);
    if (include.length || exclude.length)
      body.titles = clean({ include, exclude });
    const companies = splitList(filters.companies);
    if (companies.length) body.companies = { include: companies };
    const countries = splitList(filters.countries);
    if (countries.length) body.location = { countries };
    const seniority = splitList(filters.seniority);
    if (seniority.length) body.seniority = seniority;
    for (const key of [
      "postedWithin",
      "hasRemote",
      "includeDescription",
      "mode",
    ]) {
      if (filters[key] !== undefined && filters[key] !== "")
        body[key] = filters[key];
    }
    spec = {
      path: "/v3/jobs/search",
      recordsKey: "signals",
      paging: "cursor",
      maxPageSize: 50,
      body,
    };
  }

  if (spec) {
    spec.body = mergeBody(spec.body, parseAdditionalJson.call(ctx, i));
    if (Object.keys(spec.body).length === 0) {
      throw new NodeOperationError(
        ctx.getNode(),
        "Add at least one search input or filter",
        { itemIndex: i },
      );
    }
  }
  return spec;
}

export class LeadMagic implements INodeType {
  description: INodeTypeDescription = {
    displayName: "LeadMagic",
    name: "leadMagic",
    icon: { light: "file:leadmagic.svg", dark: "file:leadmagic.dark.svg" },
    usableAsTool: true,
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      "Find and validate work emails, search people, companies, local businesses, and jobs, and enrich B2B records with LeadMagic",
    defaults: {
      name: "LeadMagic",
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: "leadMagicApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Advertisement",
            value: "advertisement",
            description: "Competitive ad intelligence across platforms",
          },
          {
            name: "Company",
            value: "company",
            description:
              "Company intelligence, funding, technographics, and competitors",
          },
          {
            name: "Credit",
            value: "credit",
            description: "Check the account credit balance (free)",
          },
          {
            name: "Email",
            value: "email",
            description:
              "Find work emails or validate emails from an existing list",
          },
          {
            name: "Job",
            value: "job",
            description: "Job posting discovery & recruitment intelligence",
          },
          {
            name: "Local Lead",
            value: "localLead",
            description:
              "Local businesses with phones, emails, and websites by place and category",
          },
          {
            name: "Person",
            value: "people",
            description:
              "Search people, find role holders and employees, and detect job changes",
          },
          {
            name: "Profile",
            value: "profile",
            description: "Professional profile enrichment and contact lookups",
          },
        ],
        default: "email",
      },

      // Resource Operations
      ...creditOperations,
      ...emailOperations,
      ...companyOperations,
      ...profileOperations,
      ...peopleOperations,
      ...jobOperations,
      ...advertisementOperations,
      ...localLeadOperations,

      // Resource Fields
      ...emailValidateFields,
      ...emailFinderFields,
      ...personalEmailFields,
      ...socialToWorkEmailFields,
      ...companySearchFields,
      ...companyFundingFields,
      ...technographicsFields,
      ...competitorsSearchFields,
      ...profileSearchFields,
      ...emailToProfileFields,
      ...mobileFinderFields,
      ...roleFinderFields,
      ...employeeFinderFields,
      ...jobChangeDetectorFields,
      ...jobSearchFields,
      ...googleAdsFields,
      ...metaAdsFields,
      ...b2bAdsFields,
      ...b2bAdDetailsFields,
      ...peopleSearchFields,
      ...companyDiscoveryFields,
      ...lookalikeFields,
      ...localLeadFields,
      ...jobSearchV3Fields,
      ...outputFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    if (items.length === 0) return [returnData];
    const cancelSignal = this.getExecutionCancelSignal();

    const resource = this.getNodeParameter("resource", 0);
    const operation = this.getNodeParameter("operation", 0);

    // Base URL for V1 API
    const baseUrl = "https://api.leadmagic.io";

    // Preserve item links for both single responses and bulk outputs.
    for (let i = 0; i < items.length; i++) {
      if (cancelSignal?.aborted) break;
      try {
        const mode = this.getNodeParameter("outputMode", i, "raw") as string;
        const selected =
          mode === "selected"
            ? this.getNodeParameter("outputFields", i, [])
            : [];
        const additional =
          mode === "selected"
            ? this.getNodeParameter("additionalOutputFields", i, "")
            : "";
        if (
          !Array.isArray(selected) ||
          selected.some((field) => typeof field !== "string") ||
          typeof additional !== "string"
        ) {
          throw new NodeOperationError(
            this.getNode(),
            "Output fields must be a list of names",
            { itemIndex: i },
          );
        }
        if (!["raw", "selected", "simplified"].includes(mode)) {
          throw new NodeOperationError(
            this.getNode(),
            "Choose a valid output mode",
            { itemIndex: i },
          );
        }
        const fields = [
          ...selected,
          ...additional
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean),
        ];
        if (mode === "selected" && fields.length === 0) {
          throw new NodeOperationError(
            this.getNode(),
            "Select at least one output field",
            { itemIndex: i },
          );
        }
        const formatResponse = (value: unknown) =>
          projectResponse(value, mode, fields) as IDataObject;
        const requestOptions: IHttpRequestOptions = {
          method: "POST",
          body: {},
          url: "",
          json: true,
          timeout: 30000,
          disableFollowRedirect: true,
        };

        // ==================== V3 SEARCH OPERATIONS ====================
        const spec = searchSpec(
          this,
          resource as string,
          operation as string,
          i,
        );
        if (spec) {
          const returnAll = this.getNodeParameter(
            "returnAll",
            i,
            false,
          ) as boolean;
          const limit = this.getNodeParameter("limit", i, 25) as number;
          const split = this.getNodeParameter(
            "splitIntoItems",
            i,
            true,
          ) as boolean;
          const { pages, records } = await runSearch.call(
            this,
            i,
            spec,
            returnAll,
            limit,
          );
          const outputs = split
            ? records.map(formatResponse)
            : pages.map(formatResponse);
          returnData.push(
            ...this.helpers.constructExecutionMetaData(
              this.helpers.returnJsonArray(outputs),
              { itemData: { item: i } },
            ),
          );
          continue;
        }

        // ==================== CREDIT OPERATIONS ====================
        if (resource === "credit") {
          if (operation === "getCredits") {
            requestOptions.url = `${baseUrl}/v1/credits`;
            requestOptions.method = "GET";
            requestOptions.body = undefined;
          }
        }

        // ==================== EMAIL OPERATIONS ====================
        else if (resource === "email") {
          if (operation === "validateEmail") {
            const inputMode = this.getNodeParameter("inputMode", i) as string;

            if (inputMode === "bulk") {
              // Handle bulk email validation
              const bulkEmails = this.getNodeParameter(
                "bulkEmails",
                i,
              ) as string;
              const emails = bulkEmails
                .split(/[\n,]+/)
                .map((email) => email.trim())
                .filter((email) => email.length > 0);

              if (emails.length === 0) {
                throw new NodeOperationError(
                  this.getNode(),
                  "Enter at least one email address",
                  { itemIndex: i },
                );
              }
              if (emails.length > 1000) {
                throw new NodeOperationError(
                  this.getNode(),
                  `Too many emails provided. Maximum allowed: 1000, provided: ${emails.length}`,
                  { itemIndex: i },
                );
              }

              // Process sequentially; no automatic retry of paid requests.
              for (
                let emailIndex = 0;
                emailIndex < emails.length;
                emailIndex++
              ) {
                if (cancelSignal?.aborted) break;
                const email = emails[emailIndex];

                const emailRequestOptions: IHttpRequestOptions = {
                  method: "POST",
                  url: `${baseUrl}/v1/people/email-validation`,
                  body: { email },
                  json: true,
                  timeout: 30000,
                  disableFollowRedirect: true,
                };

                try {
                  const emailResponse = await request.call(
                    this,
                    emailRequestOptions,
                    i,
                  );

                  const emailExecutionData =
                    this.helpers.constructExecutionMetaData(
                      this.helpers.returnJsonArray(
                        formatResponse(emailResponse),
                      ),
                      { itemData: { item: i } },
                    );

                  returnData.push(...emailExecutionData);

                  // Note: Rate limiting can be handled by n8n's native wait nodes
                } catch (emailError) {
                  if (this.continueOnFail()) {
                    const errorMessage = publicErrorMessage(emailError);
                    const errorExecutionData =
                      this.helpers.constructExecutionMetaData(
                        this.helpers.returnJsonArray({
                          error: errorMessage,
                          email,
                        }),
                        { itemData: { item: i } },
                      );
                    returnData.push(...errorExecutionData);
                  } else {
                    if (emailError instanceof NodeApiError) {
                      throw new NodeApiError(
                        this.getNode(),
                        {},
                        {
                          message: emailError.message,
                          description: emailError.description ?? undefined,
                          httpCode: emailError.httpCode ?? undefined,
                          itemIndex: i,
                        },
                      );
                    }
                    throw new NodeOperationError(
                      this.getNode(),
                      publicErrorMessage(emailError),
                      { itemIndex: i },
                    );
                  }
                }
              }
              continue; // Skip the normal processing for this item
            } else {
              // Handle single email validation
              const email = this.getNodeParameter("email", i) as string;
              const firstName = this.getNodeParameter(
                "first_name",
                i,
              ) as string;
              const lastName = this.getNodeParameter("last_name", i) as string;

              requestOptions.url = `${baseUrl}/v1/people/email-validation`;
              requestOptions.body = {
                email,
                ...(firstName && { first_name: firstName }),
                ...(lastName && { last_name: lastName }),
              };
            }
          } else if (operation === "findEmail") {
            const findBy = this.getNodeParameter("findBy", i, "name") as string;
            const allowMismatch = this.getNodeParameter(
              "allow_domain_mismatch",
              i,
              false,
            ) as boolean;
            requestOptions.url = `${baseUrl}/v1/people/email-finder`;
            if (findBy === "profile") {
              requestOptions.body = {
                profile_url: (
                  this.getNodeParameter("profile_url", i) as string
                ).trim(),
              };
            } else {
              const domain = (
                this.getNodeParameter("domain", i, "") as string
              ).trim();
              const companyName = (
                this.getNodeParameter("company_name", i, "") as string
              ).trim();
              if (!domain && !companyName) {
                throw new NodeOperationError(
                  this.getNode(),
                  "Enter a company domain or company name",
                  { itemIndex: i },
                );
              }
              requestOptions.body = {
                first_name: (
                  this.getNodeParameter("first_name", i) as string
                ).trim(),
                last_name: (
                  this.getNodeParameter("last_name", i) as string
                ).trim(),
                ...(domain && { domain }),
                ...(companyName && { company_name: companyName }),
              };
            }
            if (allowMismatch)
              (requestOptions.body as IDataObject).allow_domain_mismatch = true;
          } else if (operation === "findPersonalEmail") {
            const profileUrl = this.getNodeParameter(
              "profile_url",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/people/personal-email-finder`;
            requestOptions.body = {
              profile_url: profileUrl,
            };
          } else if (operation === "socialToWorkEmail") {
            const profileUrl = this.getNodeParameter(
              "profile_url",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/people/b2b-profile-email`;
            requestOptions.body = {
              profile_url: profileUrl,
            };
          }
        }

        // ==================== COMPANY OPERATIONS ====================
        else if (resource === "company") {
          if (operation === "searchCompany") {
            const companyDomain = this.getNodeParameter(
              "company_domain",
              i,
            ) as string;
            const companyName = this.getNodeParameter(
              "company_name",
              i,
            ) as string;
            const linkedinUrl = this.getNodeParameter(
              "linkedin_url",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/companies/company-search`;
            requestOptions.body = {
              company_domain: companyDomain,
              ...(companyName && { company_name: companyName }),
              ...(linkedinUrl && { profile_url: linkedinUrl }),
            };
          } else if (operation === "getCompanyFunding") {
            const companyDomain = this.getNodeParameter(
              "company_domain",
              i,
            ) as string;
            const companyName = this.getNodeParameter(
              "company_name",
              i,
            ) as string;
            const linkedinUrl = this.getNodeParameter(
              "linkedin_url",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/companies/company-funding`;
            requestOptions.body = {
              company_domain: companyDomain,
              ...(companyName && { company_name: companyName }),
              ...(linkedinUrl && { profile_url: linkedinUrl }),
            };
          } else if (operation === "getTechnographics") {
            // Technographics - Get company tech stack
            const companyDomain = this.getNodeParameter(
              "company_domain",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/companies/technographics`;
            requestOptions.body = {
              company_domain: companyDomain,
            };
          } else if (operation === "searchCompetitors") {
            // Competitors Search
            const searchMethod = this.getNodeParameter(
              "searchMethod",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/companies/competitors-search`;
            requestOptions.body = {};

            if (searchMethod === "domain") {
              const companyDomain = this.getNodeParameter(
                "company_domain",
                i,
              ) as string;
              requestOptions.body = { company_domain: companyDomain };
            } else if (searchMethod === "name") {
              const companyName = this.getNodeParameter(
                "company_name",
                i,
              ) as string;
              requestOptions.body = { company_name: companyName };
            } else if (searchMethod === "linkedin") {
              const profileUrl = this.getNodeParameter(
                "profile_url",
                i,
              ) as string;
              requestOptions.body = { profile_url: profileUrl };
            }
          }
        }

        // ==================== PROFILE OPERATIONS ====================
        else if (resource === "profile") {
          if (operation === "searchProfile") {
            const profileUrl = this.getNodeParameter(
              "profile_url",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/people/profile-search`;
            requestOptions.body = {
              profile_url: profileUrl,
            };
          } else if (operation === "emailToProfile") {
            const workEmail = this.getNodeParameter("work_email", i) as string;

            requestOptions.url = `${baseUrl}/v1/people/b2b-profile`;
            requestOptions.body = {
              work_email: workEmail,
            };
          } else if (operation === "findMobile") {
            const searchMethod = this.getNodeParameter(
              "searchMethod",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/people/mobile-finder`;
            requestOptions.body = {};

            if (searchMethod === "profile") {
              const profileUrl = this.getNodeParameter(
                "profile_url",
                i,
              ) as string;
              requestOptions.body = { profile_url: profileUrl };
            } else if (searchMethod === "workEmail") {
              const workEmail = this.getNodeParameter(
                "work_email",
                i,
              ) as string;
              requestOptions.body = { work_email: workEmail };
            } else if (searchMethod === "personalEmail") {
              const personalEmail = this.getNodeParameter(
                "personal_email",
                i,
              ) as string;
              requestOptions.body = { personal_email: personalEmail };
            }
          }
        }

        // ==================== PEOPLE OPERATIONS ====================
        else if (resource === "people") {
          if (operation === "findRole") {
            const jobTitle = this.getNodeParameter("job_title", i) as string;
            const searchMethod = this.getNodeParameter(
              "searchMethod",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/people/role-finder`;
            requestOptions.body = {
              job_title: jobTitle,
            };

            if (searchMethod === "name") {
              const companyName = this.getNodeParameter(
                "company_name",
                i,
              ) as string;
              (requestOptions.body as IDataObject).company_name = companyName;
            } else if (searchMethod === "domain") {
              const companyDomain = this.getNodeParameter(
                "company_domain",
                i,
              ) as string;
              (requestOptions.body as IDataObject).company_domain =
                companyDomain;
            } else if (searchMethod === "profile") {
              const companyProfileUrl = this.getNodeParameter(
                "company_profile_url",
                i,
              ) as string;
              (requestOptions.body as IDataObject).company_profile_url =
                companyProfileUrl;
            }
          } else if (operation === "findEmployees") {
            const companyName = this.getNodeParameter(
              "company_name",
              i,
            ) as string;
            const page = this.getNodeParameter("page", i) as number;
            const perPage = this.getNodeParameter("per_page", i) as number;

            if (page > 1) {
              throw new NodeOperationError(
                this.getNode(),
                "Employee Finder does not support page offsets. Use People Search for pagination.",
                { itemIndex: i },
              );
            }
            requestOptions.url = `${baseUrl}/v1/people/employee-finder`;
            requestOptions.body = {
              company_name: companyName,
              limit: perPage,
            };
          } else if (operation === "detectJobChange") {
            // Job Change Detector - Monitor career transitions
            const profileUrl = this.getNodeParameter(
              "profile_url",
              i,
            ) as string;
            const companyIdentifier = this.getNodeParameter(
              "companyIdentifier",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/people/job-change-detector`;
            requestOptions.body = {
              profile_url: profileUrl,
            };

            if (companyIdentifier === "domain") {
              const companyDomain = this.getNodeParameter(
                "company_domain",
                i,
              ) as string;
              (requestOptions.body as IDataObject).company_domain =
                companyDomain;
            } else if (companyIdentifier === "name") {
              const companyName = this.getNodeParameter(
                "company_name",
                i,
              ) as string;
              (requestOptions.body as IDataObject).company_name = companyName;
            }
          }
        }

        // ==================== JOB OPERATIONS ====================
        else if (resource === "job") {
          if (operation === "findJobs") {
            requestOptions.url = `${baseUrl}/v1/jobs/jobs-finder`;

            const body: Record<string, unknown> = {};

            const companyName = this.getNodeParameter(
              "company_name",
              i,
            ) as string;
            const companyWebsite = this.getNodeParameter(
              "company_website",
              i,
            ) as string;
            const jobTitle = this.getNodeParameter("job_title", i) as string;
            const location = this.getNodeParameter("location", i) as string;
            const experienceLevel = this.getNodeParameter(
              "experience_level",
              i,
            ) as string;
            const jobDescription = this.getNodeParameter(
              "job_description",
              i,
            ) as string;
            const countryId = this.getNodeParameter("country_id", i) as string;
            const regionId = this.getNodeParameter("region_id", i) as string;
            const industryId = this.getNodeParameter(
              "industry_id",
              i,
            ) as string;
            const companyTypeId = this.getNodeParameter(
              "company_type_id",
              i,
            ) as string;
            const jobTypeId = this.getNodeParameter("job_type_id", i) as string;
            const page = this.getNodeParameter("page", i) as number;
            const perPage = this.getNodeParameter("per_page", i) as number;

            if (companyName) body.company_name = companyName;
            if (companyWebsite) body.company_website = companyWebsite;
            if (jobTitle) body.job_title = jobTitle;
            if (location) body.location = location;
            if (experienceLevel) body.experience_level = experienceLevel;
            if (jobDescription) body.job_description = jobDescription;
            if (countryId) body.country_id = countryId;
            if (regionId) body.region_id = regionId;
            if (industryId) body.industry_id = industryId;
            if (companyTypeId) body.company_type_id = companyTypeId;
            if (jobTypeId) body.job_type_id = jobTypeId;
            if (page) body.page = page;
            if (perPage) body.per_page = perPage;

            requestOptions.body = body;
          } else if (operation === "getJobCountries") {
            requestOptions.method = "GET";
            requestOptions.url = `${baseUrl}/v1/jobs/countries`;
            requestOptions.body = undefined;
          } else if (operation === "getJobRegions") {
            // Get Job Regions
            requestOptions.method = "GET";
            requestOptions.url = `${baseUrl}/v1/jobs/regions`;
            requestOptions.body = undefined;
          } else if (operation === "getJobTypes") {
            requestOptions.method = "GET";
            requestOptions.url = `${baseUrl}/v1/jobs/job-types`;
            requestOptions.body = undefined;
          } else if (operation === "getJobIndustries") {
            // Get Job Industries
            requestOptions.method = "GET";
            requestOptions.url = `${baseUrl}/v1/jobs/industries`;
            requestOptions.body = undefined;
          } else if (operation === "getJobCompanyTypes") {
            // Get Job Company Types
            requestOptions.method = "GET";
            requestOptions.url = `${baseUrl}/v1/jobs/company-types`;
            requestOptions.body = undefined;
          }
        }

        // ==================== LOCAL LEAD OPERATIONS ====================
        else if (resource === "localLead") {
          if (operation === "getLocalLeadCategories") {
            requestOptions.method = "GET";
            requestOptions.url = `${baseUrl}/v3/local-leads/categories`;
            requestOptions.body = undefined;
            requestOptions.qs = clean(collection(this, "categoryFilters", i));
          }
        }

        // ==================== ADVERTISEMENT OPERATIONS ====================
        else if (resource === "advertisement") {
          if (operation === "searchGoogleAds") {
            const searchMethod = this.getNodeParameter(
              "searchMethod",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/ads/google-ads-search`;
            requestOptions.body = {};

            if (searchMethod === "domain") {
              const companyDomain = this.getNodeParameter(
                "company_domain",
                i,
              ) as string;
              requestOptions.body = { company_domain: companyDomain };
            } else if (searchMethod === "name") {
              const companyName = this.getNodeParameter(
                "company_name",
                i,
              ) as string;
              requestOptions.body = { company_name: companyName };
            }
          } else if (operation === "searchMetaAds") {
            const searchMethod = this.getNodeParameter(
              "searchMethod",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/ads/meta-ads-search`;
            requestOptions.body = {};

            if (searchMethod === "domain") {
              const companyDomain = this.getNodeParameter(
                "company_domain",
                i,
              ) as string;
              requestOptions.body = { company_domain: companyDomain };
            } else if (searchMethod === "name") {
              const companyName = this.getNodeParameter(
                "company_name",
                i,
              ) as string;
              requestOptions.body = { company_name: companyName };
            }
          } else if (operation === "searchB2BAds") {
            const searchMethod = this.getNodeParameter(
              "searchMethod",
              i,
            ) as string;

            requestOptions.url = `${baseUrl}/v1/ads/b2b-ads-search`;
            requestOptions.body = {};

            if (searchMethod === "domain") {
              const companyDomain = this.getNodeParameter(
                "company_domain",
                i,
              ) as string;
              requestOptions.body = { company_domain: companyDomain };
            } else if (searchMethod === "name") {
              const companyName = this.getNodeParameter(
                "company_name",
                i,
              ) as string;
              requestOptions.body = { company_name: companyName };
            }
          } else if (operation === "getB2BAdDetails") {
            const adId = this.getNodeParameter("ad_id", i) as string;

            requestOptions.url = `${baseUrl}/v1/ads/b2b-ads-details`;
            requestOptions.body = {
              ad_url: adId,
            };
          }
        }

        if (
          resource === "advertisement" &&
          operation !== "getB2BAdDetails" &&
          requestOptions.body
        ) {
          const adsLimit = this.getNodeParameter("adsLimit", i, 0) as number;
          if (adsLimit > 0)
            (requestOptions.body as IDataObject).limit = Math.min(
              adsLimit,
              100,
            );
        }

        if (!requestOptions.url) {
          throw new NodeOperationError(
            this.getNode(),
            "Unsupported LeadMagic operation",
            { itemIndex: i },
          );
        }

        const responseData = await request.call(this, requestOptions, i);

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(formatResponse(responseData)),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          const errorMessage = publicErrorMessage(error);
          const executionErrorData = this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray({ error: errorMessage }),
            { itemData: { item: i } },
          );
          returnData.push(...executionErrorData);
          continue;
        }
        if (error instanceof NodeApiError) {
          throw new NodeApiError(
            this.getNode(),
            {},
            {
              message: error.message,
              description: error.description ?? undefined,
              httpCode: error.httpCode ?? undefined,
              itemIndex: i,
            },
          );
        }
        throw new NodeOperationError(
          this.getNode(),
          publicErrorMessage(error),
          { itemIndex: i },
        );
      }
    }

    return [returnData];
  }
}
