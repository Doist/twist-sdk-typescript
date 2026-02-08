import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { ConversationMessagesClient } from './conversation-messages-client'

describe('ConversationMessagesClient', () => {
    let client: ConversationMessagesClient

    beforeEach(() => {
        client = new ConversationMessagesClient({ apiToken: TEST_API_TOKEN })
    })

    describe('getMessage', () => {
        it('should get a single conversation message by id', async () => {
            const mockMessage = {
                id: 514069,
                content: 'Test message',
                conversation_id: 456,
                creator: 1,
                posted_ts: 1609459200,
                workspace_id: 1,
            }

            server.use(
                http.get(apiUrl('api/v3/conversation_messages/getone'), async ({ request }) => {
                    const url = new URL(request.url)
                    expect(url.searchParams.get('id')).toBe('514069')
                    expect(request.headers.get('Authorization')).toBe(`Bearer ${TEST_API_TOKEN}`)
                    return HttpResponse.json(mockMessage)
                }),
            )

            const result = await client.getMessage(514069)

            // Verify the response is properly transformed
            expect(result.id).toBe(514069)
            expect(result.content).toBe('Test message')
            expect(result.conversationId).toBe(456)
            expect(result.posted).toBeInstanceOf(Date)
        })
    })
})
