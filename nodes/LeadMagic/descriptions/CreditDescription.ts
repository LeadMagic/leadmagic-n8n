import type { INodeProperties } from 'n8n-workflow';

export const creditOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['credit'],
			},
		},
		options: [
			{
				name: '💰 Get Credits',
				value: 'getCredits',
				description: '📈 Check available API credits for your account (free - no credits consumed)',
				action: 'Get credits',
			},
		],
		default: 'getCredits',
	},
];
