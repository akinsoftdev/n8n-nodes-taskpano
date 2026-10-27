import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { taskPanoApiRequest } from '../../transport';

const reminderValues: INodeProperties[] = [
	{
		displayName: 'Unit',
		name: 'unit',
		type: 'options',
		options: [
			{ name: 'Minute', value: 1 },
			{ name: 'Hour', value: 2 },
			{ name: 'Day', value: 3 },
			{ name: 'Week', value: 4 },
		],
		default: 1,
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'number',
		typeOptions: {
			minValue: 0,
		},
		default: 0,
	},
];

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
				description: 'The organization of the project. Used to list projects. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'List Name or ID',
				name: 'listId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description: 'The list to create the task in. If empty, the first list of the project (or the list of the template) is used.',
				typeOptions: {
					loadOptionsDependsOn: ['projectHash'],
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
				displayName: 'Template Name or ID',
				name: 'manualTaskId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getManualTasks',
					loadOptionsDependsOn: ['projectHash'],
				},
				default: '',
				description: 'Create the task from one of the manual templates of the project. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	{
		displayName: 'Project Name or ID',
		name: 'projectHash',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getProjects',
			loadOptionsDependsOn: ['createTaskOptions.organizationId'],
		},
		default: '',
		description: 'The project to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	{
		displayName: 'Required Fields',
		name: 'requiredFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Values for the fields that are required in the project. Fields that are not required in the project are ignored by TaskPano; use the related operations to set them after the task is created.',
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [
			{
				displayName: 'Assignee Names or IDs',
				name: 'assignee_ids',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjectAssignees',
					loadOptionsDependsOn: ['projectHash'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Watcher Names or IDs',
				name: 'watcher_ids',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjectAssignees',
					loadOptionsDependsOn: ['projectHash'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'Must be in the future. Not needed when Immediately is enabled.',
			},
			{
				displayName: 'Immediately',
				name: 'immediately',
				type: 'boolean',
				default: false,
				description: 'Whether the task is urgent. Replaces the due date.',
			},
			{
				displayName: 'Immediately Period',
				name: 'immediately_period',
				type: 'options',
				options: [
					{ name: 'No Reminder', value: 0 },
					{ name: 'Every 15 Minutes', value: 15 },
					{ name: 'Every 30 Minutes', value: 30 },
					{ name: 'Every Hour', value: 60 },
					{ name: 'Every 2 Hours', value: 120 },
					{ name: 'Every Day', value: 1440 },
					{ name: 'Every 2 Days', value: 2880 },
					{ name: 'Every Week', value: 10080 },
				],
				default: 0,
				description: 'How often to remind while the task is marked as immediately',
			},
			{
				displayName: 'Due Date Reminders',
				name: 'due_date_reminders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					maxAllowedFields: 5,
				},
				default: {},
				options: [
					{
						displayName: 'Reminder',
						name: 'reminders',
						values: reminderValues,
					},
				],
			},
			{
				displayName: 'Planning Start Time',
				name: 'start_time',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Planning End Time',
				name: 'end_time',
				type: 'dateTime',
				default: '',
				description: 'Must be the same as or after the planning start time',
			},
			{
				displayName: 'Planning Reminders',
				name: 'planning_date_reminders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					maxAllowedFields: 5,
				},
				default: {},
				options: [
					{
						displayName: 'Reminder',
						name: 'reminders',
						values: reminderValues,
					},
				],
			},
			{
				displayName: 'Tag Names or IDs',
				name: 'tag_ids',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjectTags',
					loadOptionsDependsOn: ['projectHash'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
			},
			{
				displayName: 'Special Code',
				name: 'special_code',
				type: 'string',
				default: '',
				placeholder: 'e.g., TASK-123',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'fixedCollection',
				default: {},
				options: [
					{
						displayName: 'Coordinates',
						name: 'coordinates',
						values: [
							{
								displayName: 'Latitude',
								name: 'lat',
								type: 'number',
								typeOptions: {
									numberPrecision: 7,
								},
								default: 0,
							},
							{
								displayName: 'Longitude',
								name: 'lng',
								type: 'number',
								typeOptions: {
									numberPrecision: 7,
								},
								default: 0,
							},
						],
					},
				],
			},
			{
				displayName: 'Custom Field Values',
				name: 'custom_field_values',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Field',
						name: 'fields',
						values: [
							{
								displayName: 'Custom Field Name or ID',
								name: 'customFieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getProjectCustomFields',
									loadOptionsDependsOn: ['projectHash'],
								},
								default: '',
								description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the custom field. Use 1/0 for boolean fields and YYYY-MM-DD for date fields.',
							},
						],
					},
				],
			},
		],
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

function toIds(values: unknown[]): number[] {
	return values.map((value) => parseInt(String(value), 10));
}

function buildRequiredFieldValues(requiredFields: IDataObject): IDataObject {
	const {
		assignee_ids,
		watcher_ids,
		tag_ids,
		location,
		custom_field_values,
		due_date_reminders,
		planning_date_reminders,
		...rest
	} = requiredFields;

	const values: IDataObject = { ...rest };

	if (!values.immediately_period) {
		delete values.immediately_period;
	}

	if (Array.isArray(assignee_ids) && assignee_ids.length) {
		values.assignee_ids = toIds(assignee_ids);
	}

	if (Array.isArray(watcher_ids) && watcher_ids.length) {
		values.watcher_ids = toIds(watcher_ids);
	}

	if (Array.isArray(tag_ids) && tag_ids.length) {
		values.tag_ids = toIds(tag_ids);
	}

	const coordinates = (location as IDataObject | undefined)?.coordinates as IDataObject | undefined;
	if (coordinates) {
		values.location = { lat: coordinates.lat, lng: coordinates.lng };
	}

	const customFields = (custom_field_values as IDataObject | undefined)?.fields as IDataObject[] | undefined;
	if (customFields?.length) {
		values.custom_field_values = Object.fromEntries(
			customFields.map((field) => [String(field.customFieldId), field.value]),
		);
	}

	const dueDateReminders = (due_date_reminders as IDataObject | undefined)?.reminders as IDataObject[] | undefined;
	if (dueDateReminders?.length) {
		values.due_date_reminders = dueDateReminders;
	}

	const planningReminders = (planning_date_reminders as IDataObject | undefined)?.reminders as IDataObject[] | undefined;
	if (planningReminders?.length) {
		values.planning_date_reminders = planningReminders;
	}

	return values;
}

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const projectHash = this.getNodeParameter('projectHash', i) as string;
			const name = this.getNodeParameter('name', i) as string;
			const listId = this.getNodeParameter('createTaskOptions.listId', i, '', {
				extractValue: true,
			}) as string;
			const manualTaskId = this.getNodeParameter('createTaskOptions.manualTaskId', i, '') as string;
			const requiredFields = this.getNodeParameter('requiredFields', i, {}) as IDataObject;

			const body: IDataObject = {
				project: projectHash,
				subject: name,
			};

			if (listId) {
				body.listId = parseInt(listId, 10);
			}

			if (manualTaskId) {
				body.manualTaskId = parseInt(manualTaskId, 10);
			}

			Object.assign(body, buildRequiredFieldValues(requiredFields));

			const responseData = await taskPanoApiRequest.call(this, 'POST', '/tasks', body);

			const executionData = this.helpers.constructExecutionMetaData(
				[{ json: ((responseData.data as IDataObject)?.task as IDataObject) ?? responseData }],
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
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
		}
	}

	return returnData;
}
