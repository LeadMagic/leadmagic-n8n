import type { INodeProperties } from "n8n-workflow";

/**
 * Shared field builders for the V3 search endpoints (People Search,
 * Company Search, Company Lookalike, Local Leads Search, Job Search).
 */

type Show = { resource: string[]; operation: string[] };

const show = (resource: string, operation: string): Show => ({
  resource: [resource],
  operation: [operation],
});

/** Return All / Limit / Split Into Items, following n8n list conventions. */
export function paginationFields(
  resource: string,
  operation: string,
  maxPageSize: number,
  recordLabel: string,
): INodeProperties[] {
  return [
    {
      displayName: "Return All",
      name: "returnAll",
      type: "boolean",
      displayOptions: { show: show(resource, operation) },
      default: false,
      description: "Whether to return all results or only up to a given limit",
      hint: `Paid plans are charged per ${recordLabel} returned. Set a limit unless your plan includes search.`,
    },
    {
      displayName: "Limit",
      name: "limit",
      type: "number",
      displayOptions: {
        show: { ...show(resource, operation), returnAll: [false] },
      },
      typeOptions: { minValue: 1 },
      default: 50,
      description: "Max number of results to return",
      hint: `Fetched ${maxPageSize} per request`,
    },
    {
      displayName: "Split Into Items",
      name: "splitIntoItems",
      type: "boolean",
      displayOptions: { show: show(resource, operation) },
      default: true,
      description: `Whether to output one item per ${recordLabel}. Turn off to output each raw API page (including metadata such as warnings and ignored filters).`,
    },
  ];
}

/** JSON escape hatch merged into the request body. */
export function additionalJsonField(
  resource: string,
  operation: string,
  example: string,
): INodeProperties {
  return {
    displayName: "Additional Request Fields (JSON)",
    name: "additionalJson",
    type: "json",
    displayOptions: { show: show(resource, operation) },
    default: "{}",
    placeholder: `e.g. ${example}`,
    description:
      "Any other documented request fields, as a JSON object. Nested filter objects are merged with the fields above; this JSON wins on conflicts.",
  };
}

const companyFilterOptions: INodeProperties[] = [
  {
    displayName: "Founded After (Year)",
    name: "founded_after",
    type: "number",
    default: 2015,
  },
  {
    displayName: "Has Funding",
    name: "has_funding",
    type: "boolean",
    default: true,
    description: "Whether the company has recorded funding",
  },
  {
    displayName: "HQ Country Codes",
    name: "country_codes",
    type: "string",
    default: "",
    placeholder: "e.g. US, CA, GB",
    description: "Comma-separated ISO country codes of the headquarters",
  },
  {
    displayName: "Industries",
    name: "industries",
    type: "string",
    default: "",
    placeholder: "e.g. Software Development, IT Services and IT Consulting",
    description: "Comma-separated industry labels",
  },
  {
    displayName: "Max Employees",
    name: "max_employees",
    type: "number",
    typeOptions: { minValue: 1 },
    default: 500,
  },
  {
    displayName: "Min Employees",
    name: "min_employees",
    type: "number",
    typeOptions: { minValue: 1 },
    default: 50,
  },
  {
    displayName: "Tech Stack",
    name: "tech_stack",
    type: "string",
    default: "",
    placeholder: "e.g. HubSpot, Salesforce",
    description:
      "Comma-separated technologies; every listed technology must match (max 50)",
  },
];

function companyFiltersField(
  resource: string,
  operation: string,
): INodeProperties {
  return {
    displayName: "Company Filters",
    name: "companyFilters",
    type: "collection",
    placeholder: "e.g. Add Company Filter",
    displayOptions: { show: show(resource, operation) },
    default: {},
    options: companyFilterOptions,
  };
}

// ==================== PEOPLE SEARCH ====================

export const peopleSearchFields: INodeProperties[] = [
  {
    displayName:
      "Search returns profiles, not emails or phones. Chain Email > Find Work Address or Profile > Find Mobile on the people you keep.",
    name: "peopleSearchNotice",
    type: "notice",
    displayOptions: { show: show("people", "searchPeople") },
    default: "",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    displayOptions: { show: show("people", "searchPeople") },
    default: "",
    placeholder: "e.g. example.com",
    description:
      "Limit results to one employer. Leave empty to search across companies.",
  },
  {
    displayName: "Job Titles",
    name: "titles",
    type: "string",
    displayOptions: { show: show("people", "searchPeople") },
    default: "",
    placeholder: "e.g. Head of Sales, VP Sales",
    description: "Comma-separated title terms (up to 12)",
  },
  {
    displayName: "People Filters",
    name: "peopleFilters",
    type: "collection",
    placeholder: "e.g. Add People Filter",
    displayOptions: { show: show("people", "searchPeople") },
    default: {},
    options: [
      {
        displayName: "Company Name",
        name: "company_name",
        type: "string",
        default: "",
        description: "Employer name, when you don't know the domain",
      },
      {
        displayName: "Company Profile URL",
        name: "linkedin_url",
        type: "string",
        default: "",
        description: "Employer's B2B company profile URL or slug",
      },
      {
        displayName: "Departments",
        name: "contact_job_function",
        type: "multiOptions",
        default: [],
        options: [
          { name: "Customer Success", value: "Customer Success" },
          { name: "Engineering", value: "Engineering" },
          { name: "Finance", value: "Finance" },
          {
            name: "General Business & Management",
            value: "General Business & Management",
          },
          { name: "Healthcare", value: "Healthcare" },
          { name: "Human Resources", value: "Human Resources" },
          { name: "Information Technology", value: "Information Technology" },
          { name: "Legal", value: "Legal" },
          {
            name: "Manufacturing & Production",
            value: "Manufacturing & Production",
          },
          { name: "Marketing", value: "Marketing" },
          { name: "Operations", value: "Operations" },
          { name: "Research", value: "Research" },
          { name: "Sales", value: "Sales" },
        ],
      },
      {
        displayName: "Free-Text Query",
        name: "query",
        type: "string",
        default: "",
        placeholder: "e.g. revenue operations leader",
      },
      {
        displayName: "Include Company Records",
        name: "include_company",
        type: "boolean",
        default: true,
        description: "Whether to attach the employer record to each person",
      },
      {
        displayName: "Job Levels",
        name: "contact_job_level",
        type: "string",
        default: "",
        placeholder: "e.g. VP, Director",
        description: "Comma-separated exact levels",
      },
      {
        displayName: "Minimum Seniority",
        name: "min_seniority",
        type: "options",
        default: 3,
        options: [
          { name: "Staff and Above", value: 1 },
          { name: "Manager and Above", value: 2 },
          { name: "Director and Above", value: 3 },
          { name: "VP and Above", value: 4 },
          { name: "C-Team Only", value: 5 },
        ],
      },
      {
        displayName: "Person Country Codes",
        name: "contact_country_code",
        type: "string",
        default: "",
        placeholder: "e.g. US, GB",
        description: "Comma-separated ISO codes of where the person lives",
      },
      {
        displayName: "Roles",
        name: "roles",
        type: "string",
        default: "",
        placeholder: "e.g. RevOps",
        description: "Comma-separated role terms combined with the titles",
      },
    ],
  },
  companyFiltersField("people", "searchPeople"),
  additionalJsonField(
    "people",
    "searchPeople",
    '{"people_filters": {"is_sales": true}}',
  ),
  ...paginationFields("people", "searchPeople", 50, "person"),
];

// ==================== COMPANY SEARCH ====================

export const companyDiscoveryFields: INodeProperties[] = [
  {
    displayName: "Search Query",
    name: "query",
    type: "string",
    displayOptions: { show: show("company", "searchCompanies") },
    default: "",
    placeholder: "e.g. B2B payments platform",
    description:
      "Free-text description of the companies to find. Combine with filters, or leave empty and use filters only.",
  },
  {
    displayName: "Company Lookup",
    name: "companyLookup",
    type: "collection",
    placeholder: "e.g. Add Identifier",
    displayOptions: { show: show("company", "searchCompanies") },
    default: {},
    description: "Look up one specific company instead of discovering many",
    options: [
      {
        displayName: "Company Domain",
        name: "company_domain",
        type: "string",
        default: "",
        placeholder: "e.g. example.com",
      },
      {
        displayName: "Company Name",
        name: "company_name",
        type: "string",
        default: "",
      },
      {
        displayName: "Company Profile URL",
        name: "linkedin_url",
        type: "string",
        default: "",
      },
    ],
  },
  companyFiltersField("company", "searchCompanies"),
  additionalJsonField(
    "company",
    "searchCompanies",
    '{"company_filters": {"crm_tech": ["HubSpot"]}}',
  ),
  ...paginationFields("company", "searchCompanies", 50, "company"),
];

// ==================== COMPANY LOOKALIKE ====================

export const lookalikeFields: INodeProperties[] = [
  {
    displayName: "Seed Company Domain",
    name: "company_domain",
    type: "string",
    displayOptions: { show: show("company", "findLookalikes") },
    default: "",
    placeholder: "e.g. example.com",
    description:
      "Domain of a company you want more of. Use a domain, a name, or a description.",
  },
  {
    displayName: "Seed Options",
    name: "seedOptions",
    type: "collection",
    placeholder: "e.g. Add Seed Option",
    displayOptions: { show: show("company", "findLookalikes") },
    default: {},
    options: [
      {
        displayName: "Seed Company Name",
        name: "company_name",
        type: "string",
        default: "",
      },
      {
        displayName: "Seed Description",
        name: "description",
        type: "string",
        typeOptions: { rows: 3 },
        default: "",
        placeholder: "e.g. Vertical SaaS for independent veterinary clinics",
      },
    ],
  },
  companyFiltersField("company", "findLookalikes"),
  additionalJsonField(
    "company",
    "findLookalikes",
    '{"company_filters": {"revenue_ranges": ["$10M to $50M"]}}',
  ),
  ...paginationFields("company", "findLookalikes", 100, "company"),
];

// ==================== LOCAL LEADS ====================

export const localLeadOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["localLead"] } },
    options: [
      {
        name: "Get Categories",
        value: "getLocalLeadCategories",
        description:
          "List the business categories used by Local Leads search (free)",
        action: "Get local lead categories",
      },
      {
        name: "Search",
        value: "searchLocalLeads",
        description:
          "Find local businesses by place, category, name, or map radius, with phones, emails, and websites",
        action: "Search local leads",
      },
    ],
    default: "searchLocalLeads",
  },
];

export const localLeadFields: INodeProperties[] = [
  {
    displayName: "Country Code",
    name: "country",
    type: "string",
    displayOptions: { show: show("localLead", "searchLocalLeads") },
    default: "US",
    placeholder: "e.g. US",
    description:
      "Two-letter country code (comma-separate up to 5). Each search needs a country, a map point, a domain, an email, or a business name.",
  },
  {
    displayName: "Category",
    name: "category_contains",
    type: "string",
    displayOptions: { show: show("localLead", "searchLocalLeads") },
    default: "",
    placeholder: "e.g. plumb",
    description:
      'Text contained in the category name ("roof" matches roofing). Use Get Categories for exact names.',
  },
  {
    displayName: "Filters",
    name: "localFilters",
    type: "collection",
    placeholder: "e.g. Add Filter",
    displayOptions: { show: show("localLead", "searchLocalLeads") },
    default: {},
    options: [
      {
        displayName: "Business Name Contains",
        name: "name",
        type: "string",
        default: "",
      },
      {
        displayName: "City",
        name: "city",
        type: "string",
        default: "",
        placeholder: "e.g. Austin",
      },
      {
        displayName: "Exact Category",
        name: "category",
        type: "string",
        default: "",
        placeholder: "e.g. plumber",
      },
      {
        displayName: "Exclude Closed",
        name: "exclude_closed",
        type: "boolean",
        default: true,
        description: "Whether to keep only open and unknown-status listings",
      },
      {
        displayName: "Has Business Email",
        name: "has_business_email",
        type: "boolean",
        default: true,
        description: "Whether the listing must have an email on its own domain",
      },
      {
        displayName: "Has Email",
        name: "has_email",
        type: "boolean",
        default: true,
        description: "Whether the listing must have an email",
      },
      {
        displayName: "Has Phone",
        name: "has_phone",
        type: "boolean",
        default: true,
        description: "Whether the listing must have a phone number",
      },
      {
        displayName: "Has Website",
        name: "has_website",
        type: "boolean",
        default: true,
        description: "Whether the listing must have a website",
      },
      {
        displayName: "Latitude",
        name: "lat",
        type: "number",
        typeOptions: { minValue: -90, maxValue: 90, numberPrecision: 6 },
        default: 0,
        description:
          "Point search latitude; send with Longitude. Results come nearest first.",
      },
      {
        displayName: "Longitude",
        name: "lon",
        type: "number",
        typeOptions: { minValue: -180, maxValue: 180, numberPrecision: 6 },
        default: 0,
      },
      {
        displayName: "Minimum Confidence",
        name: "min_confidence",
        type: "number",
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        default: 0.7,
      },
      {
        displayName: "Postal Code",
        name: "postal_code",
        type: "string",
        default: "",
        placeholder: "e.g. 78701",
      },
      {
        displayName: "Radius (Meters)",
        name: "radius_m",
        type: "number",
        typeOptions: { minValue: 1, maxValue: 500000 },
        default: 10000,
        description: "Point search radius",
      },
      {
        displayName: "Region Code",
        name: "region_code",
        type: "string",
        default: "",
        placeholder: "e.g. TX",
      },
      {
        displayName: "Website Domain",
        name: "website_domain",
        type: "string",
        default: "",
        placeholder: "e.g. example.com",
      },
    ],
  },
  additionalJsonField(
    "localLead",
    "searchLocalLeads",
    '{"category_group": "home_services"}',
  ),
  ...paginationFields("localLead", "searchLocalLeads", 25, "business"),
  {
    displayName: "Category Filters",
    name: "categoryFilters",
    type: "collection",
    placeholder: "e.g. Add Filter",
    displayOptions: { show: show("localLead", "getLocalLeadCategories") },
    default: {},
    options: [
      {
        displayName: "Category Group",
        name: "category_group",
        type: "string",
        default: "",
        placeholder: "e.g. food_and_drink",
      },
      {
        displayName: "Contains Text",
        name: "q",
        type: "string",
        default: "",
        placeholder: "e.g. dent",
      },
      {
        displayName: "Country Code",
        name: "country",
        type: "string",
        default: "",
        placeholder: "e.g. US",
      },
      {
        displayName: "Limit",
        name: "limit",
        type: "number",
        typeOptions: { minValue: 1, maxValue: 1000 },
        default: 50,
        description: "Max number of results to return",
      },
    ],
  },
];

// ==================== JOB SEARCH (V3) ====================

export const jobSearchV3Fields: INodeProperties[] = [
  {
    displayName: "Job Titles",
    name: "titlesInclude",
    type: "string",
    displayOptions: { show: show("job", "searchJobs") },
    default: "",
    placeholder: "e.g. Account Executive, SDR",
    description: "Comma-separated titles to include",
  },
  {
    displayName: "Filters",
    name: "jobFilters",
    type: "collection",
    placeholder: "e.g. Add Filter",
    displayOptions: { show: show("job", "searchJobs") },
    default: {},
    options: [
      {
        displayName: "Companies",
        name: "companies",
        type: "string",
        default: "",
        placeholder: "e.g. example.com, Example Inc",
        description: "Comma-separated company names or domains to include",
      },
      {
        displayName: "Countries",
        name: "countries",
        type: "string",
        default: "",
        placeholder: "e.g. US, GB",
        description: "Comma-separated countries",
      },
      {
        displayName: "Exclude Titles",
        name: "titlesExclude",
        type: "string",
        default: "",
        placeholder: "e.g. Intern",
      },
      {
        displayName: "Include Description",
        name: "includeDescription",
        type: "boolean",
        default: false,
        description: "Whether to include job description text (slower)",
      },
      {
        displayName: "Posted Within (Days)",
        name: "postedWithin",
        type: "number",
        typeOptions: { minValue: 1 },
        default: 30,
      },
      {
        displayName: "Remote",
        name: "hasRemote",
        type: "boolean",
        default: true,
        description: "Whether to keep only jobs that offer remote work",
      },
      {
        displayName: "Search Mode",
        name: "mode",
        type: "options",
        default: "fast",
        options: [
          { name: "Fast", value: "fast" },
          { name: "Deep (Broader Text Matching)", value: "deep" },
        ],
      },
      {
        displayName: "Seniority",
        name: "seniority",
        type: "string",
        default: "",
        placeholder: "e.g. senior, executive",
        description: "Comma-separated seniority levels",
      },
    ],
  },
  additionalJsonField("job", "searchJobs", '{"salary": {"min_usd": 100000}}'),
  ...paginationFields("job", "searchJobs", 50, "job"),
];
