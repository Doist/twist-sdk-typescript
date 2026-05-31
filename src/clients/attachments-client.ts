import { v4 as uuid } from 'uuid'
import { ENDPOINT_ATTACHMENTS } from '../consts/endpoints'
import { type Attachment, AttachmentSchema } from '../types/entities'
import type { UploadAttachmentArgs } from '../types/requests'
import { uploadMultipartFile } from '../utils/multipart-upload'
import { BaseClient } from './base-client'

/**
 * Client for uploading file attachments to Twist.
 *
 * Attachments are uploaded independently, then referenced by passing the returned
 * {@link Attachment} into the `attachments` array of `comments.createComment`,
 * `conversationMessages.createMessage`, and similar calls.
 */
export class AttachmentsClient extends BaseClient {
    /**
     * Uploads a file and returns the created {@link Attachment}.
     *
     * Mirrors the canonical multipart upload used by twist-web: `POST /attachments/upload`
     * with the `file` binary plus `file_name`, `file_size`, `attachment_id`, and
     * `underlying_type` form fields.
     *
     * @param args - The file to upload and optional metadata.
     * @returns The created attachment, ready to attach to a comment or message.
     *
     * @example
     * ```typescript
     * import { readFile } from 'node:fs/promises'
     *
     * const attachment = await api.attachments.upload({
     *   file: await readFile('./diagram.png'),
     *   fileName: 'diagram.png',
     * })
     *
     * await api.comments.createComment({
     *   threadId: 789,
     *   content: 'See attached',
     *   attachments: [attachment],
     * })
     * ```
     */
    async upload(args: UploadAttachmentArgs): Promise<Attachment> {
        const data = await uploadMultipartFile<unknown>({
            baseUrl: this.getBaseUri(),
            authToken: this.apiToken,
            endpoint: `${ENDPOINT_ATTACHMENTS}/upload`,
            file: args.file,
            fileName: args.fileName,
            contentType: args.contentType,
            additionalFields: {
                attachment_id: args.attachmentId || uuid(),
            },
            customFetch: this.customFetch,
        })

        return AttachmentSchema.parse(data)
    }
}
