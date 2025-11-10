import { createFileRoute } from '@tanstack/react-router';
import { type ChatStatus, DefaultChatTransport } from 'ai';
import { useParamsThreadId } from '@/hooks/use-params-thread-id';
import { useDatabase, useThreadFromParams } from '@/hooks/use-database';
import { Fragment, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Title } from '@/components/meta/title';
import { ThreadProvider } from '@/context/thread';
import { MessageList } from '@/components/thread/message/message-list';
import { ToolSidebar } from '@/components/layout/tool-sidebar';
import { ThreadContainer } from '@/components/thread/thread-container';

export const Route = createFileRoute('/_app/_thread')({
    component: RouteComponent,
});

function RouteComponent() {
    const db = useDatabase();
    const threadId = useParamsThreadId();
    const thread = useThreadFromParams();

    const messages = useMemo(() => {
        return thread?.messages.map(message => message.message);
    }, [thread]);

    return (
        <Fragment>
            <Title title={thread?.title} />
            <ThreadProvider
                id={threadId}
                dbStatus={thread?.status as ChatStatus}
                messages={messages}
                transport={
                    new DefaultChatTransport({
                        api: '/api/thread',
                        credentials: 'include', // Ensure cookies are sent
                        prepareSendMessagesRequest: async ({ id, messages, body }) => {
                            const settings = db.query.setting
                                .where('userId', '=', db.userID)
                                .one()
                                .materialize();

                            console.log('Settings data:', settings.data);
                            console.log('ModelId:', settings.data?.modelId);
                            console.log('Message being sent:', messages.at(-1));
                            console.log('Body:', body);

                            return {
                                body: {
                                    id,
                                    message: messages.at(-1),
                                    modelId: settings.data?.modelId || 'anthropic/claude-3.5-sonnet', // Fallback to default model
                                    ...body,
                                },
                            };
                        },
                    })
                }
                onError={(error) => {
                    console.error('Thread error:', error);
                }}
                onFinish={(message) => {
                    console.log('Thread finished:', message);
                }}
            >
                <ThreadContainer>
                    <Header />
                    <MessageList />
                </ThreadContainer>
                <ToolSidebar />
            </ThreadProvider>
        </Fragment>
    );
}
