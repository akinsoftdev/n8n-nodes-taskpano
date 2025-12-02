import { INodeProperties } from 'n8n-workflow';

export const taskPanoProperties: INodeProperties[] = [
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
		displayName: 'Options',
		name: 'createTaskOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['createTask'],
				resource: ['task'],
			},
		},
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
		displayName: 'Options',
		name: 'taskOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: [
					'createSubtask',
					'getTask',
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
				],
				resource: ['task'],
			},
		},
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
		displayName: 'List Name or ID',
		name: 'listId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'The list to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['createTaskOptions.projectId'],
		},
		displayOptions: {
			show: {
				operation: ['createTask'],
				resource: ['task'],
			},
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
		displayName: 'Parent Task Name or ID',
		name: 'parentTaskId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the parent task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskOptions.projectNumericId'],
		},
		displayOptions: {
			show: {
				operation: ['createSubtask'],
				resource: ['task'],
			},
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
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskOptions.projectNumericId'],
		},
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
		displayName: 'Target List Name or ID',
		name: 'targetListId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the target list to move the task to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskOptions.organizationId', 'taskOptions.projectNumericId'],
		},
		displayOptions: {
			show: {
				operation: ['moveTask'],
				resource: ['task'],
			},
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
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the checklist item to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskId'],
		},
		displayOptions: {
			show: {
				operation: ['updateChecklistItem', 'updateChecklistItemStatus'],
				resource: ['task'],
			},
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
		displayOptions: {
			show: {
				operation: ['addTag'],
				resource: ['task'],
			},
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
	{
		displayName: 'Tag Name or ID',
		name: 'taskTagId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the tag to remove from the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskId'],
		},
		displayOptions: {
			show: {
				operation: ['removeTag'],
				resource: ['task'],
			},
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
					searchListMethod: 'getTaskTags',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Assignee Name or ID',
		name: 'assigneeId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the assignee to add to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: [
				'taskOptions.organizationId',
				'taskOptions.projectNumericId',
				'taskId',
			],
		},
		displayOptions: {
			show: {
				operation: ['addAssignee'],
				resource: ['task'],
			},
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
							errorMessage: 'Assignee ID must be numeric',
						},
					},
				],
				hint: 'Enter an assignee ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getAvailableAssignees',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Assignee Name or ID',
		name: 'taskAssigneeId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the assignee to remove from the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskId'],
		},
		displayOptions: {
			show: {
				operation: ['removeAssignee'],
				resource: ['task'],
			},
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
							errorMessage: 'Assignee ID must be numeric',
						},
					},
				],
				hint: 'Enter an assignee ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTaskAssignees',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Subscription Name or ID',
		name: 'subscriptionId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the subscription to add to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: [
				'taskOptions.organizationId',
				'taskOptions.projectNumericId',
				'taskId',
			],
		},
		displayOptions: {
			show: {
				operation: ['addSubscription'],
				resource: ['task'],
			},
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
							errorMessage: 'Subscription ID must be numeric',
						},
					},
				],
				hint: 'Enter a subscription ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getAvailableSubscriptions',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Subscription Name or ID',
		name: 'taskSubscriptionId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the subscription to remove from the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskId'],
		},
		displayOptions: {
			show: {
				operation: ['removeSubscription'],
				resource: ['task'],
			},
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
							errorMessage: 'Subscription ID must be numeric',
						},
					},
				],
				hint: 'Enter a subscription ID',
				placeholder: '12345',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTaskSubscriptions',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Organization Name or ID',
		name: 'organizationId',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				operation: ['getTasks'],
				resource: ['task'],
			},
		},
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
];

