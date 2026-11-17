import type { INodeProperties } from "n8n-workflow";

export const companyOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["company"],
      },
    },
    options: [
      {
        name: "Enrich",
        value: "searchCompany",
        description:
          "Get firmographics for one company by domain, name, or profile URL",
        action: "Enrich a company",
      },
      {
        name: "Find Competitors",
        value: "searchCompetitors",
        description: "List competitors of a company",
        action: "Find competitors of a company",
      },
      {
        name: "Find Lookalikes",
        value: "findLookalikes",
        description:
          "Find companies similar to a seed domain, name, or description",
        action: "Find lookalike companies",
      },
      {
        name: "Get Funding",
        value: "getCompanyFunding",
        description: "Get funding rounds, investors, acquisitions, and news",
        action: "Get company funding",
      },
      {
        name: "Get Technographics",
        value: "getTechnographics",
        description: "Get the technologies a company uses",
        action: "Get company technographics",
      },
      {
        name: "Search",
        value: "searchCompanies",
        description:
          "Discover companies by industry, size, location, funding, and tech stack",
        action: "Search companies",
      },
    ],
    default: "searchCompany",
  },
];

// Company Search Fields
export const companySearchFields: INodeProperties[] = [
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompany"],
      },
    },
    default: "",
    placeholder: "e.g. gong.io",
    description: "Company website domain",
    hint: "Use the bare domain, e.g. example.com",
    typeOptions: {
      validation: [
        {
          type: "regex",
          properties: {
            regex: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$",
            errorMessage: "Please enter a valid domain (e.g., company.com)",
          },
        },
      ],
    },
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompany"],
      },
    },
    default: "",
    placeholder: "e.g. Gong",
    description: "Company name (optional)",
    hint: "Optional: Providing company name along with domain improves data quality",
  },
  {
    displayName: "Company Profile URL",
    name: "linkedin_url",
    type: "string",
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompany"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/company/gong-io/",
    description: "Company profile URL (optional - enhances results)",
    hint: "Optional: Profile URL provides additional verification and data enrichment",
  },
  {
    displayName: "Search Options",
    name: "searchOptions",
    type: "collection",
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompany"],
      },
    },
    default: {},
    placeholder: "e.g. Add search option",
    description: "Advanced search options for better results",
    options: [
      {
        displayName: "Include Employee Count",
        name: "includeEmployeeCount",
        type: "boolean",
        default: true,
        description: "Whether to include detailed employee count information",
      },
      {
        displayName: "Include Funding Data",
        name: "includeFunding",
        type: "boolean",
        default: true,
        description:
          "Whether to include basic funding information (use Funding operation for detailed data)",
      },
      {
        displayName: "Include Social Profiles",
        name: "includeSocialProfiles",
        type: "boolean",
        default: true,
        description: "Whether to include social media profiles and URLs",
      },
    ],
  },
];

// Company Funding Fields
export const companyFundingFields: INodeProperties[] = [
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["getCompanyFunding"],
      },
    },
    default: "",
    placeholder: "e.g. stripe.com",
    description: "Company website domain",
    hint: "Use the bare domain, e.g. example.com",
    typeOptions: {
      validation: [
        {
          type: "regex",
          properties: {
            regex: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$",
            errorMessage: "Please enter a valid domain (e.g., company.com)",
          },
        },
      ],
    },
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["getCompanyFunding"],
      },
    },
    default: "",
    placeholder: "e.g. Stripe",
    description: "Company name (optional)",
    hint: "Optional: Providing company name along with domain improves data quality",
  },
  {
    displayName: "Company Profile URL",
    name: "linkedin_url",
    type: "string",
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["getCompanyFunding"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/company/stripe/",
    description: "Company profile URL (optional - enhances results)",
    hint: "Optional: Profile URL provides additional verification for funding data",
  },
];

// Technographics Fields
export const technographicsFields: INodeProperties[] = [
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["getTechnographics"],
      },
    },
    default: "",
    placeholder: "e.g. gong.io",
    description: "Company website domain to analyze technology stack",
    hint: "Discover frameworks, analytics tools, marketing tech, and more",
    typeOptions: {
      validation: [
        {
          type: "regex",
          properties: {
            regex: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$",
            errorMessage: "Please enter a valid domain (e.g., company.com)",
          },
        },
      ],
    },
  },
];

// Competitors Search Fields
export const competitorsSearchFields: INodeProperties[] = [
  {
    displayName: "Search Method",
    name: "searchMethod",
    type: "options",
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompetitors"],
      },
    },
    options: [
      {
        name: "By Domain",
        value: "domain",
        description: "Search by company domain",
      },
      {
        name: "By Company Name",
        value: "name",
        description: "Search by company name",
      },
      {
        name: "By Profile URL",
        value: "linkedin",
        description: "Search by company profile URL",
      },
    ],
    default: "domain",
    description: "How to identify the company for competitor search",
    hint: "Domain search provides highest quality competitor data",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompetitors"],
        searchMethod: ["domain"],
      },
    },
    default: "",
    placeholder: "e.g. gong.io",
    description: "Company website domain",
    typeOptions: {
      validation: [
        {
          type: "regex",
          properties: {
            regex: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$",
            errorMessage: "Please enter a valid domain (e.g., company.com)",
          },
        },
      ],
    },
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompetitors"],
        searchMethod: ["name"],
      },
    },
    default: "",
    placeholder: "e.g. Gong",
    description: "Company name to find competitors for",
  },
  {
    displayName: "Company Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["company"],
        operation: ["searchCompetitors"],
        searchMethod: ["linkedin"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/company/gong-io",
    description: "The company profile URL to search competitors for",
  },
];
