import type { INodeProperties } from 'n8n-workflow';

export const profileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['profile'],
			},
		},
		options: [
			{
				name: '👤 Search Profile',
				value: 'searchProfile',
				description: '🎯 Get full profile details: work history, education, certifications (1 credit)',
				action: 'Search profile',
			},
		{
			name: '📧 Email to Profile',
			value: 'emailToProfile',
			description: '🔗 Find profile URL using work email address (1 credit)',
			action: 'Email to profile',
		},
			{
				name: '📱 Find Mobile',
				value: 'findMobile',
				description: '📞 Find mobile phone numbers using profile URL or email (1 credit)',
				action: 'Find mobile',
			},
		],
		default: 'searchProfile',
	},
];

// Profile Search Fields
export const profileSearchFields: INodeProperties[] = [
	{
		displayName: 'Profile URL',
		name: 'profile_url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['searchProfile'],
			},
		},
		default: '',
							placeholder: 'https://www.example.com/in/williamhgates/',
					description: 'Full URL of the B2B profile',
	},
];

// Email to Profile Fields
export const emailToProfileFields: INodeProperties[] = [
	{
		displayName: 'Work Email',
		name: 'work_email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['emailToProfile'],
			},
		},
		default: '',
		placeholder: 'jesse@leadmagic.io',
		description: 'Work email address to find profile for',
	},
];

// Mobile Finder Fields
export const mobileFinderFields: INodeProperties[] = [
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['findMobile'],
			},
		},
		options: [
			{
				name: 'By Profile URL',
				value: 'profile',
				description: 'Most accurate method - search by profile URL',
			},
			{
				name: 'By Work Email',
				value: 'workEmail',
				description: 'Search by work email address',
			},
			{
				name: 'By Personal Email',
				value: 'personalEmail',
				description: 'Search by personal email address',
			},
		],
		default: 'profile',
		description: 'How to search for the mobile number',
		hint: '💡 Profile URL is most accurate, followed by work email, then personal email',
	},
	{
		displayName: 'Profile URL',
		name: 'profile_url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['findMobile'],
				searchMethod: ['profile'],
			},
		},
		default: '',
							placeholder: 'https://www.example.com/in/williamhgates/',
		description: 'B2B profile URL',
	},
	{
		displayName: 'Work Email',
		name: 'work_email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['findMobile'],
				searchMethod: ['workEmail'],
			},
		},
		default: '',
		placeholder: 'jesse@leadmagic.io',
		description: 'Work email address',
	},
	{
		displayName: 'Personal Email',
		name: 'personal_email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['findMobile'],
				searchMethod: ['personalEmail'],
			},
		},
		default: '',
		placeholder: 'jesse.ouellette@gmail.com',
		description: 'Personal email address',
	},
];

export const peopleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['people'],
			},
		},
		options: [
			{
				name: '🔍 Find Role',
				value: 'findRole',
				description: '👤 Find specific roles/positions within a company (1 credit)',
				action: 'Find role',
			},
			{
				name: '👥 Find Employees',
				value: 'findEmployees',
				description: '🏢 Find employees of a specific company (1 credit per page)',
				action: 'Find employees',
			},
			{
				name: '🆕 🔄 Job Change Detector',
				value: 'detectJobChange',
				description: '📊 Detect if a person has changed jobs - monitor career transitions (3 credits)',
				action: 'Detect job change',
			},
		],
		default: 'findRole',
	},
];

// Role Finder Fields
export const roleFinderFields: INodeProperties[] = [
	{
		displayName: 'Job Title',
		name: 'job_title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findRole'],
			},
		},
		default: '',
		placeholder: 'Developer',
		description: 'Job title or role to search for',
	},
	{
		displayName: 'Search Method',
		name: 'searchMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findRole'],
			},
		},
		options: [
			{
				name: 'By Domain',
				value: 'domain',
				description: 'Most accurate method - search by company domain',
			},
			{
				name: 'By Profile URL',
				value: 'profile',
				description: 'Search by company profile URL',
			},
			{
				name: 'By Company Name',
				value: 'name',
				description: 'Search by company name (less accurate)',
			},
		],
		default: 'domain',
		description: 'How to specify the company',
		hint: '💡 Domain search is most accurate, followed by profile URL, then company name',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findRole'],
				searchMethod: ['name'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
	},
	{
		displayName: 'Company Domain',
		name: 'company_domain',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findRole'],
				searchMethod: ['domain'],
			},
		},
		default: '',
		placeholder: 'microsoft.com',
	},
	{
		displayName: 'Company Profile URL',
		name: 'company_profile_url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findRole'],
				searchMethod: ['profile'],
			},
		},
		default: '',
							placeholder: 'https://www.example.com/company/microsoft',
	},
];

// Employee Finder Fields
export const employeeFinderFields: INodeProperties[] = [
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findEmployees'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
		description: 'Company name to find employees for',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['findEmployees'],
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
				resource: ['people'],
				operation: ['findEmployees'],
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

// Job Change Detector Fields
export const jobChangeDetectorFields: INodeProperties[] = [
	{
		displayName: 'Profile URL',
		name: 'profile_url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['detectJobChange'],
			},
		},
		default: '',
		placeholder: 'https://www.example.com/in/jesseoue/',
		description: 'Profile URL of the person to monitor',
		hint: '🔍 Monitor this person for job changes',
	},
	{
		displayName: 'Company Identifier',
		name: 'companyIdentifier',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['detectJobChange'],
			},
		},
		options: [
			{
				name: 'Company Domain (More Accurate)',
				value: 'domain',
				description: 'Use company domain for more accurate matching',
			},
			{
				name: 'Company Name',
				value: 'name',
				description: 'Use company name',
			},
		],
		default: 'domain',
		description: 'How to identify the expected company',
		hint: '💡 Domain matching is more accurate and case-insensitive',
	},
	{
		displayName: 'Expected Company Domain',
		name: 'company_domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['detectJobChange'],
				companyIdentifier: ['domain'],
			},
		},
		default: '',
		placeholder: 'leadmagic.io',
		description: 'Domain of the company where you expect this person to work',
		hint: '🏢 The system will check if they still work here',
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
		displayName: 'Expected Company Name',
		name: 'company_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['detectJobChange'],
				companyIdentifier: ['name'],
			},
		},
		default: '',
		placeholder: 'LeadMagic',
		description: 'Name of the company where you expect this person to work',
	},
];
