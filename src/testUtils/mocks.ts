import { HttpResponse } from '../types/http'
import * as restClient from '../rest-client'

export function setupRestClientMock(responseData: unknown, status = 200): jest.SpyInstance {
    const response = { status, data: responseData, headers: {} } as HttpResponse
    return jest.spyOn(restClient, 'request').mockResolvedValue(response)
}
