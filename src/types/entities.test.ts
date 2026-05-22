import {
    AttachmentSchema,
    ChannelSchema,
    createChannelSchema,
    createCommentSchema,
    createConversationMessageSchema,
    createConversationSchema,
    createInboxThreadSchema,
    createThreadSchema,
} from './entities'

describe('AttachmentSchema', () => {
    it('parses a minimal payload (only required fields)', () => {
        const result = AttachmentSchema.parse({
            attachmentId: 'abc123',
            urlType: 'file',
        })
        expect(result.attachmentId).toBe('abc123')
        expect(result.urlType).toBe('file')
    })

    it('parses a full file attachment', () => {
        const result = AttachmentSchema.parse({
            attachmentId: 'abc123',
            urlType: 'file',
            title: 'spec.pdf',
            url: 'https://files.twist.com/abc/spec.pdf',
            fileName: 'spec.pdf',
            fileSize: 12345,
            underlyingType: 'application/pdf',
            uploadState: 'uploaded',
        })
        expect(result.fileSize).toBe(12345)
        expect(result.underlyingType).toBe('application/pdf')
        expect(result.uploadState).toBe('uploaded')
    })

    it('parses an image attachment with dimensions', () => {
        const result = AttachmentSchema.parse({
            attachmentId: 'img1',
            urlType: 'image',
            image: 'https://files.twist.com/abc/photo.png',
            imageWidth: 1920,
            imageHeight: 1080,
            underlyingType: 'image/png',
        })
        expect(result.imageWidth).toBe(1920)
        expect(result.imageHeight).toBe(1080)
    })

    it('parses an unfurled GIF with video fields', () => {
        const result = AttachmentSchema.parse({
            attachmentId: 'gif1',
            urlType: 'image',
            image: 'https://media.giphy.com/abc/giphy.gif',
            video: 'https://media.giphy.com/abc/giphy.mp4',
            videoType: 'video/mp4',
            videoAutoPlay: true,
        })
        expect(result.video).toBe('https://media.giphy.com/abc/giphy.mp4')
        expect(result.videoAutoPlay).toBe(true)
    })

    it('parses a link preview (url_type: website)', () => {
        const result = AttachmentSchema.parse({
            attachmentId: 'link1',
            urlType: 'website',
            url: 'https://example.com',
            title: 'Example',
            description: 'A useful page',
        })
        expect(result.urlType).toBe('website')
        expect(result.description).toBe('A useful page')
    })

    it('preserves unknown fields (loose schema)', () => {
        const result = AttachmentSchema.parse({
            attachmentId: 'abc',
            urlType: 'file',
            // Hypothetical future backend field the SDK does not know about yet
            futureField: 'preserved',
        }) as Record<string, unknown>
        expect(result.futureField).toBe('preserved')
    })

    it('rejects payloads missing attachmentId', () => {
        expect(() => AttachmentSchema.parse({ urlType: 'file' })).toThrow()
    })

    it('rejects payloads missing urlType', () => {
        expect(() => AttachmentSchema.parse({ attachmentId: 'x' })).toThrow()
    })

    it('rejects a negative fileSize', () => {
        expect(() =>
            AttachmentSchema.parse({
                attachmentId: 'x',
                urlType: 'file',
                fileSize: -1,
            }),
        ).toThrow()
    })
})

describe('entity url factories', () => {
    const channelData = {
        id: 42,
        name: 'Engineering',
        creator: 1,
        public: true,
        workspaceId: 1,
        archived: false,
        created: new Date(),
        version: 1,
    }

    const commentData = {
        id: 99,
        content: 'hi',
        creator: 1,
        threadId: 7,
        channelId: 42,
        workspaceId: 1,
        posted: new Date(),
    }

    const conversationData = {
        id: 5,
        workspaceId: 1,
        userIds: [1, 2],
        lastObjIndex: 0,
        snippet: 's',
        snippetCreators: [1],
        lastActive: new Date(),
        archived: false,
        created: new Date(),
        creator: 1,
    }

    const messageData = {
        id: 8,
        content: 'hi',
        creator: 1,
        conversationId: 5,
        posted: new Date(),
        workspaceId: 1,
    }

    const threadData = {
        id: 1337,
        title: 't',
        content: 'c',
        creator: 1,
        channelId: 42,
        workspaceId: 1,
        commentCount: 0,
        lastUpdated: new Date(),
        pinned: false,
        posted: new Date(),
        snippet: 's',
        snippetCreator: 1,
        starred: false,
        isArchived: false,
    }

    it('defaults to https://twist.com when no base is provided', () => {
        expect(createChannelSchema().parse(channelData).url).toBe('https://twist.com/a/1/ch/42/')
        // The exported singleton must keep the default-base behavior.
        expect(ChannelSchema.parse(channelData).url).toBe('https://twist.com/a/1/ch/42/')
    })

    it('uses the provided base for every entity url', () => {
        const base = 'https://twist.example.com'
        expect(createChannelSchema(base).parse(channelData).url).toBe(
            'https://twist.example.com/a/1/ch/42/',
        )
        expect(createThreadSchema(base).parse(threadData).url).toBe(
            'https://twist.example.com/a/1/ch/42/t/1337/',
        )
        expect(createConversationSchema(base).parse(conversationData).url).toBe(
            'https://twist.example.com/a/1/msg/5/',
        )
        expect(createCommentSchema(base).parse(commentData).url).toBe(
            'https://twist.example.com/a/1/ch/42/t/7/c/99',
        )
        expect(createConversationMessageSchema(base).parse(messageData).url).toBe(
            'https://twist.example.com/a/1/msg/5/m/8',
        )
    })

    it('propagates the base to a nested lastComment on an inbox thread', () => {
        const base = 'https://twist.example.com'
        const parsed = createInboxThreadSchema(base).parse({
            ...threadData,
            inInbox: true,
            closed: false,
            lastComment: commentData,
        })
        expect(parsed.url).toBe('https://twist.example.com/a/1/ch/42/t/1337/')
        expect(parsed.lastComment?.url).toBe('https://twist.example.com/a/1/ch/42/t/7/c/99')
    })
})
