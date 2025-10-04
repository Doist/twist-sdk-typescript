// biome-ignore lint/performance/noNamespaceImport: needed for vi.spyOn
import * as restClient from '../rest-client'
import type { HttpResponse } from '../types/http'
import { vi } from 'vitest'

export function setupRestClientMock(responseData: unknown, status = 200) {
    const response = { status, data: responseData, headers: {} } as HttpResponse
    return vi.spyOn(restClient, 'request').mockResolvedValue(response)
}
