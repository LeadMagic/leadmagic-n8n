import type { INodeProperties } from 'n8n-workflow';

export const advertisementOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['advertisement'],
			},
		},
		options: [
			{
				name: 'Search Google Ads',
				value: 'searchGoogleAds',
				description: 'Search for Google Ads based on a company\'s domain or name',
				action: 'Search Google ads',
			},
			{
				name: 'Search Meta Ads',
				value: 'searchMetaAds',
				description: 'Search for Meta (Facebook/Instagram) Ads based on a company\'s domain or name',
				action: 'Search Meta ads',
			},
			{
				name: 'Search B2B Ads',
				value: 'searchB2BAds',
				description: 'Search for B2B Ads based on a company\'s domain or name',
				action: 'Search B2B ads',
			},
			{
				name: 'Get B2B Ad Details',
				value: 'getB2BAdDetails',
				description: 'Get detailed information about a specific B2B ad',
				action: 'Get B2B ad details',
			},
		],
		default: 'searchGoogleAds',
	},
];

// Google Ads Search Fields
export const googleAdsFields: INodeProperties[] = [
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['searchGoogleAds'],
			},
		},
		options: [
			{
				name: 'By Company Domain',
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
				resource: ['advertisement'],
				operation: ['searchGoogleAds'],
				searchMethod: ['domain'],
			},
		},
		default: '',
		placeholder: 'gong.io',
		description: 'Company domain to search ads for',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['searchGoogleAds'],
				searchMethod: ['name'],
			},
		},
		default: '',
		placeholder: 'Gong',
		description: 'Company name to search ads for',
	},
];

// Meta Ads Search Fields
export const metaAdsFields: INodeProperties[] = [
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['searchMetaAds'],
			},
		},
		options: [
			{
				name: 'By Company Domain',
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
				resource: ['advertisement'],
				operation: ['searchMetaAds'],
				searchMethod: ['domain'],
			},
		},
		default: '',
		placeholder: 'gong.io',
		description: 'Company domain to search ads for',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['searchMetaAds'],
				searchMethod: ['name'],
			},
		},
		default: '',
		placeholder: 'Gong',
		description: 'Company name to search ads for',
	},
];

// B2B Ads Search Fields
export const b2bAdsFields: INodeProperties[] = [
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['searchB2BAds'],
			},
		},
		options: [
			{
				name: 'By Company Domain',
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
				resource: ['advertisement'],
				operation: ['searchB2BAds'],
				searchMethod: ['domain'],
			},
		},
		default: '',
		placeholder: 'microsoft.com',
		description: 'Company domain to search ads for',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['searchB2BAds'],
				searchMethod: ['name'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
		description: 'Company name to search ads for',
	},
];

// B2B Ad Details Fields
export const b2bAdDetailsFields: INodeProperties[] = [
	{
		displayName: 'Ad ID',
		name: 'ad_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['advertisement'],
				operation: ['getB2BAdDetails'],
			},
		},
		default: '',
		placeholder: '12345',
						description: 'Professional ad ID to get details for',
	},
]; 