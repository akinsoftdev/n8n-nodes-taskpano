import type { INodeProperties } from 'n8n-workflow';

import * as getParticipants from './getParticipants.operation';
import * as getCustomFields from './getCustomFields.operation';

export { getParticipants, getCustomFields };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get Custom Fields',
				value: 'getCustomFields',
				description: 'Get all custom fields of a project',
				action: 'Get custom fields of a project',
			},
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
	...getCustomFields.description,
	...getParticipants.description,
];

