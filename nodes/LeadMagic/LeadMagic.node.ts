import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
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

function publicErrorMessage(error: unknown): string {
	if (error instanceof NodeOperationError) return error.message;
	const status = typeof error === "object" && error !== null
		? (error as { statusCode?: number; httpCode?: number }).statusCode ?? (error as { httpCode?: number }).httpCode
		: undefined;
	return status ? `LeadMagic request failed (HTTP ${Number(status)})` : "LeadMagic request failed; check credentials, inputs, and account limits";
}

export class LeadMagic implements INodeType {
	description: INodeTypeDescription = {
		displayName: "LeadMagic",
		name: "leadMagic",
		icon: "file:leadmagic.png",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			"B2B data enrichment and lead generation with email finding, company intelligence, profile enrichment, technographics, and job change detection",
		defaults: {
			name: "LeadMagic",
		},
		inputs: ["main"],
		outputs: ["main"],
		// Note: usableAsTool requires n8n-workflow >= 1.x newer versions
		// Uncomment when upgrading: usableAsTool: true,
		credentials: [
			{
				name: "leadMagicApi",
				required: true,
			},
		],
		requestDefaults: {
			baseURL: "https://api.leadmagic.io",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		},
		properties: [
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				options: [
					{
						name: "📧 Email",
						value: "email",
						description:
							"Find work emails or validate emails from an existing list",
					},
					{
						name: "🏢 Company",
						value: "company",
						description:
							"Company intelligence, funding, technographics, and competitors",
					},
					{
						name: "👤 Profile",
						value: "profile",
						description:
							"Professional profile enrichment and contact lookups",
					},
					{
						name: "👥 Person",
						value: "people",
						description:
							"🔍 Find employees, roles & detect job changes (1-3 credits)",
					},
					{
						name: "💼 Job",
						value: "job",
						description:
							"📋 Job posting discovery & recruitment intelligence (1 credit)",
					},
					{
						name: "📱 Advertisement",
						value: "advertisement",
						description:
							"📊 Competitive ad intelligence across platforms (1 credit)",
					},
					{
						name: "💳 Credit",
						value: "credit",
						description: "📈 API usage & credit management (free)",
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter("resource", 0);
		const operation = this.getNodeParameter("operation", 0);

		// Base URL for V1 API
		const baseUrl = "https://api.leadmagic.io";

		// Handle single item processing (bulk mode will be handled in templates)
		for (let i = 0; i < items.length; i++) {
			try {
				const requestOptions: IHttpRequestOptions = {
					method: "POST",
					body: {},
					url: "",
					json: true,
					timeout: 30000,
					disableFollowRedirect: true,
				};

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

						if (emails.length > 1000) {
							throw new NodeOperationError(
								this.getNode(),
								`Too many emails provided. Maximum allowed: 1000, provided: ${emails.length}`,
								{ itemIndex: i },
							);
						}

							// Process each email with rate limiting
							for (
								let emailIndex = 0;
								emailIndex < emails.length;
								emailIndex++
							) {
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
									const emailResponse =
										await this.helpers.httpRequestWithAuthentication.call(
											this,
											"leadMagicApi",
											emailRequestOptions,
										);

								const emailExecutionData =
									this.helpers.constructExecutionMetaData(
										this.helpers.returnJsonArray(emailResponse as IDataObject),
										{ itemData: { item: i } },
									);

									returnData.push(...emailExecutionData);

									// Note: Rate limiting can be handled by n8n's native wait nodes
								} catch (emailError) {
									if (this.continueOnFail()) {
										const errorMessage =
											publicErrorMessage(emailError);
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
										throw new NodeOperationError(this.getNode(), publicErrorMessage(emailError), { itemIndex: i });
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
						const firstName = this.getNodeParameter("first_name", i) as string;
						const lastName = this.getNodeParameter("last_name", i) as string;
						const domain = this.getNodeParameter("domain", i) as string;
						const companyName = this.getNodeParameter(
							"company_name",
							i,
						) as string;

						requestOptions.url = `${baseUrl}/v1/people/email-finder`;
						requestOptions.body = {
							first_name: firstName,
							last_name: lastName,
							...(domain && { domain }),
							...(companyName && { company_name: companyName }),
						};
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
						// 🆕 NEW: Technographics - Get company tech stack
						const companyDomain = this.getNodeParameter(
							"company_domain",
							i,
						) as string;

						requestOptions.url = `${baseUrl}/v1/companies/technographics`;
						requestOptions.body = {
							company_domain: companyDomain,
						};
					} else if (operation === "searchCompetitors") {
						// 🆕 NEW: Competitors Search
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
							requestOptions.body.company_name = companyName;
						} else if (searchMethod === "domain") {
							const companyDomain = this.getNodeParameter(
								"company_domain",
								i,
							) as string;
							requestOptions.body.company_domain = companyDomain;
						} else if (searchMethod === "profile") {
							const companyProfileUrl = this.getNodeParameter(
								"company_profile_url",
								i,
							) as string;
							requestOptions.body.company_profile_url = companyProfileUrl;
						}
					} else if (operation === "findEmployees") {
						const companyName = this.getNodeParameter(
							"company_name",
							i,
						) as string;
						const page = this.getNodeParameter("page", i) as number;
						const perPage = this.getNodeParameter("per_page", i) as number;

						if (page > 1) {
							throw new NodeOperationError(this.getNode(), "Employee Finder does not support page offsets. Use People Search for pagination.", { itemIndex: i });
						}
						requestOptions.url = `${baseUrl}/v1/people/employee-finder`;
						requestOptions.body = {
							company_name: companyName,
							limit: perPage,
						};
					} else if (operation === "detectJobChange") {
						// 🆕 NEW: Job Change Detector - Monitor career transitions (3 credits)
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
							requestOptions.body.company_domain = companyDomain;
						} else if (companyIdentifier === "name") {
							const companyName = this.getNodeParameter(
								"company_name",
								i,
							) as string;
							requestOptions.body.company_name = companyName;
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
						// 🆕 NEW: Get Job Regions
						requestOptions.method = "GET";
						requestOptions.url = `${baseUrl}/v1/jobs/regions`;
						requestOptions.body = undefined;
					} else if (operation === "getJobTypes") {
						requestOptions.method = "GET";
						requestOptions.url = `${baseUrl}/v1/jobs/job-types`;
						requestOptions.body = undefined;
					} else if (operation === "getJobIndustries") {
						// 🆕 NEW: Get Job Industries
						requestOptions.method = "GET";
						requestOptions.url = `${baseUrl}/v1/jobs/industries`;
						requestOptions.body = undefined;
					} else if (operation === "getJobCompanyTypes") {
						// 🆕 NEW: Get Job Company Types
						requestOptions.method = "GET";
						requestOptions.url = `${baseUrl}/v1/jobs/company-types`;
						requestOptions.body = undefined;
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

				if (!requestOptions.url) {
					throw new NodeOperationError(this.getNode(), "Unsupported LeadMagic operation", { itemIndex: i });
				}

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					"leadMagicApi",
					requestOptions,
				);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData as IDataObject),
				{ itemData: { item: i } },
			);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage =
						publicErrorMessage(error);
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: errorMessage }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw new NodeOperationError(this.getNode(), publicErrorMessage(error), { itemIndex: i });
			}
		}

		return [returnData];
	}
}
