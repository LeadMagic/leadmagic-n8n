import type { INodeProperties } from "n8n-workflow";

export const jobOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["job"],
      },
    },
    options: [
      {
        name: "Find (Legacy)",
        value: "findJobs",
        description:
          "Search job postings with the V1 Jobs Finder. Prefer Search for new workflows.",
        action: "Find jobs with the legacy finder",
      },
      {
        name: "Get Company Types",
        value: "getJobCompanyTypes",
        description: "List company type IDs for the legacy finder (free)",
        action: "Get job company types",
      },
      {
        name: "Get Countries",
        value: "getJobCountries",
        description: "List country IDs for the legacy finder (free)",
        action: "Get job countries",
      },
      {
        name: "Get Industries",
        value: "getJobIndustries",
        description: "List industry IDs for the legacy finder (free)",
        action: "Get job industries",
      },
      {
        name: "Get Regions",
        value: "getJobRegions",
        description: "List region IDs for the legacy finder (free)",
        action: "Get job regions",
      },
      {
        name: "Get Types",
        value: "getJobTypes",
        description: "List job type IDs for the legacy finder (free)",
        action: "Get job types",
      },
      {
        name: "Search",
        value: "searchJobs",
        description:
          "Search job postings by title, company, location, seniority, and date as hiring signals",
        action: "Search jobs",
      },
    ],
    default: "searchJobs",
  },
];

// Job Search Fields
export const jobSearchFields: INodeProperties[] = [
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. Example Inc",
    description: "Filter by company name",
  },
  {
    displayName: "Company Website",
    name: "company_website",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. example.com",
    description: "Filter by company website",
  },
  {
    displayName: "Job Title",
    name: "job_title",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. Developer",
    description: "Filter by job title",
  },
  {
    displayName: "Location",
    name: "location",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. New York",
    description: "Filter by job location",
  },
  {
    displayName: "Experience Level",
    name: "experience_level",
    type: "options",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    options: [
      {
        name: "Entry",
        value: "entry",
      },
      {
        name: "Executive",
        value: "executive",
      },
      {
        name: "Mid",
        value: "mid",
      },
      {
        name: "Senior",
        value: "senior",
      },
    ],
    default: "entry",
    description: "Required experience level",
  },
  {
    displayName: "Job Description Keywords",
    name: "job_description",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: 'e.g. python "software engineer"',
    description: "Keywords from the job description",
  },
  {
    displayName: "Country ID",
    name: "country_id",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. US",
    description:
      "Filter jobs by country ID (use Get Job Countries to see available options)",
  },
  {
    displayName: "Page",
    name: "page",
    type: "number",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: 1,
    description: "Page number (starting from 1)",
    typeOptions: {
      minValue: 1,
    },
  },
  {
    displayName: "Per Page",
    name: "per_page",
    type: "number",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: 20,
    description: "Number of results per page (maximum 50)",
    typeOptions: {
      minValue: 1,
      maxValue: 50,
    },
  },
  {
    displayName: "Region ID",
    name: "region_id",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. 5",
    description:
      "Filter jobs by region ID (use Get Job Regions to see available options). E.g., 1=Africa, 5=North America.",
    hint: 'Use the "Get Job Regions" operation to see all available region IDs',
  },
  {
    displayName: "Industry ID",
    name: "industry_id",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. 4",
    description:
      "Filter jobs by industry ID (use Get Job Industries to see available options)",
    hint: 'Use the "Get Job Industries" operation to see all available industry IDs',
  },
  {
    displayName: "Company Type ID",
    name: "company_type_id",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. 1",
    description:
      "Filter jobs by company type ID (use Get Job Company Types to see available options)",
    hint: 'Use the "Get Job Company Types" operation to see all available company type IDs',
  },
  {
    displayName: "Job Type ID",
    name: "job_type_id",
    type: "string",
    displayOptions: {
      show: {
        resource: ["job"],
        operation: ["findJobs"],
      },
    },
    default: "",
    placeholder: "e.g. 1",
    description:
      "Filter jobs by job type ID (use Get Job Types to see available options)",
    hint: 'Use the "Get Job Types" operation to see all available job type IDs',
  },
];
