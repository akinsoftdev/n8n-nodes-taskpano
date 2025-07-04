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
import { taskPanoApiRequest } from './GenericFunctions';

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
						name: 'Create',
						value: 'create',
						description: 'Create a new task',
						action: 'Create a task',
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
						operation: ['create'],
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
				displayName: 'Task Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
						resource: ['task'],
					},
				},
				default: '',
				placeholder: 'e.g., Implement user authentication',
				description: 'The name/subject of the task to create',
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
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
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
