import type { INodeProperties } from 'n8n-workflow';

export const emailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['email'],
			},
		},
		options: [
			{
				name: '🔍 Find Email',
				value: 'findEmail',
				description: '🏆 MOST POPULAR & ACCURATE: Find verified work emails using name + domain (Industry Leading 95%+ accuracy)',
				action: 'Find email address',
			},
			{
				name: '✅ Validate Email',
				value: 'validateEmail',
				description: '📋 Validate email deliverability + get company info (supports bulk up to 1000)',
				action: 'Validate email address',
			},
			{
				name: '📱 Find Personal Email',
				value: 'findPersonalEmail',
				description: '🏠 Discover personal email addresses from professional profile URLs',
				action: 'Find personal email',
			},
			{
				name: '💼 Work Email from Profile',
				value: 'socialToWorkEmail',
				description: '🔗 Extract work email addresses from social/professional profiles',
				action: 'Find work email from profile',
			},
		],
		default: 'findEmail',
	},
];

// Email Validation Fields
export const emailValidateFields: INodeProperties[] = [
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
			},
		},
		options: [
			{
				name: 'Single Email',
				value: 'single',
				description: 'Validate one email address',
			},
			{
				name: 'Bulk Emails',
				value: 'bulk',
				description: 'Validate multiple emails (up to 1000)',
			},
		],
		default: 'single',
		description: 'Choose how to input emails',
	},
	{
		displayName: 'Email Address',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
				inputMode: ['single'],
			},
		},
		default: '',
		placeholder: 'john.doe@company.com',
		description: 'Email address to validate for deliverability and company information',
		hint: '💡 Get delivery status, company data, and social profiles',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$',
						errorMessage: 'Please enter a valid email address format',
					},
				},
			],
		},
	},
	{
		displayName: 'Bulk Emails',
		name: 'bulkEmails',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
				inputMode: ['bulk'],
			},
		},
		default: '',
		placeholder: 'john@company1.com\njane@company2.com\nbob@company3.com\n...',
		description: 'Enter emails separated by new lines or commas (up to 1000 emails)',
		hint: '💡 Rate limited to 300 requests per minute for optimal performance',
	},
	{
		displayName: 'First Name',
		name: 'first_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
				inputMode: ['single'],
			},
		},
		default: '',
		description: 'First name of the person (optional)',
	},
	{
		displayName: 'Last Name',
		name: 'last_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
				inputMode: ['single'],
			},
		},
		default: '',
		description: 'Last name of the person (optional)',
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
			},
		},
		default: {},
		placeholder: 'Add advanced option',
		description: 'Optional advanced settings for email validation',
		options: [
			{
				displayName: 'Return Format',
				name: 'returnFormat',
				type: 'options',
				options: [
					{
						name: 'Full Details',
						value: 'full',
						description: 'Return all available data (default)',
					},
					{
						name: 'Minimal',
						value: 'minimal',
						description: 'Return only validation status',
					},
					{
						name: 'Company Focus',
						value: 'company',
						description: 'Focus on company information',
					},
				],
				default: 'full',
				description: 'Choose what data to return',
			},
			{
				displayName: 'Rate Limit Delay (ms)',
				name: 'rateLimitDelay',
				type: 'number',
				default: 200,
				description: 'Delay between requests for bulk processing (300 req/min = 200ms)',
				typeOptions: {
					minValue: 100,
					maxValue: 5000,
				},
			},
		],
	},
];

// Email Finder Fields
export const emailFinderFields: INodeProperties[] = [
	{
		displayName: 'First Name',
		name: 'first_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
			},
		},
		default: '',
		placeholder: 'John',
		description: 'Target person\'s first name (required for email discovery)',
		hint: '👤 Use the most common variation (e.g., "Mike" vs "Michael")',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[a-zA-Z\\s\\-\\.\']{1,50}$',
						errorMessage: 'Please enter a valid first name (letters only)',
					},
				},
			],
		},
	},
	{
		displayName: 'Last Name',
		name: 'last_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
			},
		},
		default: '',
		placeholder: 'Smith',
		description: 'Target person\'s last name (required for email discovery)',
		hint: '👤 Full surname - avoid nicknames or abbreviations',
		typeOptions: {
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[a-zA-Z\\s\\-\\.\']{1,50}$',
						errorMessage: 'Please enter a valid last name (letters only)',
					},
				},
			],
		},
	},
	{
		displayName: 'Company Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
			},
		},
		default: '',
		placeholder: 'microsoft.com (without www or https)',
		description: 'Company website domain - Industry Leading accuracy for email discovery',
		hint: '🏆 MARKET LEADER: 95%+ accuracy rate - Examples: google.com, apple.com, salesforce.com',
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
				resource: ['email'],
				operation: ['findEmail'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
		description: 'The company\'s name (optional - used for additional context)',
		hint: 'Optional: Helps improve accuracy when provided along with domain',
	},
];

// Personal Email Finder Fields
export const personalEmailFields: INodeProperties[] = [
	{
		displayName: 'Profile URL',
		name: 'profile_url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findPersonalEmail'],
			},
		},
		default: '',
		placeholder: 'https://www.example.com/in/williamhgates/',
		description: 'B2B profile URL',
	},
];

// Social to Work Email Fields
export const socialToWorkEmailFields: INodeProperties[] = [
	{
		displayName: 'Profile URL',
		name: 'profile_url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['socialToWorkEmail'],
			},
		},
		default: '',
		placeholder: 'https://www.example.com/in/williamhgates/',
		description: 'B2B profile URL',
	},
]; 