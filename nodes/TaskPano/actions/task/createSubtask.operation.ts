import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { taskPanoApiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'taskOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Organization Name or ID',
				name: 'organizationId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				default: '',
				description: 'The organization. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectNumericId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjectsNumeric',
					loadOptionsDependsOn: ['taskOptions.organizationId'],
				},
				default: '',
				description: 'Select the project by its numeric ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	{
		displayName: 'Parent Task Name or ID',
		name: 'parentTaskId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the parent task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskOptions.projectNumericId'],
		},
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9]{8,}',
							errorMessage: 'Not a valid TaskPano Task ID',
						},
					},
				],
				hint: 'Enter a task ID',
				placeholder: 'G7jfdgY5',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTasks',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Task Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., Implement user authentication',
		description: 'The name/subject of the task to create',
	},
];

const displayOptions = {
	show: {
		resource: ['task'],
		operation: ['createSubtask'],
	},
};

export const description = properties.map((property) => ({
	...property,
	displayOptions,
}));

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const parentTaskId = this.getNodeParameter('parentTaskId', i, undefined, {
				extractValue: true,
			}) as string;
			const name = this.getNodeParameter('name', i) as string;

			const body: IDataObject = {
				subject: name,
			};

			const responseData = await taskPanoApiRequest.call(
				this,
				'POST',
				`/tasks/${parentTaskId}/subtasks`,
				body,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				[{ json: responseData }],
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
				continue;
			}
			throw error;
		}
	}

	return returnData;
}
