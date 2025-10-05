import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { mockChannel, mockWorkspace, TEST_API_TOKEN } from '../testUtils/test-defaults'
import { WorkspacesClient } from './workspaces-client'

describe('WorkspacesClient', () => {
    let client: WorkspacesClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new WorkspacesClient(TEST_API_TOKEN)
        mockRequest = setupRestClientMock(mockWorkspace)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getDefaultWorkspace', () => {
        it('should get the default workspace', async () => {
            const result = await client.getDefaultWorkspace()

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v3/',
                'workspaces/get_default',
                TEST_API_TOKEN,
            )
            expect(result).toEqual(mockWorkspace)
        })
    })

    describe('createWorkspace', () => {
        it('should create a workspace with name only', async () => {
            const result = await client.createWorkspace('New Workspace')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'workspaces/add',
                TEST_API_TOKEN,
                { name: 'New Workspace' },
            )
            expect(result).toEqual(mockWorkspace)
        })

        it('should create a workspace with tempId', async () => {
            await client.createWorkspace('New Workspace', 999)

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'workspaces/add',
                TEST_API_TOKEN,
                { name: 'New Workspace', tempId: 999 },
            )
        })
    })

    describe('updateWorkspace', () => {
        it('should update workspace name', async () => {
            const result = await client.updateWorkspace(123, 'Updated Name')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'workspaces/update',
                TEST_API_TOKEN,
                { id: 123, name: 'Updated Name' },
            )
            expect(result).toEqual(mockWorkspace)
        })
    })

    describe('removeWorkspace', () => {
        it('should remove workspace with password confirmation', async () => {
            await client.removeWorkspace(123, 'mypassword')

            expect(mockRequest).toHaveBeenCalledWith(
                'POST',
                'https://api.twist.com/api/v3/',
                'workspaces/remove',
                TEST_API_TOKEN,
                { id: 123, currentPassword: 'mypassword' },
            )
        })
    })

    describe('getPublicChannels', () => {
        it('should get public channels for workspace', async () => {
            mockRequest.mockResolvedValue({
                status: 200,
                data: [mockChannel],
                headers: {},
            })

            const result = await client.getPublicChannels(123)

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v3/',
                'workspaces/get_public_channels',
                TEST_API_TOKEN,
                { id: 123 },
            )
            expect(result).toEqual([mockChannel])
        })
    })
})
