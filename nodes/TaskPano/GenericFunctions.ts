import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

export const TASKPANO_BASE_URL = 'https://app.taskpano.com/api';
export const TASKPANO_API_VERSION = 'v1';

export async function taskPanoApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options = {
		method,
		body: Object.keys(body).length ? body : undefined,
		qs: Object.keys(qs).length ? qs : undefined,
		uri: `${TASKPANO_BASE_URL}/${TASKPANO_API_VERSION}${endpoint}`,
		json: true,
	};

	return this.helpers.requestWithAuthentication.call(this, 'taskPanoApi', options);
}

export async function taskPanoApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint: string,
	propertyName: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	let page = 1;
	let hasNextPage: string | null = null;

	do {
		const response = await taskPanoApiRequest.call(
			this,
			'GET',
			endpoint,
			body,
			{ ...qs, page, limit: 250 },
		);

		const container = response.data?.[propertyName] ?? {};
		const segment = container?.data ?? container;

		if (Array.isArray(segment)) {
			returnData.push(...segment);
		}

		hasNextPage = container?.next_page_url ?? null;

		page++;
	} while (hasNextPage);

	return returnData;
}

export async function getProjectHashFromNumericId(
	this: ILoadOptionsFunctions,
	organizationId: string,
	projectNumericId: string,
): Promise<string> {
	const projectsResponse = await taskPanoApiRequest.call(
		this,
		'GET',
		`/organizations/${organizationId}/projects`,
		{},
		{ folder_id: -1 },
	);

	const projects = projectsResponse.data?.projects || [];
	const project = projects.find((p: IDataObject) => p.id === parseInt(projectNumericId as string, 10));

	if (!project) {
		throw new NodeOperationError(this.getNode(), `Project with numeric ID ${projectNumericId} not found`);
	}

	return project.id_hash as string;
}

export async function getOrganizationNumericIdFromHash(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	organizationIdHash: string,
): Promise<number | null> {
	const { data } = await taskPanoApiRequest.call(this, 'GET', '/organizations');
	const ownedOrganizations = data?.organizations || [];
	const assignedOrganizations = data?.assigneedOrganizations || [];
	const allOrganizations = [...ownedOrganizations, ...assignedOrganizations];

	const organization = allOrganizations.find((org: IDataObject) => org.id_hash === organizationIdHash);

	return organization ? (organization.id as number) : null;
}

export async function loadLists(this: ILoadOptionsFunctions, filter?: string): Promise<INodePropertyOptions[]> {
	const operation = this.getCurrentNodeParameter('operation') as string;
	let projectId: string | undefined;
	let projectNumericId: string | undefined;
	let organizationId: string | undefined;

	if (operation === 'createTask') {
		const options = this.getCurrentNodeParameter('createTaskOptions') as IDataObject;
		projectId = options?.projectId as string;
	} else {
		const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
		organizationId = options?.organizationId as string;
		projectNumericId = options?.projectNumericId as string;
	}

	if (!projectId && !projectNumericId) {
		return [];
	}

	try {
		let projectHash: string;

		if (projectId) {
			projectHash = projectId as string;
		} else {
			if (!organizationId) {
				return [];
			}
			projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId as string);
		}

		const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/lists`);

		const lists = (response.data?.lists || []) as IDataObject[];

		let options = lists.map((list) => ({
			name: list.name as string,
			value: list.id as string,
		}));

		if (filter) {
			const filterLc = filter.toLowerCase();
			options = options.filter((option) => option.name.toLowerCase().includes(filterLc));
		}

		return options;
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load lists: ${error.message}`);
	}
}

export async function loadTasks(this: ILoadOptionsFunctions, filter?: string): Promise<INodePropertyOptions[]> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const projectNumericId = options?.projectNumericId as string;

	if (!projectNumericId) {
		return [];
	}

	try {
		const queryParams: IDataObject = { project_id: projectNumericId };

		if (filter) {
			queryParams.q = filter;
		}

		const tasks = await taskPanoApiRequestAllItems.call(this, '/tasks', 'tasks', {}, queryParams);

		return tasks.map((task: IDataObject) => ({
			name: task.subject as string,
			value: task.id_hash as string,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load tasks: ${error.message}`);
	}
}
