/** biome-ignore-all lint/complexity/noExcessiveNestedTestSuites: In this instance, not excessive */
import {
    getChannelURL,
    getCommentURL,
    getConversationURL,
    getFullTwistURL,
    getInboxURL,
    getMessagesRootURL,
    getMessageURL,
    getSavedThreadsRootURL,
    getSavedThreadURL,
    getSearchQueryURL,
    getSearchRootURL,
    getSettingsURL,
    getTeamMembersRootURL,
    getThreadsRootURL,
    getThreadURL,
    getTwistURL,
    getUserProfileURL,
} from './url-helpers'

describe('URL Helpers', () => {
    describe('getTwistURL', () => {
        describe('with workspace', () => {
            test('returns workspace relative url', () => {
                expect(getTwistURL({ workspaceId: 1 })).toBe('/a/1/')
            })

            describe('with channel', () => {
                test('returns workspace/channel relative url', () => {
                    expect(getTwistURL({ workspaceId: 1, channelId: 42 })).toBe('/a/1/ch/42/')
                })

                describe('with thread', () => {
                    test('returns workspace/channel/thread relative url', () => {
                        expect(getTwistURL({ workspaceId: 1, channelId: 42, threadId: 1337 })).toBe(
                            '/a/1/ch/42/t/1337/',
                        )
                    })

                    describe('with comment', () => {
                        test('returns workspace/channel/thread/comment relative url', () => {
                            expect(
                                getTwistURL({
                                    workspaceId: 1,
                                    channelId: 42,
                                    threadId: 1337,
                                    commentId: 9000,
                                }),
                            ).toBe('/a/1/ch/42/t/1337/c/9000')
                        })

                        test('excludes comment when commentId is -1', () => {
                            expect(
                                getTwistURL({
                                    workspaceId: 1,
                                    channelId: 42,
                                    threadId: 1337,
                                    commentId: -1,
                                }),
                            ).toBe('/a/1/ch/42/t/1337/')
                        })
                    })

                    describe('with thread draft', () => {
                        test('returns workspace/channel/thread draft relative url', () => {
                            expect(
                                getTwistURL({ workspaceId: 1, channelId: 42, threadId: -1337 }),
                            ).toBe('/a/1/ch/42/compose/-1337/')
                        })
                    })
                })
            })

            describe('with thread (inbox)', () => {
                test('returns workspace/inbox/thread relative url', () => {
                    expect(getTwistURL({ workspaceId: 1, threadId: 1337 })).toBe(
                        '/a/1/inbox/t/1337/',
                    )
                })

                describe('with comment', () => {
                    test('returns workspace/inbox/thread/comment relative url', () => {
                        expect(
                            getTwistURL({ workspaceId: 1, threadId: 1337, commentId: 9000 }),
                        ).toBe('/a/1/inbox/t/1337/c/9000')
                    })

                    test('excludes comment when commentId is -1', () => {
                        expect(getTwistURL({ workspaceId: 1, threadId: 1337, commentId: -1 })).toBe(
                            '/a/1/inbox/t/1337/',
                        )
                    })
                })
            })

            describe('with conversation', () => {
                test('returns workspace/conversation relative url', () => {
                    expect(getTwistURL({ workspaceId: 1, conversationId: 1337 })).toBe(
                        '/a/1/msg/1337/',
                    )
                })

                describe('with message', () => {
                    test('returns workspace/conversation/message relative url', () => {
                        expect(
                            getTwistURL({ workspaceId: 1, conversationId: 1337, messageId: 9000 }),
                        ).toBe('/a/1/msg/1337/m/9000')
                    })
                })
            })

            describe('with user', () => {
                test('returns workspace/user relative url', () => {
                    expect(getTwistURL({ workspaceId: 1, userId: 1001 })).toBe('/a/1/people/u/1001')
                })
            })
        })
    })

    describe('getFullTwistURL', () => {
        test('returns full URL with default base', () => {
            expect(getFullTwistURL({ workspaceId: 1, channelId: 42 })).toBe(
                'https://twist.com/a/1/ch/42/',
            )
        })

        test('returns full URL with custom base', () => {
            expect(
                getFullTwistURL({ workspaceId: 1, channelId: 42 }, 'https://staging.twist.com'),
            ).toBe('https://staging.twist.com/a/1/ch/42/')
        })
    })

    describe('getThreadURL', () => {
        test('returns thread URL for non-draft thread', () => {
            expect(getThreadURL({ workspaceId: 1, channelId: 42, threadId: 1337 })).toBe(
                '/a/1/ch/42/t/1337/',
            )
        })

        test('returns compose URL for draft thread', () => {
            expect(getThreadURL({ workspaceId: 1, channelId: 42, threadId: -1337 })).toBe(
                '/a/1/ch/42/compose/-1337',
            )
        })
    })

    describe('getChannelURL', () => {
        test('returns channel URL', () => {
            expect(getChannelURL({ workspaceId: 1, channelId: 42 })).toBe('/a/1/ch/42/')
        })
    })

    describe('getConversationURL', () => {
        test('returns conversation URL', () => {
            expect(getConversationURL({ workspaceId: 1, conversationId: 1337 })).toBe(
                '/a/1/msg/1337/',
            )
        })
    })

    describe('getMessageURL', () => {
        test('returns message URL', () => {
            expect(getMessageURL({ workspaceId: 1, conversationId: 1337, messageId: 9000 })).toBe(
                '/a/1/msg/1337/m/9000',
            )
        })
    })

    describe('getCommentURL', () => {
        test('returns comment URL', () => {
            expect(
                getCommentURL({ workspaceId: 1, channelId: 42, threadId: 1337, commentId: 9000 }),
            ).toBe('/a/1/ch/42/t/1337/c/9000')
        })
    })

    describe('getThreadsRootURL', () => {
        test('returns threads root URL', () => {
            expect(getThreadsRootURL(1)).toBe('/a/1/ch')
        })
    })

    describe('getInboxURL', () => {
        test('returns inbox URL without tab', () => {
            expect(getInboxURL(1)).toBe('/a/1/inbox')
        })

        test('returns inbox URL with done tab', () => {
            expect(getInboxURL(1, 'done')).toBe('/a/1/inbox/done')
        })

        test('returns inbox URL with mentions tab', () => {
            expect(getInboxURL(1, 'mentions')).toBe('/a/1/inbox/mentions')
        })
    })

    describe('getMessagesRootURL', () => {
        test('returns messages root URL', () => {
            expect(getMessagesRootURL(1)).toBe('/a/1/msg')
        })
    })

    describe('getUserProfileURL', () => {
        test('returns user profile URL', () => {
            expect(getUserProfileURL({ workspaceId: 1, userId: 1001 })).toBe('/a/1/people/u/1001')
        })
    })

    describe('getSavedThreadsRootURL', () => {
        test('returns saved threads root URL', () => {
            expect(getSavedThreadsRootURL(1)).toBe('/a/1/saved')
        })
    })

    describe('getSavedThreadURL', () => {
        test('returns saved thread URL', () => {
            expect(getSavedThreadURL({ workspaceId: 1, threadId: 2 })).toBe('/a/1/saved/t/2')
        })
    })

    describe('getSearchRootURL', () => {
        test('returns search root URL', () => {
            expect(getSearchRootURL(1)).toBe('/a/1/search')
        })
    })

    describe('getSearchQueryURL', () => {
        test('returns search query URL', () => {
            expect(getSearchQueryURL({ workspaceId: 1, query: 'test query' })).toBe(
                '/a/1/search?q=test query',
            )
        })
    })

    describe('getSettingsURL', () => {
        test('returns settings URL without location', () => {
            expect(getSettingsURL({ workspaceId: 1 })).toBe('/a/1/settings')
        })

        test('returns settings URL with location', () => {
            expect(getSettingsURL({ workspaceId: 1, initialLocation: 'general' })).toBe(
                '/a/1/settings/general',
            )
        })
    })

    describe('getTeamMembersRootURL', () => {
        test('returns team members root URL', () => {
            expect(getTeamMembersRootURL(1)).toBe('/a/1/people/u')
        })
    })
})
