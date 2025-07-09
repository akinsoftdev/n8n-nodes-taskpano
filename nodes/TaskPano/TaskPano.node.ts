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
import { taskPanoApiRequest, taskPanoApiRequestAllItems } from './GenericFunctions';

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
						name: 'Update Checklist Item',
						value: 'updateChecklistItem',
						description: 'Update a checklist item subject',
						action: 'Update a checklist item',
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
							'updateChecklistItem',
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
							'updateChecklistItem',
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
							'updateChecklistItem',
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
						operation: ['updateChecklistItem'],
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

				if (!projectId) {
					return [];
				}

				try {
					const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectId}/lists`);

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
					const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/show`);

					const checklistItems = response.data?.task?.task_checklists_with_separators || [];

					return checklistItems.map((item: IDataObject) => ({
						name: item.subject as string,
						value: item.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load checklist items: ${error.message}`);
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
