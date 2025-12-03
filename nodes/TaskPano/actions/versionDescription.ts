import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';

import * as task from './task/Task.resource';

export const versionDescription: INodeTypeDescription = {
	displayName: 'TaskPano',
	name: 'taskPano',
	icon: { light: 'file:taskPano.svg', dark: 'file:taskPano.dark.svg' },
	group: ['output'],
	version: 1,
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Consume TaskPano API',
	defaults: {
		name: 'TaskPano',
	},
	inputs: [NodeConnectionType.Main],
	outputs: [NodeConnectionType.Main],
	credentials: [
		{
			name: 'taskPanoApi',
			required: true,
		},
	],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Task',
					value: 'task',
					description: 'Work with tasks',
				},
			],
			default: 'task',
		},
		...task.description,
	],
};

