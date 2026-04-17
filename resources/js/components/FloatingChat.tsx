import { MessageCircleIcon, X, ChevronLeft, Minus } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { AvatarWithStatus } from './ui/avatar';
import {
    AvatarContent,
    ChatPanel,
    ConversationList,
    useChat,
} from './floating-chat';

export default function FloatingChat() {
    const {
        isOpen,
        setIsOpen,
        isMinimized,
        setIsMinimized,
        showList,
        conversations,
        contacts,
        activeChat,
        messages,
        newMessage,
        setNewMessage,
        typingUsers,
        isSending,
        deleteMenuOpen,
        setDeleteMenuOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        chatEndRef,
        chatScrollRef,
        scrollPositionRef,
        authUserId,
        otherUser,
        showSeen,
        openChat,
        handleBack,
        handleClose,
        handleDeleteConversation,
        confirmDeleteConversation,
        startConversation,
        sendMessage,
        sendTyping,
    } = useChat();

    return (
        <div className="fixed right-4 bottom-4 z-50">
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#0073e4]"
                >
                    <MessageCircleIcon className="h-7 w-7" />
                </button>
            )}

            {isOpen && (
                <div
                    className={`flex flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
                        isMinimized ? 'h-14 w-72' : 'h-[28rem] w-80'
                    }`}
                >
                    <div
                        className={`flex items-center justify-between rounded-t-2xl px-3 py-2 ${
                            isMinimized && activeChat
                                ? 'cursor-pointer bg-[#0084ff] hover:bg-[#0073e4]'
                                : 'bg-[#0084ff]'
                        }`}
                        onClick={() => {
                            if (isMinimized && activeChat) {
                                setIsMinimized(false);
                                setTimeout(() => {
                                    if (chatScrollRef.current) {
                                        chatScrollRef.current.scrollTop =
                                            scrollPositionRef.current;
                                    }
                                }, 50);
                            }
                        }}
                    >
                        <div className="flex items-center gap-2">
                            {!showList && activeChat && !isMinimized && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBack();
                                    }}
                                    className="text-white hover:text-gray-200"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            {isMinimized && activeChat && otherUser && (
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                                            <AvatarContent
                                                user={otherUser}
                                                size="sm"
                                            />
                                        </div>
                                        <span
                                            className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#0084ff] ${
                                                otherUser.is_online === true
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                    </div>
                                    <span className="font-semibold text-white">
                                        {typeof otherUser.name === 'string' &&
                                        otherUser.name.length > 0 &&
                                        otherUser.name.length < 50 &&
                                        /^[a-zA-Z]/.test(otherUser.name)
                                            ? otherUser.name
                                            : 'User'}
                                    </span>
                                </div>
                            )}
                            {!isMinimized && (
                                <span className="font-semibold text-white">
                                    {showList
                                        ? 'Chats'
                                        : otherUser?.name &&
                                            typeof otherUser.name === 'string'
                                          ? otherUser.name
                                          : 'Chat'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {!isMinimized && activeChat && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (chatScrollRef.current) {
                                                scrollPositionRef.current =
                                                    chatScrollRef.current.scrollTop;
                                            }
                                            setIsMinimized(true);
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteMenuOpen(
                                                    !deleteMenuOpen,
                                                );
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                            </svg>
                                        </button>
                                        {deleteMenuOpen && (
                                            <div className="absolute top-full right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteConversation();
                                                    }}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                    Delete conversation
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {showList && (
                                <ConversationList
                                    conversations={conversations}
                                    contacts={contacts}
                                    authUserId={authUserId}
                                    onConvoClick={openChat}
                                    onContactClick={startConversation}
                                />
                            )}

                            {!showList && activeChat && (
                                <ChatPanel
                                    ref={chatEndRef}
                                    messages={messages}
                                    typingUsers={typingUsers}
                                    newMessage={newMessage}
                                    onNewMessageChange={setNewMessage}
                                    onSendMessage={sendMessage}
                                    onSendTyping={sendTyping}
                                    otherUser={otherUser}
                                    authUserId={authUserId}
                                    showSeen={showSeen}
                                    isSending={isSending}
                                    chatScrollRef={chatScrollRef}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-[400px] p-0">
                    <div className="p-4">
                        <h3 className="mb-2 text-center text-xl font-bold text-[#050505]">
                            Delete conversation?
                        </h3>
                        <p className="mb-6 text-center text-sm text-[#65676b]">
                            This conversation will be permanently deleted for
                            you. Others in the conversation won&apos;t be
                            notified.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                className="flex-1 rounded-lg border border-[#dadde1] bg-white py-2.5 text-[15px] font-semibold text-[#050505] transition-colors hover:bg-[#f0f2f5]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteConversation}
                                className="flex-1 rounded-lg bg-[#fa3e3b] py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#e3332d]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
