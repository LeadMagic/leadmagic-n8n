import type { INodeProperties } from "n8n-workflow";

export const advertisementOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
      },
    },
    options: [
      {
        name: "Get B2B Ad Details",
        value: "getB2BAdDetails",
        description: "Get targeting and impressions for one B2B ad",
        action: "Get B2B ad details",
      },
      {
        name: "Search B2B Ads",
        value: "searchB2BAds",
        description: "Find a company's B2B ads",
        action: "Search B2B ads",
      },
      {
        name: "Search Google Ads",
        value: "searchGoogleAds",
        description: "Find a company's Google ads",
        action: "Search google ads",
      },
      {
        name: "Search Meta Ads",
        value: "searchMetaAds",
        description: "Find a company's Meta (Facebook and Instagram) ads",
        action: "Search meta ads",
      },
    ],
    default: "searchGoogleAds",
  },
];

// Google Ads Search Fields
export const googleAdsFields: INodeProperties[] = [
  {
    displayName: "Max Ads",
    name: "adsLimit",
    type: "number",
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchGoogleAds", "searchMetaAds", "searchB2BAds"],
      },
    },
    typeOptions: { minValue: 0, maxValue: 100 },
    default: 0,
    description:
      "Max number of ads to return. Ads are charged per result; 0 uses the API default.",
  },
  {
    displayName: "Search Method",
    name: "searchMethod",
    type: "options",
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchGoogleAds"],
      },
    },
    options: [
      {
        name: "By Company Domain",
        value: "domain",
      },
      {
        name: "By Company Name",
        value: "name",
      },
    ],
    default: "domain",
    description: "How to search for the company",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchGoogleAds"],
        searchMethod: ["domain"],
      },
    },
    default: "",
    placeholder: "e.g. gong.io",
    description: "Company domain to search ads for",
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchGoogleAds"],
        searchMethod: ["name"],
      },
    },
    default: "",
    placeholder: "e.g. Gong",
    description: "Company name to search ads for",
  },
];

// Meta Ads Search Fields
export const metaAdsFields: INodeProperties[] = [
  {
    displayName: "Search Method",
    name: "searchMethod",
    type: "options",
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchMetaAds"],
      },
    },
    options: [
      {
        name: "By Company Domain",
        value: "domain",
      },
      {
        name: "By Company Name",
        value: "name",
      },
    ],
    default: "domain",
    description: "How to search for the company",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchMetaAds"],
        searchMethod: ["domain"],
      },
    },
    default: "",
    placeholder: "e.g. gong.io",
    description: "Company domain to search ads for",
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchMetaAds"],
        searchMethod: ["name"],
      },
    },
    default: "",
    placeholder: "e.g. Gong",
    description: "Company name to search ads for",
  },
];

// B2B Ads Search Fields
export const b2bAdsFields: INodeProperties[] = [
  {
    displayName: "Search Method",
    name: "searchMethod",
    type: "options",
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchB2BAds"],
      },
    },
    options: [
      {
        name: "By Company Domain",
        value: "domain",
      },
      {
        name: "By Company Name",
        value: "name",
      },
    ],
    default: "domain",
    description: "How to search for the company",
  },
  {
    displayName: "Company Domain",
    name: "company_domain",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchB2BAds"],
        searchMethod: ["domain"],
      },
    },
    default: "",
    placeholder: "e.g. example.com",
    description: "Company domain to search ads for",
  },
  {
    displayName: "Company Name",
    name: "company_name",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["searchB2BAds"],
        searchMethod: ["name"],
      },
    },
    default: "",
    placeholder: "e.g. Example Inc",
    description: "Company name to search ads for",
  },
];

// B2B Ad Details Fields
export const b2bAdDetailsFields: INodeProperties[] = [
  {
    displayName: "Ad URL",
    name: "ad_id",
    type: "string",
    required: true,
    displayOptions: {
      show: {
        resource: ["advertisement"],
        operation: ["getB2BAdDetails"],
      },
    },
    default: "",
    placeholder: "e.g. https://example.com/ad",
    description: "Full advertisement URL to get details for",
  },
];
