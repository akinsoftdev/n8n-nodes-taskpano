import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { taskPanoApiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'taskOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Organization Name or ID',
				name: 'organizationId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				default: '',
				description: 'The organization. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectNumericId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjectsNumeric',
					loadOptionsDependsOn: ['taskOptions.organizationId'],
				},
				default: '',
				description: 'Select the project by its numeric ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	{
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskOptions.projectNumericId'],
		},
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9]{8,}',
							errorMessage: 'Not a valid TaskPano Task ID',
						},
					},
				],
				hint: 'Enter a task ID',
				placeholder: 'G7jfdgY5',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTasks',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Attachment Name or ID',
		name: 'attachmentId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list' },
		description: 'Select the attachment to download. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsDependsOn: ['taskId'],
		},
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				hint: 'Enter an attachment ID',
				placeholder: 'e.g., 123',
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTaskAttachments',
					searchable: true,
					searchFilterRequired: false,
				},
			},
		],
	},
	{
		displayName: 'Output Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		placeholder: 'e.g., data',
		description: 'Name of the binary property to store the downloaded file',
	},
];

const displayOptions = {
	show: {
		resource: ['task'],
		operation: ['downloadAttachment'],
	},
};

export const description = properties.map((property) => ({
	...property,
	displayOptions,
}));

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const taskId = this.getNodeParameter('taskId', i, undefined, {
				extractValue: true,
			}) as string;
			const attachmentId = this.getNodeParameter('attachmentId', i, undefined, {
				extractValue: true,
			}) as string;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

			const signedUrlResponse = await taskPanoApiRequest.call(
				this,
				'GET',
				`/tasks/${taskId}/attachments/${attachmentId}/signed-url`,
			);

			const responseData = signedUrlResponse.data || signedUrlResponse;
			const signedUrl = responseData.url;

			if (!signedUrl) {
				throw new Error('Failed to get signed URL for attachment');
			}

			const fileName = responseData.original_name || 'attachment';
			const mimeType = responseData.mime_type || 'application/octet-stream';

			const fileResponse = await this.helpers.httpRequest({
				method: 'GET',
				url: signedUrl,
				returnFullResponse: true,
				encoding: 'arraybuffer',
			});

			const binaryData = await this.helpers.prepareBinaryData(
				fileResponse.body as unknown as Uint8Array,
				fileName,
				mimeType,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				[{
					json: {
						fileName,
						mimeType,
						fileSize: binaryData.fileSize,
						attachmentId,
					},
					binary: {
						[binaryPropertyName]: binaryData,
					},
				}],
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
				continue;
			}
			throw error;
		}
	}

	return returnData;
}

