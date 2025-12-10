import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as createSubtask from './createSubtask.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as update from './update.operation';
import * as move from './move.operation';
import * as addChecklistItem from './addChecklistItem.operation';
import * as addComment from './addComment.operation';
import * as updateChecklistItem from './updateChecklistItem.operation';
import * as updateChecklistItemStatus from './updateChecklistItemStatus.operation';
import * as addTag from './addTag.operation';
import * as removeTag from './removeTag.operation';
import * as addAssignee from './addAssignee.operation';
import * as removeAssignee from './removeAssignee.operation';
import * as addSubscription from './addSubscription.operation';
import * as removeSubscription from './removeSubscription.operation';
import * as updateCustomField from './updateCustomField.operation';
import * as getAttachments from './getAttachments.operation';
import * as downloadAttachment from './downloadAttachment.operation';
import * as uploadAttachment from './uploadAttachment.operation';
import * as deleteAttachment from './deleteAttachment.operation';

export {
	create,
	createSubtask,
	get,
	getAll,
	update,
	move,
	addChecklistItem,
	addComment,
	updateChecklistItem,
	updateChecklistItemStatus,
	addTag,
	removeTag,
	addAssignee,
	removeAssignee,
	addSubscription,
	removeSubscription,
	updateCustomField,
	getAttachments,
	downloadAttachment,
	uploadAttachment,
	deleteAttachment,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
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
				name: 'Get Task',
				value: 'get',
				description: 'Get a task by ID',
				action: 'Get a task',
			},
			{
				name: 'Get Tasks',
				value: 'getAll',
				description: 'Get multiple tasks with filters',
				action: 'Get tasks',
			},
			{
				name: 'Move Task',
				value: 'move',
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
			name: 'Update Custom Field',
			value: 'updateCustomField',
			description: 'Update a custom field value on a task',
			action: 'Update a custom field',
		},
		{
			name: 'Update Task',
			value: 'update',
			description: 'Update a task',
			action: 'Update a task',
		},
		{
			name: 'Get Attachments',
			value: 'getAttachments',
			description: 'Get all attachments of a task',
			action: 'Get attachments',
		},
		{
			name: 'Download Attachment',
			value: 'downloadAttachment',
			description: 'Download an attachment from a task',
			action: 'Download an attachment',
		},
		{
			name: 'Upload Attachment',
			value: 'uploadAttachment',
			description: 'Upload a file attachment to a task',
			action: 'Upload an attachment',
		},
		{
			name: 'Delete Attachment',
			value: 'deleteAttachment',
			description: 'Delete an attachment from a task',
			action: 'Delete an attachment',
		},
		],
		default: 'create',
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
	},
	...create.description,
	...createSubtask.description,
	...get.description,
	...getAll.description,
	...update.description,
	...move.description,
	...addChecklistItem.description,
	...addComment.description,
	...updateChecklistItem.description,
	...updateChecklistItemStatus.description,
	...addTag.description,
	...removeTag.description,
	...addAssignee.description,
	...removeAssignee.description,
	...addSubscription.description,
	...removeSubscription.description,
	...updateCustomField.description,
	...getAttachments.description,
	...downloadAttachment.description,
	...uploadAttachment.description,
	...deleteAttachment.description,
];
