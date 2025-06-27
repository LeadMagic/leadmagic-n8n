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
				name: 'Find Email',
				value: 'findEmail',
				description: 'Find a verified email address based on a person\'s name and company',
				action: 'Find email',
			},
			{
				name: 'Validate Email',
				value: 'validateEmail',
				description: 'Validate an email address for deliverability and get company information',
				action: 'Validate email',
			},
			{
				name: 'Find Personal Email',
				value: 'findPersonalEmail',
				description: 'Find personal email addresses from B2B profile URLs',
				action: 'Find personal email',
			},
			{
				name: 'Find Work Email from Profile',
				value: 'socialToWorkEmail',
				description: 'Find work email addresses from B2B profile URLs',
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
		placeholder: 'jesse@leadmagic.io',
		description: 'Email address to validate',
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
];

// Email Finder Fields
export const emailFinderFields: INodeProperties[] = [
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
			},
		},
		options: [
			{
				name: 'Single Person',
				value: 'single',
				description: 'Find email for one person',
			},
			{
				name: 'Bulk People',
				value: 'bulk',
				description: 'Find emails for multiple people (up to 1000)',
			},
		],
		default: 'single',
		description: 'Choose how to input people data',
	},
	{
		displayName: 'First Name',
		name: 'first_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
				inputMode: ['single'],
			},
		},
		default: '',
		description: 'The person\'s first name',
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
				inputMode: ['single'],
			},
		},
		default: '',
		description: 'The person\'s last name',
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
				inputMode: ['single'],
			},
		},
		default: '',
		placeholder: 'microsoft.com',
		description: 'The company\'s domain name',
		hint: '💡 Domain is more accurate than company name for finding emails',
	},
	{
		displayName: 'Company Name',
		name: 'company_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
				inputMode: ['single'],
			},
		},
		default: '',
		placeholder: 'Microsoft',
		description: 'The company\'s name (optional - used for additional context)',
		hint: 'Optional: Helps improve accuracy when provided along with domain',
	},
	{
		displayName: 'Bulk People Data',
		name: 'bulkPeopleData',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
				inputMode: ['bulk'],
			},
		},
		default: '',
		placeholder: 'John,Doe,microsoft.com,Microsoft\nJane,Smith,google.com,Google\nBob,Wilson,apple.com,Apple',
		description: 'Enter people data as CSV format: first_name,last_name,domain,company_name (up to 1000 rows)',
		hint: '💡 Format: First Name, Last Name, Domain (required), Company Name (optional). Rate limited to 300/min.',
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