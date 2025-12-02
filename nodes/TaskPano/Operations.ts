import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import {
	taskPanoApiRequest,
	taskPanoApiRequestAllItems,
	getOrganizationNumericIdFromHash,
} from './GenericFunctions';

async function handleCreateTask(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const listId = this.getNodeParameter('listId', i, undefined, {
		extractValue: true,
	}) as string;
	const name = this.getNodeParameter('name', i) as string;

	const body: IDataObject = {
		listId: parseInt(listId, 10),
		subject: name,
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', '/tasks', body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleCreateSubtask(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const parentTaskId = this.getNodeParameter('parentTaskId', i, undefined, {
		extractValue: true,
	}) as string;
	const name = this.getNodeParameter('name', i) as string;

	const body: IDataObject = {
		subject: name,
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${parentTaskId}/subtasks`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleGetTask(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;

	const responseData = await taskPanoApiRequest.call(this, 'GET', `/tasks/${taskId}/show`);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleGetTasks(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
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

	return tasks.map((task: IDataObject) => ({
		json: task,
		pairedItem: {
			item: i,
		},
	}));
}

async function handleUpdateTask(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		...additionalFields,
	};

	const responseData = await taskPanoApiRequest.call(this, 'PUT', `/tasks/${taskId}`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleMoveTask(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const targetListId = this.getNodeParameter('targetListId', i, undefined, {
		extractValue: true,
	}) as string;

	const responseData = await taskPanoApiRequest.call(this, 'PATCH', `/tasks/${taskId}/move/${targetListId}`);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleAddChecklistItem(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const checklistItem = this.getNodeParameter('checklistItem', i) as string;

	const body: IDataObject = {
		subject: checklistItem,
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/checklists`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleAddComment(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const comment = this.getNodeParameter('comment', i) as string;

	const body: IDataObject = {
		comment: comment,
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/activities`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleUpdateChecklistItem(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const checklistItemId = this.getNodeParameter('checklistItemId', i, undefined, {
		extractValue: true,
	}) as string;
	const newSubject = this.getNodeParameter('newSubject', i) as string;

	const body: IDataObject = {
		subject: newSubject,
	};

	const responseData = await taskPanoApiRequest.call(this, 'PUT', `/tasks/${taskId}/checklists/${checklistItemId}`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleUpdateChecklistItemStatus(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const checklistItemId = this.getNodeParameter('checklistItemId', i, undefined, {
		extractValue: true,
	}) as string;
	const status = this.getNodeParameter('checklistItemStatus', i) as boolean;

	const body: IDataObject = {
		completed: status,
	};

	const responseData = await taskPanoApiRequest.call(this, 'PUT', `/tasks/${taskId}/checklists/${checklistItemId}`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleAddTag(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const tagId = this.getNodeParameter('tagId', i, undefined, {
		extractValue: true,
	}) as string;

	const body: IDataObject = {
		tag: parseInt(tagId, 10),
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/tags`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleRemoveTag(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const taskTagId = this.getNodeParameter('taskTagId', i, undefined, {
		extractValue: true,
	}) as string;

	const responseData = await taskPanoApiRequest.call(this, 'DELETE', `/tasks/${taskId}/tags/${taskTagId}`);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleAddAssignee(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const assigneeId = this.getNodeParameter('assigneeId', i, undefined, {
		extractValue: true,
	}) as string;

	const body: IDataObject = {
		user_id: parseInt(assigneeId, 10),
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/assignees`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleRemoveAssignee(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const taskAssigneeId = this.getNodeParameter('taskAssigneeId', i, undefined, {
		extractValue: true,
	}) as string;

	const responseData = await taskPanoApiRequest.call(this, 'DELETE', `/tasks/${taskId}/assignees/${taskAssigneeId}`);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleAddSubscription(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const subscriptionId = this.getNodeParameter('subscriptionId', i, undefined, {
		extractValue: true,
	}) as string;

	const body: IDataObject = {
		user_id: parseInt(subscriptionId, 10),
	};

	const responseData = await taskPanoApiRequest.call(this, 'POST', `/tasks/${taskId}/subscriptions`, body);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

async function handleRemoveSubscription(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const taskId = this.getNodeParameter('taskId', i, undefined, {
		extractValue: true,
	}) as string;
	const taskSubscriptionId = this.getNodeParameter('taskSubscriptionId', i, undefined, {
		extractValue: true,
	}) as string;

	const responseData = await taskPanoApiRequest.call(this, 'DELETE', `/tasks/${taskId}/subscriptions/${taskSubscriptionId}`);

	return {
		json: responseData,
		pairedItem: {
			item: i,
		},
	};
}

export async function executeTaskOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	switch (operation) {
		case 'createTask':
			return await handleCreateTask.call(this, i);
		case 'createSubtask':
			return await handleCreateSubtask.call(this, i);
		case 'getTask':
			return await handleGetTask.call(this, i);
		case 'getTasks':
			return await handleGetTasks.call(this, i);
		case 'updateTask':
			return await handleUpdateTask.call(this, i);
		case 'moveTask':
			return await handleMoveTask.call(this, i);
		case 'addChecklistItem':
			return await handleAddChecklistItem.call(this, i);
		case 'addComment':
			return await handleAddComment.call(this, i);
		case 'updateChecklistItem':
			return await handleUpdateChecklistItem.call(this, i);
		case 'updateChecklistItemStatus':
			return await handleUpdateChecklistItemStatus.call(this, i);
		case 'addTag':
			return await handleAddTag.call(this, i);
		case 'removeTag':
			return await handleRemoveTag.call(this, i);
		case 'addAssignee':
			return await handleAddAssignee.call(this, i);
		case 'removeAssignee':
			return await handleRemoveAssignee.call(this, i);
		case 'addSubscription':
			return await handleAddSubscription.call(this, i);
		case 'removeSubscription':
			return await handleRemoveSubscription.call(this, i);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

