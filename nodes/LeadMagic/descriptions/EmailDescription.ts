import type { INodeProperties } from "n8n-workflow";

export const emailOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["email"],
      },
    },
    options: [
      {
        name: "Find Personal Address",
        value: "findPersonalEmail",
        description: "Find personal email addresses from a profile URL",
        action: "Find a personal email",
      },
      {
        name: "Find Work Address",
        value: "findEmail",
        description:
          "Find a verified work email from a name and company, or from a profile URL",
        action: "Find a work email",
      },
      {
        name: "Find Work Address From Profile",
        value: "socialToWorkEmail",
        description:
          "Find a work email from a profile URL (Find Work Address with a profile URL is usually cheaper)",
        action: "Find a work email from a profile",
      },
      {
        name: "Validate",
        value: "validateEmail",
        description: "Check whether existing email addresses are deliverable",
        action: "Validate an email",
      },
    ],
    default: "findEmail",
  },
];

// Email Validation Fields
export const emailValidateFields: INodeProperties[] = [
  {
    displayName: "Input Mode",
    name: "inputMode",
    type: "options",
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["validateEmail"],
      },
    },
    options: [
      {
        name: "Single Email",
        value: "single",
        description: "Validate one email address",
      },
      {
        name: "Bulk Emails",
        value: "bulk",
        description: "Validate multiple emails (up to 1000)",
      },
    ],
    default: "single",
    description: "Choose how to input emails",
  },
  {
    displayName: "Email Address",
    name: "email",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["validateEmail"],
        inputMode: ["single"],
      },
    },
    default: "",
    placeholder: "e.g. person@example.com",
    description:
      "Email address to validate for deliverability and company information",
    hint: "Get delivery status, company data, and social profiles",
    typeOptions: {
      validation: [
        {
          type: "regex",
          properties: {
            regex: "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$",
            errorMessage: "Please enter a valid email address format",
          },
        },
      ],
    },
  },
  {
    displayName: "Bulk Emails",
    name: "bulkEmails",
    type: "string",
    typeOptions: {
      rows: 10,
    },
    required: true,
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["validateEmail"],
        inputMode: ["bulk"],
      },
    },
    default: "",
    placeholder:
      "person@example.com\nsecond@example.com\nthird@example.com\n...",
    description:
      "Enter emails separated by new lines or commas (up to 1000 emails)",
    hint: "Each address is validated with its own request; the limit depends on your plan",
  },
  {
    displayName: "First Name",
    name: "first_name",
    type: "string",
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["validateEmail"],
        inputMode: ["single"],
      },
    },
    default: "",
    description: "First name of the person (optional)",
  },
  {
    displayName: "Last Name",
    name: "last_name",
    type: "string",
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["validateEmail"],
        inputMode: ["single"],
      },
    },
    default: "",
    description: "Last name of the person (optional)",
  },
  {
    displayName: "Advanced Options",
    name: "advancedOptions",
    type: "collection",
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["validateEmail"],
      },
    },
    default: {},
    placeholder: "e.g. Add advanced option",
    description: "Optional advanced settings for email validation",
    options: [
      {
        displayName: "Return Format",
        name: "returnFormat",
        type: "options",
        options: [
          {
            name: "Full Details",
            value: "full",
            description: "Return all available data (default)",
          },
          {
            name: "Minimal",
            value: "minimal",
            description: "Return only validation status",
          },
          {
            name: "Company Focus",
            value: "company",
            description: "Focus on company information",
          },
        ],
        default: "full",
        description: "Choose what data to return",
      },
      {
        displayName: "Rate Limit Delay (Ms)",
        name: "rateLimitDelay",
        type: "number",
        default: 200,
        description:
          "Delay between requests for bulk processing (300 req/min = 200ms)",
        typeOptions: {
          minValue: 100,
          maxValue: 5000,
        },
      },
    ],
  },
];

// Email Finder Fields
const finderShow = (findBy: string) => ({
  show: { resource: ["email"], operation: ["findEmail"], findBy: [findBy] },
});

export const emailFinderFields: INodeProperties[] = [
  {
    displayName: "Find By",
    name: "findBy",
    type: "options",
    displayOptions: {
      show: { resource: ["email"], operation: ["findEmail"] },
    },
    options: [
      {
        name: "Name and Company",
        value: "name",
        description: "First and last name plus a company domain or name",
      },
      {
        name: "Profile URL",
        value: "profile",
        description: "A person's B2B profile URL",
      },
    ],
    default: "name",
  },
  {
    displayName: "First Name",
    name: "first_name",
    type: "string",
    required: true,
    displayOptions: finderShow("name"),
    default: "",
    placeholder: "e.g. Jane",
  },
  {
    displayName: "Last Name",
    name: "last_name",
    type: "string",
    required: true,
    displayOptions: finderShow("name"),
    default: "",
    placeholder: "e.g. Doe",
  },
  {
    displayName: "Company Domain",
    name: "domain",
    type: "string",
    displayOptions: finderShow("name"),
    default: "",
    placeholder: "e.g. example.com",
    description:
      "Company website domain. Provide a domain, a company name, or both.",
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    displayOptions: finderShow("name"),
    default: "",
    placeholder: "e.g. Example Inc",
    description: "Used when the domain is unknown",
  },
  {
    displayName: "Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: finderShow("profile"),
    default: "",
    placeholder: "e.g. https://www.example.com/in/jane-doe",
  },
  {
    displayName: "Allow Domain Mismatch",
    name: "allow_domain_mismatch",
    type: "boolean",
    displayOptions: {
      show: { resource: ["email"], operation: ["findEmail"] },
    },
    default: false,
    description:
      "Whether to return an email at the person's current employer when it differs from the domain you sent. The response flags this with domain_mismatch.",
  },
];

// Personal Email Finder Fields
export const personalEmailFields: INodeProperties[] = [
  {
    displayName: "Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["findPersonalEmail"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/in/jane-doe",
    description: "B2B profile URL",
  },
];

// Social to Work Email Fields
export const socialToWorkEmailFields: INodeProperties[] = [
  {
    displayName: "Profile URL",
    name: "profile_url",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["email"],
        operation: ["socialToWorkEmail"],
      },
    },
    default: "",
    placeholder: "e.g. https://www.example.com/in/jane-doe",
    description: "B2B profile URL",
  },
];
