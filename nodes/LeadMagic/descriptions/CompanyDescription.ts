import type { INodeProperties } from 'n8n-workflow';

export const companyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['company'],
			},
		},
		options: [
			{
				name: '🔍 Company Intelligence',
				value: 'searchCompany',
				description: '🏢 Get detailed company info: employees, revenue, industry, social profiles',
				action: 'Get company intelligence',
			},
			{
				name: '💰 Funding & Financials',
				value: 'getCompanyFunding',
				description: '📊 Access funding rounds, investors, valuation, and financial data',
				action: 'Get company funding data',
			},
		],
		default: 'searchCompany',
	},
];

// Company Search Fields
export const companySearchFields: INodeProperties[] = [
	{
		displayName: 'Company Domain',
		name: 'company_domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
			},
		},
		default: '',
		placeholder: 'gong.io',
		description: 'Company website domain (most accurate search method)',
		hint: '🏆 MOST ACCURATE: Domain provides highest quality results (95%+ accuracy)',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$',
						errorMessage: 'Please enter a valid domain (e.g., company.com)',
					},
				},
			],
		},
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
			},
		},
		default: '',
		placeholder: 'Gong',
		description: 'Company name (optional - helps improve accuracy)',
		hint: '💡 Optional: Providing company name along with domain improves data quality',
	},
	{
		displayName: 'LinkedIn Company URL',
		name: 'linkedin_url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
			},
		},
		default: '',
		placeholder: 'https://www.linkedin.com/company/gong-io/',
		description: 'LinkedIn company profile URL (optional - enhances results)',
		hint: '💡 Optional: LinkedIn URL provides additional verification and data enrichment',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^https://([a-z]{2,3}\\.)?linkedin\\.com/company/.+$',
						errorMessage: 'Please enter a valid LinkedIn company URL',
					},
				},
			],
		},
	},
	{
		displayName: 'Search Options',
		name: 'searchOptions',
		type: 'collection',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
			},
		},
		default: {},
		placeholder: 'Add search option',
		description: 'Advanced search options for better results',
		options: [
			{
				displayName: 'Include Employee Count',
				name: 'includeEmployeeCount',
				type: 'boolean',
				default: true,
				description: 'Include detailed employee count information',
			},
			{
				displayName: 'Include Funding Data',
				name: 'includeFunding',
				type: 'boolean',
				default: true,
				description: 'Include basic funding information (use Funding operation for detailed data)',
			},
			{
				displayName: 'Include Social Profiles',
				name: 'includeSocialProfiles',
				type: 'boolean',
				default: true,
				description: 'Include social media profiles and URLs',
			},
		],
	},
];

// Company Funding Fields
export const companyFundingFields: INodeProperties[] = [
	{
		displayName: 'Company Domain',
		name: 'company_domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getCompanyFunding'],
			},
		},
		default: '',
		placeholder: 'stripe.com',
		description: 'Company website domain (most accurate search method)',
		hint: '🏆 MOST ACCURATE: Domain provides highest quality funding data (95%+ accuracy)',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$',
						errorMessage: 'Please enter a valid domain (e.g., company.com)',
					},
				},
			],
		},
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getCompanyFunding'],
			},
		},
		default: '',
		placeholder: 'Stripe',
		description: 'Company name (optional - helps improve accuracy)',
		hint: '💡 Optional: Providing company name along with domain improves data quality',
	},
	{
		displayName: 'LinkedIn Company URL',
		name: 'linkedin_url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getCompanyFunding'],
			},
		},
		default: '',
		placeholder: 'https://www.linkedin.com/company/stripe/',
		description: 'LinkedIn company profile URL (optional - enhances results)',
		hint: '💡 Optional: LinkedIn URL provides additional verification for funding data',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^https://([a-z]{2,3}\\.)?linkedin\\.com/company/.+$',
						errorMessage: 'Please enter a valid LinkedIn company URL',
					},
				},
			],
		},
	},
]; 