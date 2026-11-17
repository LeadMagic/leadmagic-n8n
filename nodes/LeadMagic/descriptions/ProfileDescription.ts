import type { INodeProperties } from "n8n-workflow";

export const profileOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["profile"],
      },
    },
    options: [
      {
        name: "Enrich",
        value: "searchProfile",
        description:
          "Get a person's title, company, work history, and education from a profile URL",
        action: "Enrich a profile",
      },
      {
        name: "Find From Email",
        value: "emailToProfile",
        description:
          "Find a person's profile URL from a work or personal email",
        action: "Find a profile from an email",
      },
      {
        name: "Find Mobile",
        value: "findMobile",
        description: "Find a mobile number from a profile URL or email",
        action: "Find a mobile number",
      },
    ],
    default: "searchProfile",
  },
];

// Profile Search Fields
export const profileSearchFields: INodeProperties[] = [
  {
    displayName: "Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["searchProfile"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/in/jane-doe/",
    description: "Full URL of the B2B profile",
  },
];

// Email to Profile Fields
export const emailToProfileFields: INodeProperties[] = [
  {
    displayName: "Work Email",
    name: "work_email",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["emailToProfile"],
      },
    },
    default: "",
    placeholder: "e.g. person@example.com",
    description: "Work email address to find profile for",
  },
];

// Mobile Finder Fields
export const mobileFinderFields: INodeProperties[] = [
  {
    displayName: "Search Method",
    name: "searchMethod",
    type: "options",
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["findMobile"],
      },
    },
    options: [
      {
        name: "By Profile URL",
        value: "profile",
        description: "Search by profile URL",
      },
      {
        name: "By Work Email",
        value: "workEmail",
        description: "Search by work email address",
      },
      {
        name: "By Personal Email",
        value: "personalEmail",
        description: "Search by personal email address",
      },
    ],
    default: "profile",
    description: "How to search for the mobile number",
    hint: "A profile URL usually gives the best match",
  },
  {
    displayName: "Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["findMobile"],
        searchMethod: ["profile"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/in/jane-doe/",
    description: "B2B profile URL",
  },
  {
    displayName: "Work Email",
    name: "work_email",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["findMobile"],
        searchMethod: ["workEmail"],
      },
    },
    default: "",
    placeholder: "e.g. person@example.com",
    description: "Work email address",
  },
  {
    displayName: "Personal Email",
    name: "personal_email",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["findMobile"],
        searchMethod: ["personalEmail"],
      },
    },
    default: "",
    placeholder: "e.g. person@example.com",
    description: "Personal email address",
  },
];

export const peopleOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["people"],
      },
    },
    options: [
      {
        name: "Detect Job Change",
        value: "detectJobChange",
        description:
          "Check whether a person still works at the company you expect",
        action: "Detect a job change",
      },
      {
        name: "Find Employees",
        value: "findEmployees",
        description: "List employees of a company",
        action: "Find employees of a company",
      },
      {
        name: "Find Role",
        value: "findRole",
        description: "Find the person who holds a job title at a company",
        action: "Find a role holder",
      },
      {
        name: "Search",
        value: "searchPeople",
        description:
          "Search people by company, title, department, seniority, and location",
        action: "Search people",
      },
    ],
    default: "searchPeople",
  },
];

// Role Finder Fields
export const roleFinderFields: INodeProperties[] = [
  {
    displayName: "Job Title",
    name: "job_title",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["findRole"],
      },
    },
    default: "",
    placeholder: "e.g. Developer",
    description: "Job title or role to search for",
  },
  {
    displayName: "Search Method",
    name: "searchMethod",
    type: "options",
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["findRole"],
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
    ],
    default: "domain",
    description: "How to specify the company",
    hint: "A domain usually gives the best match",
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["findRole"],
        searchMethod: ["name"],
      },
    },
    default: "",
    placeholder: "e.g. Example Inc",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["findRole"],
        searchMethod: ["domain"],
      },
    },
    default: "",
    placeholder: "e.g. example.com",
  },
];

// Employee Finder Fields
const employeeShow = (by?: string) => ({
  show: {
    resource: ["people"],
    operation: ["findEmployees"],
    ...(by ? { employeeLookupBy: [by] } : {}),
  },
});

export const employeeFinderFields: INodeProperties[] = [
  {
    displayName: "Find By",
    name: "employeeLookupBy",
    type: "options",
    displayOptions: employeeShow(),
    options: [
      { name: "Company Domain", value: "domain" },
      { name: "Company Name", value: "name" },
    ],
    default: "name",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: employeeShow("domain"),
    default: "",
    placeholder: "e.g. example.com",
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    required: true,
    displayOptions: employeeShow("name"),
    default: "",
    placeholder: "e.g. Example Inc",
    description: "Company name to find employees for",
  },
  {
    displayName: "Limit",
    name: "per_page",
    type: "number",
    displayOptions: employeeShow(),
    default: 50,
    description: "Max number of results to return",
    typeOptions: {
      minValue: 1,
      maxValue: 1000,
    },
  },
];

export const jobChangeDetectorFields: INodeProperties[] = [
  {
    displayName: "Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["detectJobChange"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/in/jesseoue/",
    description: "Profile URL of the person to monitor",
    hint: "Monitor this person for job changes",
  },
  {
    displayName: "Company Identifier",
    name: "companyIdentifier",
    type: "options",
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["detectJobChange"],
      },
    },
    options: [
      {
        name: "Company Domain",
        value: "domain",
        description: "Match the expected employer by domain",
      },
      {
        name: "Company Name",
        value: "name",
        description: "Use company name",
      },
    ],
    default: "domain",
    description: "How to identify the expected company",
    hint: "Domain matching is case-insensitive",
  },
  {
    displayName: "Expected Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["detectJobChange"],
        companyIdentifier: ["domain"],
      },
    },
    default: "",
    placeholder: "e.g. leadmagic.io",
    description: "Domain of the company where you expect this person to work",
    hint: "The system will check if they still work here",
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
    displayName: "Expected Company Name",
    name: "company_name",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["people"],
        operation: ["detectJobChange"],
        companyIdentifier: ["name"],
      },
    },
    default: "",
    placeholder: "e.g. LeadMagic",
    description: "Name of the company where you expect this person to work",
  },
];
