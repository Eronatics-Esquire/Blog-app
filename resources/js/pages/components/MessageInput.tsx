import { useForm } from '@inertiajs/react';
import React, { useRef } from 'react'

export const MessageInput = ({ conversationId }: { conversationId: number }) => {
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
        <form onSubmit={submit} className="flex gap-2 border-t bg-white p-4">
            <input
                type="text"
                value={data.message}
                onChange={(e) => setData('message', e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2"
                placeholder="Type a message..."
            />
            <button
                disabled={false}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white"
            >
                Send
            </button>
        </form>
    );
}

export default MessageInput
