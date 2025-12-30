import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class LeadMagicApi implements ICredentialType {
	name = 'leadMagicApi';

	displayName = 'LeadMagic API';

	icon: Icon = 'file:leadmagic.png';

	documentationUrl = 'https://leadmagic.io/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your LeadMagic API key. Get it from your LeadMagic dashboard.',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.leadmagic.io',
			url: '/credits',
			method: 'POST',
		},
	};
}
