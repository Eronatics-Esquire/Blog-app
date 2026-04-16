import { router, usePage } from '@inertiajs/react';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const Reaction = ({
    postId,
    initialReaction,
    reactionCounts,
    totalReactions,
    commentsCount = 0,
    onCommentClick,
}: {
    postId: number;
    initialReaction: string | null;
    reactionCounts?: Record<string, number>;
    totalReactions: number;
    commentsCount?: number;
    onCommentClick?: () => void;
}) => {
    const { auth } = usePage().props as any;
    const reactions = ['👍', '❤️', '😂', '😮', '😡'];
    const reactionEntries = Object.entries(reactionCounts || {}).filter(
        ([, count]) => count > 0,
    );
    const accurateTotalReactions = reactionEntries.reduce(
        (sum, [, count]) => sum + count,
        0,
    );
    const displayedTotalReactions =
        accurateTotalReactions > 0 ? accurateTotalReactions : totalReactions;

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
        <div className="flex flex-col gap-2">
            {(displayedTotalReactions > 0 || commentsCount > 0) && (
                <div className="flex items-center justify-between text-sm text-[#65676b]">
                    <div className="flex items-center gap-2">
                        {reactionEntries.length > 0 && (
                            <>
                                <span className="text-base leading-none">
                                    {reactionEntries
                                        .map(([emoji]) => emoji)
                                        .slice(0, 3)
                                        .join(' ')}
                                </span>
                                <span>{displayedTotalReactions}</span>
                            </>
                        )}
                    </div>
                    {commentsCount > 0 && <span>{commentsCount} comments</span>}
                </div>
            )}

            <div className="grid grid-cols-2 gap-1 border-t border-[#dadde1] pt-1">
                <Tooltip open={open} onOpenChange={setOpen}>
                    <TooltipTrigger asChild>
                        <Button
                            disabled={!auth.user}
                            variant="ghost"
                            className={`h-9 rounded-md font-semibold ${
                                initialReaction
                                    ? 'text-[#1877f2]'
                                    : 'text-[#65676b]'
                            } hover:bg-[#f2f2f2]`}
                        >
                            <ThumbsUp className="mr-2 h-4 w-4" />
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

                <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-md font-semibold text-[#65676b] hover:bg-[#f2f2f2]"
                    onClick={onCommentClick}
                >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comment
                </Button>
            </div>
        </div>
    );
};

export default Reaction;
