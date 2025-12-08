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
		| 'removeSubscription';
	project: 'getParticipants';
};

export type TaskPanoType = AllEntities<NodeMap>;

