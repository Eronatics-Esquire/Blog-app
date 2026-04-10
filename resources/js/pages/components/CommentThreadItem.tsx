import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { router, useForm } from '@inertiajs/react';
import { ThumbsUp } from 'lucide-react';
import React from 'react';

export type ThreadComment = {
    id: number;
    comment: string;
    parent_id?: number | null;
    user: { name: string };
    user_reaction?: string | null;
    reaction_counts?: Record<string, number>;
};

type Props = {
    comment: ThreadComment;
    allComments: ThreadComment[];
    postId: number;
};

const emojiReactions = ['👍', '❤️', '😂', '😮', '😡'];

const reactionSummary = (comment: ThreadComment) => {
    const counts = comment.reaction_counts ?? {};
    const entries = Object.entries(counts).filter(([, count]) => count > 0);
    if (!entries.length) return null;

    return (
        <span className="mt-1 ml-3 text-xs text-[#65676b]">
            {entries
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([emoji, count]) => `${emoji} ${count}`)
                .join('  ')}
        </span>
    );
};

export default function CommentThreadItem({ comment, allComments, postId }: Props) {
    const [showReply, setShowReply] = React.useState(false);
    const { data, setData, post, processing, reset } = useForm<{
        comment: string;
        parent_id: number | null;
    }>({
        comment: '',
        parent_id: comment.id,
    });

    const childReplies = allComments.filter((item) => item.parent_id === comment.id);

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/comments/${postId}`, {
            onSuccess: () => {
                reset();
                setShowReply(false);
            },
            preserveScroll: true,
        });
    };

    const reactDefaultLike = () => {
        const nextReaction = comment.user_reaction === '👍' ? '' : '👍';
        router.post(
            `/comments/${comment.id}/react`,
            { reaction: nextReaction },
            { preserveScroll: true, preserveState: false },
        );
    };

    const setReaction = (emoji: string) => {
        const nextReaction = comment.user_reaction === emoji ? '' : emoji;
        router.post(
            `/comments/${comment.id}/react`,
            { reaction: nextReaction },
            { preserveScroll: true, preserveState: false },
        );
    };

    return (
        <div className="mb-3">
            <div className="whitespace-pre-wrap rounded-2xl bg-[#f0f2f5] px-3 py-2 text-sm text-[#1c1e21]">
                <span className="font-semibold">{comment.user.name}</span>
                <p>{comment.comment}</p>
            </div>

            <div className="mt-1 ml-3 flex items-center gap-4 text-xs font-semibold text-[#65676b]">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex items-center hover:underline"
                            onClick={reactDefaultLike}
                        >
                            <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                            <span className={comment.user_reaction ? 'text-[#1877f2]' : ''}>
                                {comment.user_reaction ?? 'Like'}
                            </span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="border-2 bg-white px-2 py-1">
                        <div className="flex gap-2">
                            {emojiReactions.map((emoji) => (
                                <span
                                    key={emoji}
                                    className="cursor-pointer text-xl transition hover:scale-125"
                                    onClick={() => setReaction(emoji)}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>

                <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setShowReply((prev) => !prev)}
                >
                    Reply
                </button>
            </div>

            <div>{reactionSummary(comment)}</div>

            {showReply && (
                <form onSubmit={submitReply} className="mt-2 ml-8 flex flex-col gap-2">
                    <Textarea
                        value={data.comment}
                        onChange={(e) => setData('comment', e.target.value)}
                        className="min-h-16 resize-none rounded-2xl border-[#ccd0d5] bg-[#f0f2f5] text-sm focus-visible:ring-[#1877f2]"
                        placeholder={`Reply to ${comment.user.name}...`}
                    />
                    <div className="flex gap-2 self-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowReply(false);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-full bg-[#1877f2] hover:bg-[#166fe5]"
                            disabled={processing || !data.comment.trim()}
                        >
                            Reply
                        </Button>
                    </div>
                </form>
            )}

            {childReplies.length > 0 && (
                <div className="mt-2 ml-8">
                    {childReplies.map((reply) => (
                        <CommentThreadItem
                            key={reply.id}
                            comment={reply}
                            allComments={allComments}
                            postId={postId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
