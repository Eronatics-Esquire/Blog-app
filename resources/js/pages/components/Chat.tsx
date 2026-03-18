import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { usePage, router, Head } from '@inertiajs/react';
import MessageInput from './MessageInput';

export default function Chat() {
    const {
        conversations,
        messages = [],
        conversationId,
        auth,
        users = [],
    } = usePage().props as any;

    const activeConversation = conversations?.find(
        (c: any) => c.id === conversationId,
    );
    
    const otherUser = activeConversation?.users.find(
      (u: any) => u.id !== auth.user.id,
    );
    
    return (
            <div className='h-screen'>
              <div className="flex h-full bg-gray-100">
                  {/* sidebar */}
                  <div className="h-full w-1/5 overflow-y-auto border-r bg-white">
                      <div className="border-b p-4 font-bold">Chats</div>
                      {users.map((user: any) => {
                          const existingConvo = conversations?.find((c: any) =>
                            c.users.some((u: any) => u.id === user.id),
                          );
                          const lastMessage =
                          existingConvo?.messages?.[
                                  existingConvo.messages.length - 1
                                ];
                                const isMe = lastMessage?.user_id === auth.user.id;
                                const preview = lastMessage
                              ? `${isMe ? 'You' : user.name}: ${lastMessage.message}`
                              : 'Start a chat';
                          return (
                            <div
                                  key={user.id}
                                  onClick={() => {
                                    if (existingConvo) {
                                          router.get(
                                            `/messages/${existingConvo.id}`,
                                          );
                                        } else {
                                          router.post(
                                              `/messages/find-or-create/${user.id}`,
                                            );
                                      }
                                    }}
                                    className={`cursor-pointer p-4 hover:bg-gray-100 ${
                                      existingConvo?.id === conversationId
                                      ? 'bg-gray-200'
                                      : ''
                                    }`}
                              >
                                  <div className="font-semibold">{user.name}</div>
                                  <div className="truncate text-xs text-gray-600">
                                      {preview}
                                  </div>
                              </div>
                          );
                        })}
                  </div>
                  {/* chat area */}
                  <div className="flex flex-1 flex-col overflow-hidden">
                      <div className="border-b bg-white p-4 font-semibold">
                          {otherUser?.name || 'Select a chat'}
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col-reverse gap-3 overflow-y-auto p-4">
                          {messages
                              .slice()
                              .reverse()
                              .map((msg: any) => {
                                const mine = msg.user_id === auth.user.id;
                                return (
                                  <div
                                  key={msg.id}
                                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                                          >
                                          <div
                                              className={`max-w-xs rounded-lg px-4 py-2 ${
                                                mine
                                                ? 'bg-blue-500 text-white'
                                                      : 'bg-gray-200'
                                              }`}
                                          >
                                              {msg.message}
                                          </div>
                                      </div>
                                  );
                              })}
                      </div>
                      {conversationId && (
                          <MessageInput
                              key={conversationId}
                              conversationId={conversationId}
                          />
                      )}
                  </div>
              </div>
            </div>
    );
}