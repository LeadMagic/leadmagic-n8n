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
				name: 'Search Company',
				value: 'searchCompany',
				description: 'Search for company details using domain, name, or profile URL',
				action: 'Search company',
			},
			{
				name: 'Get Company Funding',
				value: 'getCompanyFunding',
				description: 'Get comprehensive funding information, financials, and competitors',
				action: 'Get company funding',
			},
		],
		default: 'searchCompany',
	},
];

// Company Search Fields
export const companySearchFields: INodeProperties[] = [
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
			},
		},
		options: [
			{
				name: 'Single Company',
				value: 'single',
				description: 'Search for one company',
			},
			{
				name: 'Bulk Companies',
				value: 'bulk',
				description: 'Search for multiple companies (up to 1000)',
			},
		],
		default: 'single',
		description: 'Choose how to input company data',
	},
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
				inputMode: ['single'],
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
				inputMode: ['single'],
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
				inputMode: ['single'],
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
				inputMode: ['single'],
				searchMethod: ['profile'],
			},
		},
		default: '',
		placeholder: 'https://www.example.com/company/leadmagichq',
		description: 'Company profile URL',
	},
	{
		displayName: 'Bulk Companies',
		name: 'bulkCompanies',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['searchCompany'],
				inputMode: ['bulk'],
			},
		},
		default: '',
		placeholder: 'microsoft.com\ngoogle.com\napple.com\nleadmagic.io\n...',
		description: 'Enter company domains separated by new lines (up to 1000 domains)',
		hint: '💡 Bulk mode searches by domain only (most accurate). Rate limited to 300/min.',
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