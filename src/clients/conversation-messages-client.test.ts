import { vi } from 'vitest'
import { setupRestClientMock } from '../testUtils/mocks'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ConversationMessagesClient } from './conversation-messages-client'

describe('ConversationMessagesClient', () => {
    let client: ConversationMessagesClient
    let mockRequest: ReturnType<typeof setupRestClientMock>

    beforeEach(() => {
        client = new ConversationMessagesClient(TEST_API_TOKEN)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getMessage', () => {
        it('should get a single conversation message by id', async () => {
            const mockMessage = {
                id: 514069,
                content: 'Test message',
                conversationId: 456,
                creator: 1,
                created: new Date('2021-01-01T00:00:00Z'),
            }
            mockRequest = setupRestClientMock(mockMessage)

            const result = await client.getMessage(514069)

            expect(mockRequest).toHaveBeenCalledWith(
                'GET',
                'https://api.twist.com/api/v3/',
                'conversation_messages/getone',
                TEST_API_TOKEN,
                { id: 514069 },
            )
            expect(result).toEqual(mockMessage)
        })
    })
})
