import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as task from './task/Task.resource';
import * as project from './project/Project.resource';
import type { TaskPanoType } from './node.type';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const resource = this.getNodeParameter<TaskPanoType>('resource', 0);
	const operation = this.getNodeParameter('operation', 0);

	const taskPanoNodeData = {
		resource,
		operation,
	} as TaskPanoType;

	let returnData: INodeExecutionData[] = [];

	try {
		switch (taskPanoNodeData.resource) {
			case 'task':
				returnData = await task[taskPanoNodeData.operation].execute.call(this, items);
				break;
			case 'project':
				returnData = await project[taskPanoNodeData.operation].execute.call(this, items);
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The resource "${resource}" is not supported!`,
				);
		}
	} catch (error) {
		throw error;
	}

	return [returnData];
}
