import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';

const Reaction = ({ postId, initialReaction }: { postId: number; initialReaction:string | null }) => {
    const reactions = ['👍', '❤️', '😂', '😮', '😡'];
    const [selected, setSelected] = useState<string | null>(initialReaction);
    const [open, setOpen] = useState(false);

    const react = (emoji: string) => {
        setOpen(false);
        const newReaction = selected === emoji ? '' : emoji;
        setSelected(newReaction || null);

        router.post(`/posts/${postId}/react`, { reaction: newReaction }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
                <Button variant="ghost" className="font-bold text-gray-500">
                    {selected ?? 'Like'}
                </Button>
            </TooltipTrigger>

            <TooltipContent className="border-2 bg-white">
                <div className="flex gap-2">
                    {reactions.map((emoji) => (
                        <span
                            key={emoji}
                            className={`cursor-pointer text-xl transition hover:scale-125 ${selected === emoji ? 'opacity-50' : ''}`}
                            onClick={() => react(emoji)}
                        >
                            {emoji}
                        </span>
                    ))}
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

export default Reaction;