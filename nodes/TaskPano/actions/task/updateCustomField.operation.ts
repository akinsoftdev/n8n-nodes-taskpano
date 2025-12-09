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
		displayName: 'Custom Field Name or ID',
		name: 'customFieldId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the custom field to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
							errorMessage: 'Custom Field ID must be numeric',
						},
					},
				],
				hint: 'Enter a custom field ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getCustomFields',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'string', value: '' },
		description: 'The value to set for the custom field. For select fields, choose from the dropdown. For other types, enter the value manually.',
		typeOptions: {
			loadOptionsDependsOn: [
				'taskOptions.organizationId',
				'taskOptions.projectNumericId',
				'taskId',
				'customFieldId',
			],
		},
		modes: [
			{
				displayName: 'Manual',
				name: 'string',
				type: 'string',
				hint: 'Enter value manually. For boolean: 0/1. For date: YYYY-MM-DD HH:MM format.',
				placeholder: 'Enter value...',
			},
			{
				displayName: 'Select Option',
				name: 'list',
				type: 'list',
				hint: 'Choose from available options (only for select type)',
				typeOptions: {
					searchListMethod: 'getCustomFieldSelectOptions',
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
		operation: ['updateCustomField'],
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
		const customFieldId = this.getNodeParameter('customFieldId', i, undefined, {
			extractValue: true,
		}) as string;
		const value = this.getNodeParameter('value', i, undefined, {
			extractValue: true,
		}) as string;

		const body: IDataObject = {
			value: value === '' || value === undefined ? null : value,
		};

			const responseData = await taskPanoApiRequest.call(
				this,
				'PUT',
				`/tasks/${taskId}/custom-fields/${customFieldId}`,
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

