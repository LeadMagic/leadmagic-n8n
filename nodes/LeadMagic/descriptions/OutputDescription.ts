import type { INodeProperties } from "n8n-workflow";

export const outputFields: INodeProperties[] = [
  {
    displayName: "Output",
    name: "outputMode",
    type: "options",
    noDataExpression: true,
    options: [
      {
        name: "Raw",
        value: "raw",
        description: "Keep the complete API response",
      },
      {
        name: "Selected Fields",
        value: "selected",
        description: "Keep only chosen top-level fields and any record ID",
      },
      {
        name: "Simplified",
        value: "simplified",
        description: "Keep up to 10 useful fields per object",
      },
    ],
    default: "raw",
    description:
      "Choose how much response data to pass to later nodes or an AI agent",
  },
  {
    displayName: "Fields to Include",
    name: "outputFields",
    type: "multiOptions",
    displayOptions: { show: { outputMode: ["selected"] } },
    options: [
      { name: "Ads", value: "ads" },
      { name: "Company Domain", value: "company_domain" },
      { name: "Company Name", value: "company_name" },
      { name: "Company Name (Company Search)", value: "companyName" },
      { name: "Credits Consumed", value: "credits_consumed" },
      { name: "Data", value: "data" },
      { name: "Domain", value: "domain" },
      { name: "Email", value: "email" },
      { name: "Employee Count", value: "employeeCount" },
      { name: "Employees", value: "employees" },
      { name: "First Name", value: "first_name" },
      { name: "Full Name", value: "full_name" },
      { name: "Industry", value: "industry" },
      { name: "Job Title", value: "job_title" },
      { name: "Jobs", value: "jobs" },
      { name: "Last Name", value: "last_name" },
      { name: "Message", value: "message" },
      { name: "Mobile Phone", value: "mobile_phone" },
      { name: "Profile URL", value: "profile_url" },
      { name: "Results", value: "results" },
      { name: "Status", value: "status" },
      { name: "Total Count", value: "total_count" },
      { name: "Website URL", value: "websiteUrl" },
    ],
    default: [],
    description:
      "Top-level response fields to keep, when present. Record IDs are always retained.",
  },
  {
    displayName: "Additional Output Fields",
    name: "additionalOutputFields",
    type: "string",
    displayOptions: { show: { outputMode: ["selected"] } },
    default: "",
    placeholder: "e.g. professional_title,company_website",
    description:
      "Comma-separated top-level response fields not listed above. Nested paths are not supported.",
  },
];
