import { Message } from './types';

type ChatBubbleProps = {
    message: Message;
    isMe: boolean;
};

export function ChatBubble({ message, isMe }: ChatBubbleProps) {
    const time = new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-2`}>
            <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    isMe
                        ? 'rounded-br-md bg-[#0084ff] text-white'
                        : 'rounded-bl-md border border-gray-200 bg-white text-gray-900 shadow-sm'
                }`}
            >
                <p className="text-sm">{message.message}</p>
                <div
                    className={`flex items-center justify-end gap-1 text-[10px] ${
                        isMe ? 'text-white/70' : 'text-gray-400'
                    }`}
                >
                    <span>{time}</span>
                </div>
            </div>
        </div>
    );
}
