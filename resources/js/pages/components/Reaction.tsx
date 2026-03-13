import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

const Reaction = ({
    postId,
    initialReaction,
    reactionCounts,
    totalReactions,
}: {
    postId: number;
    initialReaction: string | null;
    reactionCounts: Record<string, number>;
    totalReactions: number;
}) => {
    const { auth } = usePage().props as any;
    const reactions = ['👍', '❤️', '😂', '😮', '😡'];

    // Only keep open state — everything else comes from props (server)
    const [open, setOpen] = useState(false);

    const react = (emoji: string) => {
        setOpen(false);
        const newReaction = initialReaction === emoji ? '' : emoji;

        router.post(
            `/posts/${postId}/react`,
            { reaction: newReaction },
            { preserveScroll: true, preserveState: false }, // preserveState: false so props refresh
        );
    };

    return (
        <div className="flex flex-col gap-1">
            <Tooltip open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild>
                    <Button
                        disabled={!auth.user}
                        variant="ghost"
                        className="font-bold text-gray-500"
                    >
                        {initialReaction ?? 'Like'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="border-2 bg-white">
                    <div className="flex gap-2">
                        {reactions.map((emoji) => (
                            <span
                                key={emoji}
                                className={`cursor-pointer text-xl transition hover:scale-125 ${
                                    initialReaction === emoji
                                        ? 'opacity-50'
                                        : ''
                                }`}
                                onClick={() => react(emoji)}
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>
                </TooltipContent>
            </Tooltip>

            {totalReactions > 0 && (
                <div className="flex gap-2 text-sm text-gray-500">
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span key={emoji}>
                            {emoji} {count}
                        </span>
                    ))}
                    <span>{totalReactions} reactions</span>
                </div>
            )}
        </div>
    );
};

export default Reaction;
