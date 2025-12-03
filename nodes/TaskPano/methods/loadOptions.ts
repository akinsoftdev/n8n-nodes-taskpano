import {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { taskPanoApiRequest } from '../transport';
import { loadLists, loadTasks, getProjectHashFromNumericId } from '../helpers/utils';

export async function getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
}

export async function getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const options = this.getCurrentNodeParameter('createTaskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;

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
}

export async function getProjectsNumeric(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;

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
}

export async function getProjectsForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const organizationId = this.getCurrentNodeParameter('organizationId') as string;
	const filters = this.getCurrentNodeParameter('filters') as IDataObject;
	const folderId = filters?.folder_id;

	if (!organizationId) {
		return [];
	}

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
}

export { loadLists as getLists };

export async function getListsForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const organizationId = this.getCurrentNodeParameter('organizationId') as string;
	const filters = this.getCurrentNodeParameter('filters') as IDataObject;
	const projectNumericId = filters?.project_id as string;

	if (!projectNumericId || !organizationId) {
		return [];
	}

	try {
		const projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId);

		const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/lists`);

		const lists = response.data?.lists || [];

		return lists.map((list: IDataObject) => ({
			name: list.name as string,
			value: list.id as string,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load lists: ${error.message}`);
	}
}

export async function getUsersForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const organizationId = this.getCurrentNodeParameter('organizationId') as string;
	const filters = this.getCurrentNodeParameter('filters') as IDataObject;
	const projectNumericId = filters?.project_id as string;

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
}

export async function getTagsForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const organizationId = this.getCurrentNodeParameter('organizationId') as string;
	const filters = this.getCurrentNodeParameter('filters') as IDataObject;
	const projectNumericId = filters?.project_id as string;
	const folderId = filters?.folder_id;

	if (!organizationId) {
		return [];
	}

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
}

export async function getFoldersForFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const organizationId = this.getCurrentNodeParameter('organizationId') as string;

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
}

export { loadTasks as getTasks };
