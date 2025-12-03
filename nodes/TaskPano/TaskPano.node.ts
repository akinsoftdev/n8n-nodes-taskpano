import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
} from 'n8n-workflow';

import { router } from './actions/router';
import { versionDescription } from './actions/versionDescription';
import { listSearch, loadOptions } from './methods';

export class TaskPano implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...versionDescription,
		};
	}

	methods = {
		listSearch,
		loadOptions,
	};

	async execute(this: IExecuteFunctions) {
		return await router.call(this);
	}
}
