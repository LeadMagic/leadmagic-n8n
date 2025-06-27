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
			},
			{
				name: 'By Company Name',
				value: 'name',
			},
			{
				name: 'By Profile URL',
				value: 'profile',
			},
		],
		default: 'domain',
		description: 'How to search for the company',
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
			},
			{
				name: 'By Company Name',
				value: 'name',
			},
		],
		default: 'domain',
		description: 'How to search for the company',
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