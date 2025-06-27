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
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
			},
		},
		options: [
			{
				name: 'By Domain',
				value: 'domain',
				description: 'Most accurate method - search by company domain',
			},
			{
				name: 'By Company Name',
				value: 'name',
				description: 'Search by company name (less accurate)',
			},
			{
				name: 'By Profile URL',
				value: 'profile',
				description: 'Search by company profile URL',
			},
		],
		default: 'domain',
		description: 'How to search for the company',
		hint: '💡 Domain search is most accurate, followed by profile URL, then company name',
	},
	{
		displayName: 'Company Domain',
		name: 'company_domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
				searchMethod: ['domain'],
			},
		},
		default: '',
		placeholder: 'leadmagic.io',
		description: 'Company domain to search for',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
				searchMethod: ['name'],
			},
		},
		default: '',
		placeholder: 'LeadMagic',
		description: 'Company name to search for',
	},
	{
		displayName: 'Profile URL',
		name: 'profile_url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
				searchMethod: ['profile'],
			},
		},
		default: '',
		placeholder: 'https://www.example.com/company/leadmagichq',
		description: 'Company profile URL',
	},
];

// Company Funding Fields
export const companyFundingFields: INodeProperties[] = [
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getCompanyFunding'],
			},
		},
		options: [
			{
				name: 'By Domain',
				value: 'domain',
				description: 'Most accurate method - search by company domain',
			},
			{
				name: 'By Company Name',
				value: 'name',
				description: 'Search by company name (less accurate)',
			},
		],
		default: 'domain',
		description: 'How to search for the company',
		hint: '💡 Domain search is more accurate than company name search',
	},
	{
		displayName: 'Company Domain',
		name: 'company_domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getCompanyFunding'],
				searchMethod: ['domain'],
			},
		},
		default: '',
		placeholder: 'microsoft.com',
		description: 'Company domain to get funding information for',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getCompanyFunding'],
				searchMethod: ['name'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
		description: 'Company name to get funding information for',
	},
]; 