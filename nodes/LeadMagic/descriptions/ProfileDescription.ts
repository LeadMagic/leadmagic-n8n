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
				name: 'Search Profile',
				value: 'searchProfile',
				description: 'Get full profile details from B2B profile URL',
				action: 'Search profile',
			},
			{
				name: 'Email to Profile',
				value: 'emailToProfile',
				description: 'Find B2B profile URL using work email address',
				action: 'Email to profile',
			},
			{
				name: 'Find Mobile',
				value: 'findMobile',
				description: 'Find mobile phone numbers using profile URL or email',
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
			},
			{
				name: 'By Work Email',
				value: 'workEmail',
			},
			{
				name: 'By Personal Email',
				value: 'personalEmail',
			},
		],
		default: 'profile',
		description: 'How to search for the mobile number',
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
				name: 'Find Role',
				value: 'findRole',
				description: 'Find specific roles/positions within a company',
				action: 'Find role',
			},
			{
				name: 'Find Employees',
				value: 'findEmployees',
				description: 'Find employees of a specific company',
				action: 'Find employees',
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
				name: 'By Company Name',
				value: 'name',
			},
			{
				name: 'By Domain',
				value: 'domain',
			},
			{
				name: 'By Profile URL',
				value: 'profile',
			},
		],
		default: 'name',
		description: 'How to specify the company',
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
		description: 'Company name',
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
		description: 'Company domain',
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
					description: 'Company profile URL',
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