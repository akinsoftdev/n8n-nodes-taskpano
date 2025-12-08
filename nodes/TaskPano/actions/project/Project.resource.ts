import type { INodeProperties } from 'n8n-workflow';

import * as getParticipants from './getParticipants.operation';

export { getParticipants };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get Participants',
				value: 'getParticipants',
				description: 'Get all participants of a project',
				action: 'Get participants of a project',
			},
		],
		default: 'getParticipants',
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
	},
	...getParticipants.description,
];






