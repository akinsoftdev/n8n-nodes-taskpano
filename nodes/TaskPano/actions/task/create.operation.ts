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
		name: 'createTaskOptions',
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
				description: 'The organization to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
					loadOptionsDependsOn: ['createTaskOptions.organizationId'],
				},
				default: '',
				description: 'The project to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	{
		displayName: 'List Name or ID',
		name: 'listId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'The list to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['createTaskOptions.projectId'],
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
							errorMessage: 'List ID must be numeric',
						},
					},
				],
				hint: 'Enter a list ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getLists',
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
		operation: ['create'],
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
			const listId = this.getNodeParameter('listId', i, undefined, {
				extractValue: true,
			}) as string;
			const name = this.getNodeParameter('name', i) as string;

			const body: IDataObject = {
				listId: parseInt(listId, 10),
				subject: name,
			};

			const responseData = await taskPanoApiRequest.call(this, 'POST', '/tasks', body);

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
