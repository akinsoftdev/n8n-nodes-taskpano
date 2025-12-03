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
		displayName: 'Checklist Item Name or ID',
		name: 'checklistItemId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the checklist item to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskId'],
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
							errorMessage: 'Checklist item ID must be numeric',
						},
					},
				],
				hint: 'Enter a checklist item ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getChecklistItems',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Status',
		name: 'checklistItemStatus',
		type: 'options',
		required: true,
		options: [
			{
				name: 'Completed',
				value: true,
				description: 'Mark the checklist item as completed',
			},
			{
				name: 'Uncompleted',
				value: false,
				description: 'Mark the checklist item as uncompleted',
			},
		],
		default: true,
		description: 'The status to set for the checklist item',
	},
];

const displayOptions = {
	show: {
		resource: ['task'],
		operation: ['updateChecklistItemStatus'],
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
			const checklistItemId = this.getNodeParameter('checklistItemId', i, undefined, {
				extractValue: true,
			}) as string;
			const status = this.getNodeParameter('checklistItemStatus', i) as boolean;

			const body: IDataObject = {
				completed: status,
			};

			const responseData = await taskPanoApiRequest.call(
				this,
				'PUT',
				`/tasks/${taskId}/checklists/${checklistItemId}`,
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
