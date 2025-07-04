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
