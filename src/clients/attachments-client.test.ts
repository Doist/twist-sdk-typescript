import { HttpResponse, http } from 'msw'
import { apiUrl } from '../testUtils/msw-handlers'
import { server } from '../testUtils/msw-setup'
import { TEST_API_TOKEN } from '../testUtils/test-defaults'
import { AttachmentsClient } from './attachments-client'

const UPLOAD_URL = apiUrl('api/v3/attachments/upload')

const mockAttachmentResponse = {
    attachment_id: 'abc-123',
    url_type: 'file',
    file_name: 'diagram.png',
    file_size: 11,
    underlying_type: 'image/png',
    url: 'https://twist.com/attachments/abc-123/diagram.png',
    upload_state: 'uploaded',
}

describe('AttachmentsClient', () => {
    let client: AttachmentsClient

    beforeEach(() => {
        client = new AttachmentsClient({ apiToken: TEST_API_TOKEN })
    })

    describe('upload', () => {
        it('uploads a Buffer with the canonical multipart fields', async () => {
            let capturedForm: FormData | undefined
            let capturedAuth: string | null = null
            let capturedContentType: string | null = null

            server.use(
                http.post(UPLOAD_URL, async ({ request }) => {
                    capturedAuth = request.headers.get('Authorization')
                    capturedContentType = request.headers.get('Content-Type')
                    capturedForm = await request.formData()
                    return HttpResponse.json(mockAttachmentResponse)
                }),
            )

            const result = await client.upload({
                file: Buffer.from('hello world'),
                fileName: 'diagram.png',
            })

            expect(capturedAuth).toBe(`Bearer ${TEST_API_TOKEN}`)
            // multipart boundary content-type, never application/json
            expect(capturedContentType).toContain('multipart/form-data')

            const file = capturedForm?.get('file')
            expect(file).toBeInstanceOf(Blob)
            expect(capturedForm?.get('file_name')).toBe('diagram.png')
            expect(capturedForm?.get('file_size')).toBe('11')
            expect(capturedForm?.get('underlying_type')).toBe('image/png')
            // A UUID is generated when none is supplied.
            const attachmentId = capturedForm?.get('attachment_id')
            expect(attachmentId).toEqual(expect.any(String))
            expect((attachmentId as string).length).toBeGreaterThan(0)

            // Response is camel-cased and validated.
            expect(result.attachmentId).toBe('abc-123')
            expect(result.fileName).toBe('diagram.png')
            expect(result.url).toBe('https://twist.com/attachments/abc-123/diagram.png')
        })

        it('uses a caller-supplied attachmentId', async () => {
            let capturedForm: FormData | undefined

            server.use(
                http.post(UPLOAD_URL, async ({ request }) => {
                    capturedForm = await request.formData()
                    return HttpResponse.json({
                        ...mockAttachmentResponse,
                        attachment_id: 'fixed-id',
                    })
                }),
            )

            const result = await client.upload({
                file: Buffer.from('data'),
                fileName: 'notes.txt',
                attachmentId: 'fixed-id',
            })

            expect(capturedForm?.get('attachment_id')).toBe('fixed-id')
            expect(result.attachmentId).toBe('fixed-id')
        })

        it('uploads a Blob and infers the file name and type', async () => {
            let capturedForm: FormData | undefined

            server.use(
                http.post(UPLOAD_URL, async ({ request }) => {
                    capturedForm = await request.formData()
                    return HttpResponse.json(mockAttachmentResponse)
                }),
            )

            const blob = new File([new Uint8Array([1, 2, 3, 4])], 'photo.jpg', {
                type: 'image/jpeg',
            })

            await client.upload({ file: blob })

            expect(capturedForm?.get('file_name')).toBe('photo.jpg')
            expect(capturedForm?.get('file_size')).toBe('4')
            expect(capturedForm?.get('underlying_type')).toBe('image/jpeg')
        })

        it('throws when uploading a Buffer without a fileName', async () => {
            await expect(client.upload({ file: Buffer.from('x') })).rejects.toThrow(
                'fileName is required when uploading from a Buffer',
            )
        })
    })
})
