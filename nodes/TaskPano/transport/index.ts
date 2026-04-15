import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const TASKPANO_BASE_URL = 'http://app.taskpano.test:8010/api';
export const TASKPANO_API_VERSION = 'v1';

export async function taskPanoApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const options = {
		method,
		body: Object.keys(body).length ? body : undefined,
		qs: Object.keys(qs).length ? qs : undefined,
		url: `${TASKPANO_BASE_URL}/${TASKPANO_API_VERSION}${endpoint}`,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'taskPanoApi', options);
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

		const responseData = response.data as IDataObject;
		const container = ((responseData?.[propertyName] ?? {}) as IDataObject);
		const segment = (container?.data ?? container) as IDataObject[];

		if (Array.isArray(segment)) {
			returnData.push(...(segment as IDataObject[]));
		}

		hasNextPage = (container?.next_page_url as string | null) ?? null;

		page++;
	} while (hasNextPage);

	return returnData;
}

