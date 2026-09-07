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
        name: "Company Intelligence",
        value: "searchCompany",
        description:
          "Get detailed company info: employees, revenue, industry, social profiles",
        action: "Get company intelligence",
      },
      {
        name: "Funding & Financials",
        value: "getCompanyFunding",
        description:
          "Access funding rounds, investors, valuation, and financial data",
        action: "Get company funding data",
      },
      {
        name: "Technographics",
        value: "getTechnographics",
        description:
          "Get technology stack: frameworks, analytics, marketing tools",
        action: "Get company technographics",
      },
      {
        name: "Competitors Search",
        value: "searchCompetitors",
        description:
          "Find company competitors with detailed market intelligence",
        action: "Search company competitors",
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
    placeholder: "gong.io",
    description: "Company website domain (most accurate search method)",
    hint: "MOST ACCURATE: Domain provides highest quality results (95%+ accuracy)",
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
    placeholder: "Gong",
    description: "Company name (optional - helps improve accuracy)",
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
    placeholder: "https://www.example.com/company/gong-io/",
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
    placeholder: "Add search option",
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
    placeholder: "stripe.com",
    description: "Company website domain (most accurate search method)",
    hint: "MOST ACCURATE: Domain provides highest quality funding data (95%+ accuracy)",
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
    placeholder: "Stripe",
    description: "Company name (optional - helps improve accuracy)",
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
    placeholder: "https://www.example.com/company/stripe/",
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
    placeholder: "gong.io",
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
        name: "By Domain (Most Accurate)",
        value: "domain",
        description: "Search by company domain - recommended for best results",
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
    placeholder: "gong.io",
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
    placeholder: "Gong",
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
    placeholder: "https://www.example.com/company/gong-io",
    description: "The company profile URL to search competitors for",
  },
];
