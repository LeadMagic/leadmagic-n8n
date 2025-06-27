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
				name: 'Find Jobs',
				value: 'findJobs',
				description: 'Search for job postings based on various criteria',
				action: 'Find jobs',
			},
			{
				name: 'Get Job Countries',
				value: 'getJobCountries',
				description: 'Retrieve list of available countries for job filtering',
				action: 'Get job countries',
			},
			{
				name: 'Get Job Types',
				value: 'getJobTypes',
				description: 'Retrieve list of available job types for filtering',
				action: 'Get job types',
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
		default: '',
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
]; 