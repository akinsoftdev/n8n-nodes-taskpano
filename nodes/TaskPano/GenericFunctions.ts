import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const TASKPANO_BASE_URL = 'http://localhost:8010/api';
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
