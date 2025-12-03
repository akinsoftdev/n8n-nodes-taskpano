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
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
		displayName: 'Tag Name or ID',
		name: 'tagId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the tag to add to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: [
				'taskOptions.organizationId',
				'taskOptions.projectNumericId',
				'taskId',
			],
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
							regex: '^[0-9]+$',
							errorMessage: 'Tag ID must be numeric',
						},
					},
				],
				hint: 'Enter a tag ID',
				placeholder: '98765',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getAvailableTags',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['task'],
		operation: ['addTag'],
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
			const taskId = this.getNodeParameter('taskId', i, undefined, {
				extractValue: true,
			}) as string;
			const tagId = this.getNodeParameter('tagId', i, undefined, {
				extractValue: true,
			}) as string;

			const body: IDataObject = {
				tag: parseInt(tagId, 10),
			};

			const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/tags`, body);

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
