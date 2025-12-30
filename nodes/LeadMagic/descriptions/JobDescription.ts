import type { INodeProperties } from 'n8n-workflow';

export const jobOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['job'],
			},
		},
		options: [
			{
				name: '🔍 Find Jobs',
				value: 'findJobs',
				description: '📋 Search for job postings based on various criteria (1 credit)',
				action: 'Find jobs',
			},
			{
				name: '🌍 Get Job Countries',
				value: 'getJobCountries',
				description: '🗺️ Retrieve list of available countries for job filtering (free)',
				action: 'Get job countries',
			},
			{
				name: '🆕 🌎 Get Job Regions',
				value: 'getJobRegions',
				description: '🗺️ Retrieve list of available regions for job filtering (free)',
				action: 'Get job regions',
			},
			{
				name: '📝 Get Job Types',
				value: 'getJobTypes',
				description: '📄 Retrieve list of available job types for filtering (free)',
				action: 'Get job types',
			},
			{
				name: '🆕 🏭 Get Job Industries',
				value: 'getJobIndustries',
				description: '🏢 Retrieve list of available industries for job filtering (free)',
				action: 'Get job industries',
			},
			{
				name: '🆕 🏬 Get Job Company Types',
				value: 'getJobCompanyTypes',
				description: '🏛️ Retrieve list of company types for job filtering (free)',
				action: 'Get job company types',
			},
		],
		default: 'findJobs',
	},
];

// Job Search Fields
export const jobSearchFields: INodeProperties[] = [
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
		description: 'Filter by company name',
	},
	{
		displayName: 'Company Website',
		name: 'company_website',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: 'microsoft.com',
		description: 'Filter by company website',
	},
	{
		displayName: 'Job Title',
		name: 'job_title',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: 'Developer',
		description: 'Filter by job title',
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: 'New York',
		description: 'Filter by job location',
	},
	{
		displayName: 'Experience Level',
		name: 'experience_level',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		options: [
			{
				name: 'Entry',
				value: 'entry',
			},
			{
				name: 'Mid',
				value: 'mid',
			},
			{
				name: 'Senior',
				value: 'senior',
			},
			{
				name: 'Executive',
				value: 'executive',
			},
		],
		default: 'entry',
		description: 'Required experience level',
	},
	{
		displayName: 'Job Description Keywords',
		name: 'job_description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: 'python "software engineer"',
		description: 'Keywords from the job description',
	},
	{
		displayName: 'Country ID',
		name: 'country_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: 'US',
		description: 'Filter jobs by country ID (use Get Job Countries to see available options)',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: 1,
		description: 'Page number (starting from 1)',
		typeOptions: {
			minValue: 1,
		},
	},
	{
		displayName: 'Per Page',
		name: 'per_page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: 20,
		description: 'Number of results per page (maximum 50)',
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
	},
	{
		displayName: 'Region ID',
		name: 'region_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: '5',
		description: 'Filter jobs by region ID (use Get Job Regions to see available options). E.g., 1=Africa, 5=North America.',
		hint: '💡 Use the "Get Job Regions" operation to see all available region IDs',
	},
	{
		displayName: 'Industry ID',
		name: 'industry_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: '4',
		description: 'Filter jobs by industry ID (use Get Job Industries to see available options)',
		hint: '💡 Use the "Get Job Industries" operation to see all available industry IDs',
	},
	{
		displayName: 'Company Type ID',
		name: 'company_type_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: '1',
		description: 'Filter jobs by company type ID (use Get Job Company Types to see available options)',
		hint: '💡 Use the "Get Job Company Types" operation to see all available company type IDs',
	},
	{
		displayName: 'Job Type ID',
		name: 'job_type_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['findJobs'],
			},
		},
		default: '',
		placeholder: '1',
		description: 'Filter jobs by job type ID (use Get Job Types to see available options)',
		hint: '💡 Use the "Get Job Types" operation to see all available job type IDs',
	},
];
