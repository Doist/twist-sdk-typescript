// biome-ignore lint/performance/noNamespaceImport: needed for jest.spyOn
import * as restClient from '../rest-client'
import { HttpResponse } from '../types/http'

export function setupRestClientMock(responseData: unknown, status = 200): jest.SpyInstance {
    const response = { status, data: responseData, headers: {} } as HttpResponse
    return jest.spyOn(restClient, 'request').mockResolvedValue(response)
}
