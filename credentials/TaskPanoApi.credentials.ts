import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { TASKPANO_BASE_URL, TASKPANO_API_VERSION } from '../nodes/TaskPano/transport';

export class TaskPanoApi implements ICredentialType {
	name = 'taskPanoApi';
	displayName = 'TaskPano API';
	documentationUrl = 'https://app.taskpano.com/api/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'your-api-token',
			description: 'Your TaskPano API token. You can generate one in your TaskPano account settings.',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				Accept: 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: `${TASKPANO_BASE_URL}/${TASKPANO_API_VERSION}`,
			url: '/user',
			method: 'GET',
		},
	};
}
