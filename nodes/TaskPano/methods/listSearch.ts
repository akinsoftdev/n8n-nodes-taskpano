import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	NodeOperationError,
} from 'n8n-workflow';
import { taskPanoApiRequest } from '../transport';
import { loadLists, loadTasks, getProjectHashFromNumericId } from '../helpers/utils';

export async function getProjects(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const options = this.getCurrentNodeParameter('projectOptions') as IDataObject;
	const organizationId = options?.organizationId as string | undefined;

	if (!organizationId) {
		return { results: [] };
	}

	try {
		const response = await taskPanoApiRequest.call(
			this,
			'GET',
			`/organizations/${organizationId}/projects`,
			{},
			{ folder_id: -1 },
		);

		let projects = response.data?.projects || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			projects = projects.filter((project: IDataObject) =>
				(project.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = projects.map((project: IDataObject) => ({
			name: project.name as string,
			value: project.id_hash as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load projects: ${error.message}`);
	}
}

export async function getLists(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const results = await loadLists.call(this, filter);

	return {
		results,
	};
}

export async function getTasks(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const results = await loadTasks.call(this, filter);

	return {
		results,
	};
}

export async function getAvailableTags(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;
	const projectNumericId = options?.projectNumericId as string;
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!organizationId || !projectNumericId || !taskId) {
		return { results: [] };
	}

	try {
		const projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId);

		const projectResponse = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/tags`);
		const projectTags = projectResponse.data?.tags || [];

		const taskResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/tags`);
		const taskTags = taskResponse.data?.tags || [];

		const currentTaskTagIds = new Set(taskTags.map((tag: IDataObject) => tag.id));

		let availableTags = projectTags.filter((tag: IDataObject) => !currentTaskTagIds.has(tag.id));

		if (filter) {
			const filterLc = filter.toLowerCase();
			availableTags = availableTags.filter((tag: IDataObject) =>
				(tag.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = availableTags.map((tag: IDataObject) => ({
			name: tag.name as string,
			value: tag.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load available tags: ${error.message}`);
	}
}

export async function getTaskTags(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!taskId) {
		return { results: [] };
	}

	try {
		const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/tags`);

		let taskTags = response.data?.tags || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			taskTags = taskTags.filter((tag: IDataObject) =>
				(tag.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = taskTags.map((tag: IDataObject) => ({
			name: tag.name as string,
			value: tag.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load task tags: ${error.message}`);
	}
}

export async function getChecklistItems(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!taskId) {
		return { results: [] };
	}

	try {
		const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/checklists`);

		let checklistItems = response.data?.checklists || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			checklistItems = checklistItems.filter((item: IDataObject) =>
				(item.subject as string).toLowerCase().includes(filterLc)
			);
		}

		const results = checklistItems.map((item: IDataObject) => ({
			name: item.subject as string,
			value: item.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load checklist items: ${error.message}`);
	}
}

export async function getAvailableAssignees(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;
	const projectNumericId = options?.projectNumericId as string;
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!organizationId || !projectNumericId || !taskId) {
		return { results: [] };
	}

	try {
		const projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId);

		const projectAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/assignees`);
		const projectAssignees = projectAssigneesResponse.data?.projectAssignees || [];

		const taskAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/assignees`);
		const taskAssignees = taskAssigneesResponse.data?.assignees || [];

		const currentTaskAssigneeIds = new Set(taskAssignees.map((assignee: IDataObject) => assignee.id));

		let availableAssignees = projectAssignees.filter((assignee: IDataObject) =>
			!currentTaskAssigneeIds.has(assignee.id)
		);

		if (filter) {
			const filterLc = filter.toLowerCase();
			availableAssignees = availableAssignees.filter((assignee: IDataObject) =>
				(assignee.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = availableAssignees.map((assignee: IDataObject) => ({
			name: assignee.name as string,
			value: assignee.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load available assignees: ${error.message}`);
	}
}

export async function getTaskAssignees(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!taskId) {
		return { results: [] };
	}

	try {
		const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/assignees`);

		let taskAssignees = response.data?.assignees || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			taskAssignees = taskAssignees.filter((assignee: IDataObject) =>
				(assignee.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = taskAssignees.map((assignee: IDataObject) => ({
			name: assignee.name as string,
			value: assignee.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load task assignees: ${error.message}`);
	}
}

export async function getAvailableSubscriptions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;
	const projectNumericId = options?.projectNumericId as string;
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!organizationId || !projectNumericId || !taskId) {
		return { results: [] };
	}

	try {
		const projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId);

		const projectAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/assignees`);
		const projectAssignees = projectAssigneesResponse.data?.projectAssignees || [];

		const taskAssigneesResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/assignees`);
		const taskAssignees = taskAssigneesResponse.data?.assignees || [];

		const taskSubscriptionsResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/subscriptions`);
		const taskSubscriptions = taskSubscriptionsResponse.data?.subscriptions || [];

		const currentTaskAssigneeIds = new Set(taskAssignees.map((assignee: IDataObject) => assignee.id));
		const currentTaskSubscriptionIds = new Set(taskSubscriptions.map((subscription: IDataObject) => subscription.id));

		let availableSubscriptions = projectAssignees.filter((assignee: IDataObject) =>
			!currentTaskSubscriptionIds.has(assignee.id) && !currentTaskAssigneeIds.has(assignee.id)
		);

		if (filter) {
			const filterLc = filter.toLowerCase();
			availableSubscriptions = availableSubscriptions.filter((assignee: IDataObject) =>
				(assignee.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = availableSubscriptions.map((assignee: IDataObject) => ({
			name: assignee.name as string,
			value: assignee.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load available subscriptions: ${error.message}`);
	}
}

export async function getTaskSubscriptions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!taskId) {
		return { results: [] };
	}

	try {
		const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/subscriptions`);

		let taskSubscriptions = response.data?.subscriptions || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			taskSubscriptions = taskSubscriptions.filter((subscription: IDataObject) =>
				(subscription.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = taskSubscriptions.map((subscription: IDataObject) => ({
			name: subscription.name as string,
			value: subscription.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load task subscriptions: ${error.message}`);
	}
}

export async function getCustomFields(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;
	const projectNumericId = options?.projectNumericId as string;
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	try {
		let projectHash: string | undefined;

		if (organizationId && projectNumericId) {
			projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId);
		} else if (taskId) {
			const taskResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/show`);
			const task = taskResponse.data?.task;

			if (task?.list?.project?.id_hash) {
				projectHash = task.list.project.id_hash;
			} else if (task?.project?.id_hash) {
				projectHash = task.project.id_hash;
			}
		}

		if (!projectHash) {
			return { results: [] };
		}

		const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/custom-fields`);

		let customFields = response.data || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			customFields = customFields.filter((field: IDataObject) =>
				(field.name as string).toLowerCase().includes(filterLc)
			);
		}

		const results = customFields.map((field: IDataObject) => ({
			name: `${field.name as string} (${field.type as string})`,
			value: field.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load custom fields: ${error.message}`);
	}
}

export async function getCustomFieldSelectOptions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const options = this.getCurrentNodeParameter('taskOptions') as IDataObject;
	const organizationId = options?.organizationId as string;
	const projectNumericId = options?.projectNumericId as string;
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;
	const customFieldId = this.getCurrentNodeParameter('customFieldId', {
		extractValue: true,
	}) as string | undefined;

	if (!customFieldId) {
		return { results: [] };
	}

	try {
		let projectHash: string | undefined;

		if (organizationId && projectNumericId) {
			projectHash = await getProjectHashFromNumericId.call(this, organizationId, projectNumericId);
		} else if (taskId) {
			const taskResponse = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/show`);
			const task = taskResponse.data?.task;

			if (task?.list?.project?.id_hash) {
				projectHash = task.list.project.id_hash;
			} else if (task?.project?.id_hash) {
				projectHash = task.project.id_hash;
			}
		}

		if (!projectHash) {
			return { results: [] };
		}

		const response = await taskPanoApiRequest.call(this, 'GET', `/projects/${projectHash}/custom-fields`);
		const customFields = response.data || [];

		const customField = customFields.find((field: IDataObject) => String(field.id) === String(customFieldId));

		if (!customField || customField.type !== 'select') {
			return { results: [] };
		}

		const params = customField.params as IDataObject;
		const selectParams = params?.select as IDataObject;
		let selectOptions = (selectParams?.options as IDataObject[]) || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			selectOptions = selectOptions.filter((opt: IDataObject) =>
				(opt.title as string).toLowerCase().includes(filterLc)
			);
		}

		const results = selectOptions.map((opt: IDataObject) => ({
			name: opt.title as string,
			value: opt.value as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load select options: ${error.message}`);
	}
}

export async function getTaskAttachments(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const taskId = this.getCurrentNodeParameter('taskId', {
		extractValue: true,
	}) as string | undefined;

	if (!taskId) {
		return { results: [] };
	}

	try {
		const response = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/attachments`);

		let attachments = response.data?.attachments || response.attachments || response.data || [];

		if (filter) {
			const filterLc = filter.toLowerCase();
			attachments = attachments.filter((attachment: IDataObject) =>
				(attachment.original_name as string || attachment.name as string || '').toLowerCase().includes(filterLc)
			);
		}

		const results = attachments.map((attachment: IDataObject) => ({
			name: (attachment.original_name as string) || (attachment.name as string) || `Attachment ${attachment.id}`,
			value: attachment.id as string,
		}));

		return { results };
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load task attachments: ${error.message}`);
	}
}
