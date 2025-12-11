import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { taskPanoApiRequest, taskPanoApiRequestAllItems } from '../../transport';
import { getOrganizationNumericIdFromHash } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Organization Name or ID',
		name: 'organizationId',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getOrganizations',
		},
		default: '',
		description: 'The organization to get tasks from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		options: [
			{
				displayName: 'Assignee(s) Names or IDs',
				name: 'assignees',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsersForFilters',
					loadOptionsDependsOn: ['organizationId', 'filters.project_id'],
				},
				default: [],
				description: 'Filter tasks by assigned user. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Completion Date End',
				name: 'completion_date_end',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks completed until this date',
			},
			{
				displayName: 'Completion Date Start',
				name: 'completion_date_start',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks completed from this date',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'options',
				options: [
					{
						name: 'Has Due Date',
						value: 'hasDueDate',
						description: 'Tasks that have a due date set',
					},
					{
						name: 'Immediately',
						value: 'immediately',
						description: 'Tasks marked as immediately',
					},
					{
						name: 'No Due Date',
						value: 'null',
						description: 'Tasks without a due date',
					},
					{
						name: 'No Filter',
						value: '',
						description: 'Do not filter by due date',
					},
					{
						name: 'Overdue for Done List',
						value: 'overdueForDoneList',
						description: 'Tasks where due date is before completion date',
					},
				],
				default: '',
				description: 'Filter by due date status. You can also specify a custom date using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Due Date End',
				name: 'due_date_end',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks with due date until this date',
			},
			{
				displayName: 'Due Date Start',
				name: 'due_date_start',
				type: 'dateTime',
				default: '',
				description: 'Filter tasks with due date from this date',
			},
			{
				displayName: 'Folder Name or ID',
				name: 'folder_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getFoldersForFilters',
					loadOptionsDependsOn: ['organizationId'],
				},
				default: '',
				description: 'Filter tasks by folder. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Is Parent',
				name: 'is_parent',
				type: 'boolean',
				default: false,
				description: 'Whether to only return parent tasks (exclude subtasks)',
			},
			{
				displayName: 'List Name or ID',
				name: 'list_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getListsForFilters',
					loadOptionsDependsOn: ['organizationId', 'filters.project_id'],
				},
				default: '',
				description: 'Filter tasks by list. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'List Status',
				name: 'list_status',
				type: 'options',
				options: [
					{
						name: 'Other',
						value: '0',
						description: 'Other tasks',
					},
					{
						name: 'To Do',
						value: '1',
						description: 'To Do tasks',
					},
					{
						name: 'In Progress',
						value: '2',
						description: 'In Progress tasks',
					},
					{
						name: 'Done',
						value: '3',
						description: 'Done tasks',
					},
					{
						name: 'Suspended',
						value: '4',
						description: 'Suspended tasks',
					},
					{
						name: 'Canceled',
						value: '5',
						description: 'Canceled tasks',
					},
					{
						name: 'To Do or In Progress',
						value: '1001',
						description: 'Tasks with due date in To Do or In Progress state',
					},
				],
				default: '0',
				description: 'Filter tasks by list status/state',
			},
			{
				displayName: 'Owner(s) Names or IDs',
				name: 'owners',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsersForFilters',
					loadOptionsDependsOn: ['organizationId', 'filters.project_id'],
				},
				default: [],
				description: 'Filter tasks by owner user. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'project_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjectsForFilters',
					loadOptionsDependsOn: ['organizationId', 'filters.folder_id'],
				},
				default: '',
				description: 'Filter tasks by project. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Scope',
				name: 'scope',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
						description: 'Only active tasks',
					},
					{
						name: 'Archived',
						value: 'archived',
						description: 'Only archived tasks',
					},
					{
						name: 'Trashed',
						value: 'trashed',
						description: 'Only trashed tasks',
					},
					{
						name: 'All',
						value: 'all',
						description: 'All tasks including archived and trashed',
					},
				],
				default: 'active',
				description: 'The scope of tasks to retrieve',
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				placeholder: 'e.g., bug fix',
				description: 'Search in task subject, description, and special code',
			},
			{
				displayName: 'Sort Type',
				name: 'sort_type',
				type: 'options',
				options: [
					{
						name: 'Created Date (Newest First)',
						value: 'created_at_desc',
						description: 'Sort by creation date descending',
					},
					{
						name: 'Created Date (Oldest First)',
						value: 'created_at_asc',
						description: 'Sort by creation date ascending',
					},
					{
						name: 'Due Date (Earliest First)',
						value: 'due_date_asc',
						description: 'Sort by due date ascending',
					},
					{
						name: 'Due Date (Latest First)',
						value: 'due_date_desc',
						description: 'Sort by due date descending',
					},
					{
						name: 'List Changed Date (Newest First)',
						value: 'list_changed_at_desc',
						description: 'Sort by list change date descending',
					},
					{
						name: 'List Changed Date (Oldest First)',
						value: 'list_changed_at_asc',
						description: 'Sort by list change date ascending',
					},
					{
						name: 'Subject (A-Z)',
						value: 'subject_asc',
						description: 'Sort by subject ascending',
					},
					{
						name: 'Subject (Z-A)',
						value: 'subject_desc',
						description: 'Sort by subject descending',
					},
				],
				default: 'subject_asc',
				description: 'Sort order for tasks',
			},
			{
				displayName: 'Subscription(s) Names or IDs',
				name: 'subscriptions',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsersForFilters',
					loadOptionsDependsOn: ['organizationId', 'filters.project_id'],
				},
				default: [],
				description: 'Filter tasks by subscription user. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Tag Name(s) Names or IDs',
				name: 'tags',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getTagsForFilters',
					loadOptionsDependsOn: ['organizationId', 'filters.project_id'],
				},
				default: [],
				description: 'Filter tasks by tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['task'],
		operation: ['getAll'],
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
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const organizationIdHash = this.getNodeParameter('organizationId', i) as string;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const queryParams: IDataObject = {};

			if (organizationIdHash) {
				const organizationNumericId = await getOrganizationNumericIdFromHash.call(
					this,
					organizationIdHash,
				);

				if (organizationNumericId) {
					queryParams.organization_id = organizationNumericId;
				}
			}

			if (filters.q) {
				queryParams.q = filters.q;
			}

			if (filters.project_id) {
				queryParams.project_id = filters.project_id;
			}

			if (filters.list_id) {
				queryParams.list_id = filters.list_id;
			}

			if (filters.list_name) {
				queryParams.list_name = filters.list_name;
			}

			if (filters.list_status) {
				queryParams.list_status = filters.list_status;
			}

			if (filters.tags) {
				queryParams.tag_name = Array.isArray(filters.tags)
					? (filters.tags as string[]).join(',')
					: filters.tags;
			}

			if (filters.folder_id) {
				queryParams.folder_id = filters.folder_id;
			}

			if (filters.assignees) {
				queryParams.assignees = Array.isArray(filters.assignees)
					? (filters.assignees as string[]).join(',')
					: filters.assignees;
			}

			if (filters.subscriptions) {
				queryParams.subscriptions = Array.isArray(filters.subscriptions)
					? (filters.subscriptions as string[]).join(',')
					: filters.subscriptions;
			}

			if (filters.owners) {
				queryParams.owners = Array.isArray(filters.owners)
					? (filters.owners as string[]).join(',')
					: filters.owners;
			}

			if (filters.due_date || filters.due_date_start || filters.due_date_end) {
				const dueDateFilter: IDataObject = {};

				if (filters.due_date) {
					dueDateFilter.equal = filters.due_date;
				}

				if (filters.due_date_start) {
					dueDateFilter.start = filters.due_date_start;
				}

				if (filters.due_date_end) {
					dueDateFilter.end = filters.due_date_end;
				}

				queryParams.due_date = dueDateFilter;
			}

			if (filters.completion_date_start || filters.completion_date_end) {
				const completionDateFilter: IDataObject = {};

				if (filters.completion_date_start) {
					completionDateFilter.start = filters.completion_date_start;
				}

				if (filters.completion_date_end) {
					completionDateFilter.end = filters.completion_date_end;
				}

				queryParams.completion_date = completionDateFilter;
			}

			if (filters.sort_type) {
				queryParams.sort_type = filters.sort_type;
			}

			if (filters.is_parent !== undefined) {
				queryParams.is_parent = filters.is_parent;
			}

			const scope = filters.scope || 'active';
			const endpoint = `/tasks/${scope}`;

			let tasks: IDataObject[] = [];

			if (returnAll) {
				tasks = await taskPanoApiRequestAllItems.call(this, endpoint, 'tasks', {}, queryParams);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				queryParams.limit = limit;
				const responseData = await taskPanoApiRequest.call(this, 'GET', endpoint, {}, queryParams);
				tasks = responseData.data?.tasks?.data || [];
			}

			const executionData = this.helpers.constructExecutionMetaData(
				tasks.map((task) => ({ json: task })),
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
