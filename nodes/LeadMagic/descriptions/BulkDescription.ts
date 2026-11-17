import type { INodeProperties } from "n8n-workflow";

const show = (
  operation: string[],
  extra: Record<string, Array<string | boolean>> = {},
) => ({
  show: { resource: ["bulkJob"], operation, ...extra },
});

export const bulkOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["bulkJob"] } },
    options: [
      {
        name: "Get Results",
        value: "getBulkResults",
        description: "Get the row results of a bulk job",
        action: "Get bulk job results",
      },
      {
        name: "Get Status",
        value: "getBulkStatus",
        description: "Get the status and progress of a bulk job",
        action: "Get bulk job status",
      },
      {
        name: "Submit",
        value: "submitBulkJob",
        description:
          "Send all input items (or a file URL) as one asynchronous job of up to 500,000 rows",
        action: "Submit a bulk job",
      },
    ],
    default: "submitBulkJob",
  },
];

export const bulkFields: INodeProperties[] = [
  {
    displayName:
      "Submit sends every input item in one request and outputs one item with the job ID. Rows are charged like the single-request operation, and only when they succeed.",
    name: "bulkNotice",
    type: "notice",
    displayOptions: show(["submitBulkJob"]),
    default: "",
  },
  {
    displayName: "Product",
    name: "product",
    type: "options",
    displayOptions: show(["submitBulkJob"]),
    options: [
      { name: "Company Enrich", value: "company_search" },
      { name: "Company Funding", value: "company_funding" },
      { name: "Email Validation", value: "email_validation" },
      { name: "Find Mobile", value: "mobile_finder" },
      { name: "Find Personal Email", value: "personal_email_finder" },
      { name: "Find Role", value: "role_finder" },
      { name: "Find Work Email", value: "email_finder" },
      { name: "Job Change Detector", value: "job_change_detector" },
      { name: "Profile Enrich", value: "profile_search" },
      { name: "Technographics", value: "technographics" },
    ],
    default: "email_finder",
    description:
      "The operation to run on every row. Each row needs that operation's input fields, for example first_name, last_name, and domain for Find Work Email.",
  },
  {
    displayName: "Rows From",
    name: "rowsFrom",
    type: "options",
    displayOptions: show(["submitBulkJob"]),
    options: [
      {
        name: "Input Items",
        value: "items",
        description: "Each input item becomes one row",
      },
      {
        name: "File URL",
        value: "fileUrl",
        description: "A public HTTPS CSV, JSON, or JSONL file",
      },
    ],
    default: "items",
  },
  {
    displayName: "Fields to Send",
    name: "rowFields",
    type: "string",
    displayOptions: show(["submitBulkJob"], { rowsFrom: ["items"] }),
    default: "",
    placeholder: "e.g. first_name, last_name, domain",
    description:
      "Comma-separated item fields to include in each row. Leave empty to send every field.",
  },
  {
    displayName: "File URL",
    name: "fileUrl",
    type: "string",
    required: true,
    displayOptions: show(["submitBulkJob"], { rowsFrom: ["fileUrl"] }),
    default: "",
    placeholder: "e.g. https://example.com/contacts.csv",
  },
  {
    displayName: "Submit Options",
    name: "bulkOptions",
    type: "collection",
    placeholder: "Add Option",
    displayOptions: show(["submitBulkJob"]),
    default: {},
    options: [
      {
        displayName: "Callback URL",
        name: "callbackUrl",
        type: "string",
        default: "",
        placeholder: "e.g. https://n8n.example.com/webhook/leadmagic-bulk",
        description:
          "HTTPS URL LeadMagic calls when the job completes or fails, such as an n8n Webhook node URL",
      },
      {
        displayName: "File Format",
        name: "format",
        type: "options",
        default: "csv",
        options: [
          { name: "CSV", value: "csv" },
          { name: "JSON", value: "json" },
          { name: "JSONL", value: "jsonl" },
        ],
        description: "Format of the file URL (auto-detected when omitted)",
      },
      {
        displayName: "Idempotency Key",
        name: "idempotencyKey",
        type: "string",
        default: "",
        description:
          "Reuse the same key when retrying a submit so the job isn't created twice",
      },
      {
        displayName: "Job Name",
        name: "fileName",
        type: "string",
        default: "",
        placeholder: "e.g. Q4 webinar leads",
      },
    ],
  },
  {
    displayName: "Job ID",
    name: "jobId",
    type: "string",
    required: true,
    displayOptions: show(["getBulkStatus", "getBulkResults"]),
    default: "",
    placeholder: "e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    description: "The jobId returned by Submit",
  },
  {
    displayName: "Row Status",
    name: "rowStatus",
    type: "options",
    displayOptions: show(["getBulkResults"]),
    options: [
      { name: "All", value: "" },
      { name: "Completed", value: "completed" },
      { name: "Failed", value: "failed" },
    ],
    default: "",
  },
  {
    displayName: "Return All",
    name: "returnAll",
    type: "boolean",
    displayOptions: show(["getBulkResults"]),
    default: false,
    description: "Whether to return all results or only up to a given limit",
  },
  {
    displayName: "Limit",
    name: "limit",
    type: "number",
    displayOptions: show(["getBulkResults"], { returnAll: [false] }),
    typeOptions: { minValue: 1 },
    default: 50,
    description: "Max number of results to return",
  },
];

export const creditUsageFields: INodeProperties[] = [
  {
    displayName: "Days",
    name: "days",
    type: "number",
    displayOptions: {
      show: { resource: ["credit"], operation: ["getUsage"] },
    },
    typeOptions: { minValue: 1, maxValue: 365 },
    default: 30,
    description: "Number of past days to include",
  },
];
