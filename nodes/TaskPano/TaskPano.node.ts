import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { taskPanoApiRequest, taskPanoApiRequestAllItems, getProjectHashFromNumericId, getOrganizationNumericIdFromHash } from './GenericFunctions';

export class TaskPano implements INodeType {
	description: INodeTypeDescription = {
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
				options: [
					{
						name: 'Task',
						value: 'task',
						description: 'Work with tasks',
					},
				],
				default: 'task',
				noDataExpression: true,
				required: true,
				description: 'The resource to perform operations on',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['task'],
					},
				},
				options: [
					{
						name: 'Add Assignee',
						value: 'addAssignee',
						description: 'Add an assignee to a task',
						action: 'Add an assignee',
					},
					{
						name: 'Add Checklist Item',
						value: 'addChecklistItem',
						description: 'Add a checklist item to a task',
						action: 'Add a checklist item',
					},
					{
						name: 'Add Comment',
						value: 'addComment',
						description: 'Add a comment to a task',
						action: 'Add a comment',
					},
					{
						name: 'Add Subscription',
						value: 'addSubscription',
						description: 'Add a subscription to a task',
						action: 'Add a subscription',
					},
					{
						name: 'Add Tag',
						value: 'addTag',
						description: 'Add a tag to a task',
						action: 'Add a tag',
					},
					{
						name: 'Create Task',
						value: 'createTask',
						description: 'Create a new task',
						action: 'Create a task',
					},
					{
						name: 'Create Subtask',
						value: 'createSubtask',
						description: 'Create a new subtask',
						action: 'Create a subtask',
					},
					{
						name: 'Get Task',
						value: 'getTask',
						description: 'Get a task by ID',
						action: 'Get a task',
					},
					{
						name: 'Get Tasks',
						value: 'getTasks',
						description: 'Get multiple tasks with filters',
						action: 'Get tasks',
					},
					{
						name: 'Move Task',
						value: 'moveTask',
						description: 'Move a task to a different list',
						action: 'Move a task',
					},
					{
						name: 'Remove Assignee',
						value: 'removeAssignee',
						description: 'Remove an assignee from a task',
						action: 'Remove an assignee',
					},
					{
						name: 'Remove Subscription',
						value: 'removeSubscription',
						description: 'Remove a subscription from a task',
						action: 'Remove a subscription',
					},
					{
						name: 'Remove Tag',
						value: 'removeTag',
						description: 'Remove a tag from a task',
						action: 'Remove a tag',
					},
					{
						name: 'Update Checklist Item',
						value: 'updateChecklistItem',
						description: 'Update a checklist item subject',
						action: 'Update a checklist item',
					},
					{
						name: 'Update Checklist Item Status',
						value: 'updateChecklistItemStatus',
						description: 'Update a checklist item status (completed/uncompleted)',
						action: 'Update a checklist item status',
					},
					{
						name: 'Update Task',
						value: 'updateTask',
						description: 'Update a task',
						action: 'Update a task',
					},
				],
				default: 'create',
				noDataExpression: true,
			},
			{
				displayName: 'Organization Name or ID',
				name: 'organizationId',
				type: 'options',
				displayOptions: {
					show: {
						operation: [
							'createTask',
							'createSubtask',
							'addChecklistItem',
							'addComment',
							'addAssignee',
							'addSubscription',
							'addTag',
							'removeAssignee',
							'removeSubscription',
							'removeTag',
							'updateChecklistItem',
							'updateChecklistItemStatus',
							'updateTask',
							'moveTask',
							'getTask',
							'getTasks',
						],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				default: '',
				required: false,
				description: 'The organization to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['createTask'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getProjects',
					loadOptionsDependsOn: ['organizationId'],
				},
				default: '',
				required: false,
				description: 'The project to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectNumericId',
				type: 'options',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'createSubtask',
							'addChecklistItem',
							'addComment',
							'addAssignee',
							'addSubscription',
							'addTag',
							'removeAssignee',
							'removeSubscription',
							'removeTag',
							'updateChecklistItem',
							'updateChecklistItemStatus',
							'updateTask',
							'moveTask',
							'getTask',
						],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getProjectsNumeric',
					loadOptionsDependsOn: ['organizationId'],
				},
				default: '',
				description: 'Select the project by its numeric ID for subtask creation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'List Name or ID',
				name: 'listId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['createTask'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getLists',
					loadOptionsDependsOn: ['projectId'],
				},
				default: '',
				description: 'The list to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Parent Task Name or ID',
				name: 'parentTaskId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['createSubtask'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTasks',
					loadOptionsDependsOn: ['projectNumericId'],
				},
				default: '',
				description: 'Select the parent task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Task Name or ID',
				name: 'taskId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'addChecklistItem',
							'addComment',
							'addAssignee',
							'addSubscription',
							'addTag',
							'removeAssignee',
							'removeSubscription',
							'removeTag',
							'updateChecklistItem',
							'updateChecklistItemStatus',
							'updateTask',
							'moveTask',
							'getTask',
						],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTasks',
					loadOptionsDependsOn: ['projectNumericId'],
				},
				default: '',
				description: 'Select the task to add the comment to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Target List Name or ID',
				name: 'targetListId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['moveTask'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getLists',
					loadOptionsDependsOn: ['organizationId', 'projectNumericId'],
				},
				default: '',
				description: 'Select the target list to move the task to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Task Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['createTask', 'createSubtask'],
						resource: ['task'],
					},
				},
				default: '',
				placeholder: 'e.g., Implement user authentication',
				description: 'The name/subject of the task to create',
			},
			{
				displayName: 'Checklist Item',
				name: 'checklistItem',
				type: 'string',
				required: true,
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['addChecklistItem'],
						resource: ['task'],
					},
				},
				default: '',
				placeholder: 'e.g., Complete test cases',
				description: 'The checklist item to add to the task',
			},
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				required: true,
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['addComment'],
						resource: ['task'],
					},
				},
				default: '',
				placeholder: 'e.g., This is a comment',
				description: 'The comment to add to the task',
			},
			{
				displayName: 'Checklist Item Name or ID',
				name: 'checklistItemId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateChecklistItem', 'updateChecklistItemStatus'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getChecklistItems',
					loadOptionsDependsOn: ['taskId'],
				},
				default: '',
				description: 'Select the checklist item to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'New Subject',
				name: 'newSubject',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateChecklistItem'],
						resource: ['task'],
					},
				},
				default: '',
				placeholder: 'e.g., Updated checklist item',
				description: 'The new subject for the checklist item',
			},
			{
				displayName: 'Status',
				name: 'checklistItemStatus',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateChecklistItemStatus'],
						resource: ['task'],
					},
				},
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
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						operation: ['updateTask'],
						resource: ['task'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Subject',
						name: 'subject',
						type: 'string',
						default: '',
						placeholder: 'e.g., Updated task name',
						description: 'The new subject/name for the task',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						placeholder: 'e.g., Updated task description',
						description: 'The new description for the task',
					},
					{
						displayName: 'Special Code',
						name: 'special_code',
						type: 'string',
						default: '',
						placeholder: 'e.g., TASK-123',
						description: 'The special code for the task',
					},
				],
			},
			{
				displayName: 'Tag Name or ID',
				name: 'tagId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['addTag'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getAvailableTags',
					loadOptionsDependsOn: [
						'organizationId',
						'projectNumericId',
						'taskId',
					],
				},
				default: '',
				description: 'Select the tag to add to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Tag Name or ID',
				name: 'taskTagId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['removeTag'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTaskTags',
					loadOptionsDependsOn: ['taskId'],
				},
				default: '',
				description: 'Select the tag to remove from the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Assignee Name or ID',
				name: 'assigneeId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['addAssignee'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getAvailableAssignees',
					loadOptionsDependsOn: [
						'organizationId',
						'projectNumericId',
						'taskId',
					],
				},
				default: '',
				description: 'Select the assignee to add to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Assignee Name or ID',
				name: 'taskAssigneeId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['removeAssignee'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTaskAssignees',
					loadOptionsDependsOn: ['taskId'],
				},
				default: '',
				description: 'Select the assignee to remove from the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Subscription Name or ID',
				name: 'subscriptionId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['addSubscription'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getAvailableSubscriptions',
					loadOptionsDependsOn: [
						'organizationId',
						'projectNumericId',
						'taskId',
					],
				},
				default: '',
				description: 'Select the subscription to add to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Subscription Name or ID',
				name: 'taskSubscriptionId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['removeSubscription'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTaskSubscriptions',
					loadOptionsDependsOn: ['taskId'],
				},
				default: '',
				description: 'Select the subscription to remove from the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getTasks'],
						resource: ['task'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getTasks'],
						resource: ['task'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 20,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				displayOptions: {
					show: {
						operation: ['getTasks'],
						resource: ['task'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Search Query',
						name: 'q',
						type: 'string',
						default: '',
						placeholder: 'e.g., bug fix',
						description: 'Search in task subject, description, and special code',
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
						default: '',
						description: 'Filter tasks by list status/state',
					},
					{
						displayName: 'Owner(s)',
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
						displayName: 'Assignee(s)',
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
						displayName: 'Subscription(s)',
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
						displayName: 'Tag Name(s)',
						name: 'tags',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getTagsForFilters',
							loadOptionsDependsOn: ['organizationId', 'filters.project_id'],
						},
						default: [],
						description: 'Filter tasks by tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Due Date',
						name: 'due_date',
						type: 'options',
						options: [
							{
								name: 'No Filter',
								value: '',
								description: 'Do not filter by due date',
							},
							{
								name: 'Has Due Date',
								value: 'hasDueDate',
								description: 'Tasks that have a due date set',
							},
							{
								name: 'No Due Date',
								value: 'null',
								description: 'Tasks without a due date',
							},
							{
								name: 'Immediately',
								value: 'immediately',
								description: 'Tasks marked as immediately',
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
						displayName: 'Due Date Start',
						name: 'due_date_start',
						type: 'dateTime',
						default: '',
						description: 'Filter tasks with due date from this date',
					},
					{
						displayName: 'Due Date End',
						name: 'due_date_end',
						type: 'dateTime',
						default: '',
						description: 'Filter tasks with due date until this date',
					},
					{
						displayName: 'Completion Date Start',
						name: 'completion_date_start',
						type: 'dateTime',
						default: '',
						description: 'Filter tasks completed from this date',
					},
					{
						displayName: 'Completion Date End',
						name: 'completion_date_end',
						type: 'dateTime',
						default: '',
						description: 'Filter tasks completed until this date',
					},
					{
						displayName: 'Sort Type',
						name: 'sort_type',
						type: 'options',
						options: [
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
							{
								name: 'Created Date (Oldest First)',
								value: 'created_at_asc',
								description: 'Sort by creation date ascending',
							},
							{
								name: 'Created Date (Newest First)',
								value: 'created_at_desc',
								description: 'Sort by creation date descending',
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
								name: 'List Changed Date (Oldest First)',
								value: 'list_changed_at_asc',
								description: 'Sort by list change date ascending',
							},
							{
								name: 'List Changed Date (Newest First)',
								value: 'list_changed_at_desc',
								description: 'Sort by list change date descending',
							},
						],
						default: '',
						description: 'Sort order for tasks',
					},
					{
						displayName: 'Is Parent',
						name: 'is_parent',
						type: 'boolean',
						default: false,
						description: 'Whether to only return parent tasks (exclude subtasks)',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await taskPanoApiRequest.call(this, 'GET', '/organizations');

					const { data } = response;
					const ownedOrganizations = data?.organizations || [];
					const assignedOrganizations = data?.assigneedOrganizations || [];
					const allOrganizations = [...ownedOrganizations, ...assignedOrganizations];

					return allOrganizations.map((org: IDataObject) => ({
						name: org.name as string,
						value: org.id_hash as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load organizations: ${error.message}`);
				}
			},

			async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');

				if (!organizationId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(
						this,
						'GET',
						`/organizations/${organizationId}/projects`,
						{},
						{ folder_id: -1 },
					);

					const projects = response.data?.projects || [];

					return projects.map((project: IDataObject) => ({
						name: project.name as string,
						value: project.id_hash as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load projects: ${error.message}`);
				}
			},

			async getProjectsNumeric(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');

				if (!organizationId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(
						this,
						'GET',
						`/organizations/${organizationId}/projects`,
						{},
						{ folder_id: -1 },
					);

					const projects = response.data?.projects || [];

					return projects.map((project: IDataObject) => ({
						name: project.name as string,
						value: project.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load projects: ${error.message}`);
				}
			},

			async getProjectsForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');

				if (!organizationId) {
					return [];
				}

				const filters = this.getCurrentNodeParameter('filters') as IDataObject;
				const folderId = filters?.folder_id;

				try {
					let response;

					if (folderId && folderId !== '-1') {
						const foldersResponse = await taskPanoApiRequest.call(
							this,
							'GET',
							`/organizations/${organizationId}/folders`,
						);

						const folders = foldersResponse.data?.folders || [];
						const folder = folders.find((f: IDataObject) => f.id === folderId);

						if (!folder) {
							return [];
						}

						response = await taskPanoApiRequest.call(
							this,
							'GET',
							`/folders/${folder.id_hash}/projects-with-descendants`,
						);
					} else {
						response = await taskPanoApiRequest.call(
							this,
							'GET',
							`/organizations/${organizationId}/projects`,
							{},
							{ folder_id: -1 },
						);
					}

					const projects = response.data?.projects || [];

					return projects.map((project: IDataObject) => ({
						name: project.name as string,
						value: project.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load projects: ${error.message}`);
				}
			},

			async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId');
				const projectNumericId = this.getCurrentNodeParameter('projectNumericId');

				if (!projectId && !projectNumericId) {
					return [];
				}

				try {
					let projectHash: string;

					if (projectId) {
						projectHash = projectId as string;
					} else {
						const organizationId = this.getCurrentNodeParameter('organizationId');

						projectHash = await getProjectHashFromNumericId.call(this, organizationId as string, projectNumericId as string);
					}

					const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/lists`);

					const lists = response.data?.lists || [];

					return lists.map((list: IDataObject) => ({
						name: list.name as string,
						value: list.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load lists: ${error.message}`);
				}
			},

			async getListsForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const filters = this.getCurrentNodeParameter('filters') as IDataObject;
				const projectNumericId = filters?.project_id;

				if (!projectNumericId) {
					return [];
				}

				try {
					const organizationId = this.getCurrentNodeParameter('organizationId');

					const projectHash = await getProjectHashFromNumericId.call(this, organizationId as string, projectNumericId as string);

					const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/lists`);

					const lists = response.data?.lists || [];

					return lists.map((list: IDataObject) => ({
						name: list.name as string,
						value: list.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load lists: ${error.message}`);
				}
			},

			async getUsersForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const filters = this.getCurrentNodeParameter('filters') as IDataObject;
				const projectNumericId = filters?.project_id;
				const organizationId = this.getCurrentNodeParameter('organizationId');

				if (!organizationId) {
					return [];
				}

				try {
					if (projectNumericId) {
						const projectHash = await getProjectHashFromNumericId.call(this, organizationId as string, projectNumericId as string);

						const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/assignees`);

						const projectAssignees = response.data?.projectAssignees || [];

						return projectAssignees.map((user: IDataObject) => ({
							name: user.name as string,
							value: user.id as string,
						}));
					}

					const response = await taskPanoApiRequest.call(this, 'GET', `/organizations/${organizationId}/assignees-contain-tasks`);

					const users = response.data?.organizationAssignees || [];

					return users.map((user: IDataObject) => ({
						name: user.name as string,
						value: user.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load users: ${error.message}`);
				}
			},

			async getTagsForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');

				if (!organizationId) {
					return [];
				}

				const filters = this.getCurrentNodeParameter('filters') as IDataObject;
				const projectNumericId = filters?.project_id;
				const folderId = filters?.folder_id;

				try {
					const queryParams: IDataObject = {
						organization_id: organizationId,
					};

					if(folderId) {
						queryParams.folder_id = folderId;
					}

					if (projectNumericId) {
						queryParams.project_id = projectNumericId;
					}

					const response = await taskPanoApiRequest.call(
						this,
						'GET',
						'/project-tags/names-contain-tasks',
						{},
						queryParams,
					);

					const tags = response.data?.tags || [];

					return tags.map((tag: string) => ({
						name: tag,
						value: tag,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load tags: ${error.message}`);
				}
			},

			async getFoldersForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');

				if (!organizationId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(
						this,
						'GET',
						`/organizations/${organizationId}/folders`,
					);

					const folders = response.data?.folders || [];

					const folderOptions = folders.map((folder: IDataObject) => ({
						name: folder.name as string,
						value: folder.id as string,
					}));

					folderOptions.unshift({
						name: 'Root Directory',
						value: '-1',
					});

					return folderOptions;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load folders: ${error.message}`);
				}
			},

			async getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectNumericId');

				if (!projectId) {
					return [];
				}

				try {
					const tasks = await taskPanoApiRequestAllItems.call(this, '/tasks', 'tasks', {}, { project_id: projectId });

					return tasks.map((task: IDataObject) => ({
						name: task.subject as string,
						value: task.id_hash as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load tasks: ${error.message}`);
				}
			},

			async getChecklistItems(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!taskId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/checklists`);

					const checklistItems = response.data?.checklists || [];

					return checklistItems.map((item: IDataObject) => ({
						name: item.subject as string,
						value: item.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load checklist items: ${error.message}`);
				}
			},

			async getAvailableTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');
				const projectNumericId = this.getCurrentNodeParameter('projectNumericId');
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!organizationId || !projectNumericId || !taskId) {
					return [];
				}

				try {
					const projectHash = await getProjectHashFromNumericId.call(this, organizationId as string, projectNumericId as string);

					const projectResponse = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/tags`);
					const projectTags = projectResponse.data?.tags || [];

					const taskResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/tags`);
					const taskTags = taskResponse.data?.tags || [];

					const currentTaskTagIds = new Set(taskTags.map((tag: IDataObject) => tag.id));

					const availableTags = projectTags.filter((tag: IDataObject) => !currentTaskTagIds.has(tag.id));

					return availableTags.map((tag: IDataObject) => ({
						name: tag.name as string,
						value: tag.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load available tags: ${error.message}`);
				}
			},

			async getTaskTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!taskId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/tags`);

					const taskTags = response.data?.tags || [];

					return taskTags.map((tag: IDataObject) => ({
						name: tag.name as string,
						value: tag.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load task tags: ${error.message}`);
				}
			},

			async getAvailableAssignees(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');
				const projectNumericId = this.getCurrentNodeParameter('projectNumericId');
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!organizationId || !projectNumericId || !taskId) {
					return [];
				}

				try {
					const projectHash = await getProjectHashFromNumericId.call(this, organizationId as string, projectNumericId as string);

					const projectAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/assignees`);
					const projectAssignees = projectAssigneesResponse.data?.projectAssignees || [];

					const taskAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/assignees`);
					const taskAssignees = taskAssigneesResponse.data?.assignees || [];

					const currentTaskAssigneeIds = new Set(taskAssignees.map((assignee: IDataObject) => assignee.id));

					const availableAssignees = projectAssignees.filter((assignee: IDataObject) =>
						!currentTaskAssigneeIds.has(assignee.id)
					);

					return availableAssignees.map((assignee: IDataObject) => ({
						name: assignee.name as string,
						value: assignee.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load available assignees: ${error.message}`);
				}
			},

			async getAvailableSubscriptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const organizationId = this.getCurrentNodeParameter('organizationId');
				const projectNumericId = this.getCurrentNodeParameter('projectNumericId');
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!organizationId || !projectNumericId || !taskId) {
					return [];
				}

				try {
					const projectHash = await getProjectHashFromNumericId.call(this, organizationId as string, projectNumericId as string);

					const projectAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/assignees`);
					const projectAssignees = projectAssigneesResponse.data?.projectAssignees || [];

					const taskAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/assignees`);
					const taskAssignees = taskAssigneesResponse.data?.assignees || [];

					const taskSubscriptionsResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/subscriptions`);
					const taskSubscriptions = taskSubscriptionsResponse.data?.subscriptions || [];

					const currentTaskAssigneeIds = new Set(taskAssignees.map((assignee: IDataObject) => assignee.id));
					const currentTaskSubscriptionIds = new Set(taskSubscriptions.map((subscription: IDataObject) => subscription.id));

					const availableSubscriptions = projectAssignees.filter((assignee: IDataObject) =>
						!currentTaskSubscriptionIds.has(assignee.id) && !currentTaskAssigneeIds.has(assignee.id)
					);

					return availableSubscriptions.map((assignee: IDataObject) => ({
						name: assignee.name as string,
						value: assignee.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load available subscriptions: ${error.message}`);
				}
			},

			async getTaskAssignees(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!taskId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/assignees`);

					const taskAssignees = response.data?.assignees || [];

					return taskAssignees.map((assignee: IDataObject) => ({
						name: assignee.name as string,
						value: assignee.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load task assignees: ${error.message}`);
				}
			},

			async getTaskSubscriptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const taskId = this.getCurrentNodeParameter('taskId');

				if (!taskId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/subscriptions`);

					const taskSubscriptions = response.data?.subscriptions || [];

					return taskSubscriptions.map((subscription: IDataObject) => ({
						name: subscription.name as string,
						value: subscription.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load task subscriptions: ${error.message}`);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (resource === 'task') {
					if (operation === 'createTask') {
						const listId = this.getNodeParameter('listId', i) as string;
						const name = this.getNodeParameter('name', i) as string;

						const body: IDataObject = {
							listId: parseInt(listId, 10),
							subject: name,
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', '/tasks', body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'createSubtask') {
						const parentTaskId = this.getNodeParameter('parentTaskId', i) as string;
						const name = this.getNodeParameter('name', i) as string;

						const body: IDataObject = {
							subject: name,
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${parentTaskId}/subtasks`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'getTask') {
						const taskId = this.getNodeParameter('taskId', i) as string;

						const responseData = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/show`);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'getTasks') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const organizationIdHash = this.getNodeParameter('organizationId', i) as string;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const queryParams: IDataObject = {};

						if (organizationIdHash) {
							const organizationNumericId = await getOrganizationNumericIdFromHash.call(this, organizationIdHash);

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

						tasks.forEach((task: IDataObject) => {
							returnData.push({
								json: task,
								pairedItem: {
									item: i,
								},
							});
						});
					}

					if (operation === 'updateTask') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							...additionalFields,
						};

						const responseData = await taskPanoApiRequest.call(this, 'PUT', `/tasks/${taskId}`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'moveTask') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const targetListId = this.getNodeParameter('targetListId', i) as string;

						const responseData = await taskPanoApiRequest.call(this, 'PATCH', `/tasks/${taskId}/move/${targetListId}`);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'addChecklistItem') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const checklistItem = this.getNodeParameter('checklistItem', i) as string;

						const body: IDataObject = {
							subject: checklistItem,
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/checklists`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'addComment') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const comment = this.getNodeParameter('comment', i) as string;

						const body: IDataObject = {
							comment: comment,
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/activities`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'updateChecklistItem') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const checklistItemId = this.getNodeParameter('checklistItemId', i) as string;
						const newSubject = this.getNodeParameter('newSubject', i) as string;

						const body: IDataObject = {
							subject: newSubject,
						};

						const responseData = await taskPanoApiRequest.call(this, 'PUT', `/tasks/${taskId}/checklists/${checklistItemId}`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'updateChecklistItemStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const checklistItemId = this.getNodeParameter('checklistItemId', i) as string;
						const status = this.getNodeParameter('checklistItemStatus', i) as boolean;

						const body: IDataObject = {
							completed: status,
						};

						const responseData = await taskPanoApiRequest.call(this, 'PUT', `/tasks/${taskId}/checklists/${checklistItemId}`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'addTag') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const tagId = this.getNodeParameter('tagId', i) as string;

						const body: IDataObject = {
							tag: parseInt(tagId, 10),
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/tags`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'removeTag') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const taskTagId = this.getNodeParameter('taskTagId', i) as string;

						const responseData = await taskPanoApiRequest.call(this, 'DELETE', `/tasks/${taskId}/tags/${taskTagId}`);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'addAssignee') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const assigneeId = this.getNodeParameter('assigneeId', i) as string;

						const body: IDataObject = {
							user_id: parseInt(assigneeId, 10),
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/assignees`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'removeAssignee') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const taskAssigneeId = this.getNodeParameter('taskAssigneeId', i) as string;

						const responseData = await taskPanoApiRequest.call(this, 'DELETE', `/tasks/${taskId}/assignees/${taskAssigneeId}`);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'addSubscription') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;

						const body: IDataObject = {
							user_id: parseInt(subscriptionId, 10),
						};

						const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/subscriptions`, body);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}

					if (operation === 'removeSubscription') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const taskSubscriptionId = this.getNodeParameter('taskSubscriptionId', i) as string;

						const responseData = await taskPanoApiRequest.call(this, 'DELETE', `/tasks/${taskId}/subscriptions/${taskSubscriptionId}`);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: {
							item: i,
						},
					});

					continue;
				}

				throw new NodeOperationError(this.getNode(), `Failed to ${operation} ${resource}: ${error.message}`, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
