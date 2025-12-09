import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	task:
		| 'create'
		| 'createSubtask'
		| 'get'
		| 'getAll'
		| 'update'
		| 'move'
		| 'addChecklistItem'
		| 'addComment'
		| 'updateChecklistItem'
		| 'updateChecklistItemStatus'
		| 'addTag'
		| 'removeTag'
		| 'addAssignee'
		| 'removeAssignee'
		| 'addSubscription'
		| 'removeSubscription'
		| 'updateCustomField'
		| 'getAttachments'
		| 'uploadAttachment'
		| 'deleteAttachment';
	project: 'getParticipants' | 'getCustomFields';
};

export type TaskPanoType = AllEntities<NodeMap>;

