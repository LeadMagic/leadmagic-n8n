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
		displayName: 'Email Address',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
			},
		},
		default: '',
		placeholder: 'jesse@leadmagic.io',
		description: 'Email address to validate',
	},
	{
		displayName: 'First Name',
		name: 'first_name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validateEmail'],
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
			},
		},
		default: '',
		description: 'Last name of the person (optional)',
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
			},
		},
		default: '',
		description: 'The person\'s last name',
	},
	{
		displayName: 'Company Domain',
		name: 'domain',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['findEmail'],
			},
		},
		default: '',
		placeholder: 'microsoft.com',
		description: 'The company\'s domain name',
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
		description: 'The company\'s name (used if domain is unknown)',
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