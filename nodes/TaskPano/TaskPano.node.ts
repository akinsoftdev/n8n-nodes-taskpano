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
import { taskPanoApiRequest, taskPanoApiRequestAllItems, getProjectHashFromNumericId } from './GenericFunctions';

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
						name: 'Create',
						value: 'create',
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
							'create',
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
						],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				default: '',
				required: true,
				description: 'The organization to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['create'],
						resource: ['task'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getProjects',
					loadOptionsDependsOn: ['organizationId'],
				},
				default: '',
				required: true,
				description: 'The project to create the task in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectNumericId',
				type: 'options',
				required: true,
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
						operation: ['create'],
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
						operation: ['create', 'createSubtask'],
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
					if (operation === 'create') {
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
