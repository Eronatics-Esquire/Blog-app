import { useForm } from '@inertiajs/react';
import React, { useRef } from 'react';
import { SendHorizontal } from 'lucide-react';

export const MessageInput = ({
    conversationId,
}: {
    conversationId: number;
}) => {
    const { data, setData, post, processing, reset } = useForm({
        message: '',
        conversation_id: conversationId,
    });

    const bottomRef = useRef<HTMLDivElement | null>(null);

    function submit(e: any) {
        e.preventDefault();
        post('/messages/send', {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            },
        });
    }

    return (
        <form onSubmit={submit} className="border-t border-[#e4e6eb] bg-white px-4 py-3">
            <div className="flex items-center gap-2 rounded-full bg-[#f0f2f5] px-2 py-1.5">
                <input
                    type="text"
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    className="flex-1 bg-transparent px-2 text-sm outline-none"
                    placeholder="Aa"
                />
                <button
                    type="submit"
                    disabled={processing || data.message.trim() === ''}
                    className={`rounded-full p-2 transition-colors duration-200 ${
                        processing || data.message.trim() === ''
                            ? 'cursor-not-allowed text-blue-300'
                            : 'text-[#1877f2] hover:bg-blue-50'
                    }`}
                >
                    <SendHorizontal className="h-5 w-5" />
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
