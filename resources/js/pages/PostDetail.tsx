import { router, useForm } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import CommentThreadItem from './components/CommentThreadItem';
import Reaction from './components/Reaction';
import type { Post } from './PostCard';

type PostDetailProps = {
    post: Post;
};

export default function PostDetail({ post }: PostDetailProps) {
    const authorName = post.user?.name ?? 'Unknown';
    const authorInitial = authorName.charAt(0).toUpperCase();

    const {
        data,
        setData,
        post: submitComment,
        processing,
        reset,
    } = useForm<{ comment: string }>({ comment: '' });

    useEchoPublic(`posts.${post.id}`, 'BroadcastEvent', () => {
        router.reload({ only: ['post'], reset: ['post'] });
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitComment(`/comments/${post.id}`, {
            method: 'post',
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const comments = post.comments ?? [];
    const topLevelComments = comments.filter((c) => !c.parent_id);

    const commentsCount = comments.length;

    return (
        <TooltipProvider>
            <div className="mx-auto max-w-2xl space-y-4 p-4">
                <Button
                    variant="ghost"
                    onClick={() => router.visit('/dashboard')}
                    className="mb-4 text-[#65676b] hover:bg-[#f2f2f2]"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to posts
                </Button>

                <Card className="overflow-hidden border-[#dadde1]">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-sm font-medium text-white">
                            {authorInitial}
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-[#050505]">
                                {authorName}
                            </CardTitle>
                            <p className="text-xs text-[#65676b]">Just now</p>
                        </div>
                    </CardHeader>

                    <CardContent className="pb-2">
                        {post.title && (
                            <h2 className="mb-2 text-xl font-bold text-[#050505]">
                                {post.title}
                            </h2>
                        )}
                        <p className="text-base whitespace-pre-wrap text-[#050505]">
                            {post.post}
                        </p>
                    </CardContent>

                    {post.image_url && (
                        <img
                            src={post.image_url}
                            alt="Post image"
                            className="max-h-96 w-full object-cover"
                        />
                    )}
                </Card>

                <Card className="border-[#dadde1]">
                    <CardContent className="pt-4">
                        <Reaction
                            postId={post.id}
                            initialReaction={post.user_reaction}
                            reactionCounts={post.reaction_counts || {}}
                            totalReactions={post.total_counts || 0}
                            commentsCount={commentsCount}
                            onCommentClick={() =>
                                document
                                    .getElementById('comment-input')
                                    ?.focus()
                            }
                        />

                        <div className="mt-4 border-t border-[#dadde1] pt-4">
                            <h3 className="mb-3 text-sm font-semibold text-[#65676b]">
                                Comments ({commentsCount})
                            </h3>

                            <form
                                onSubmit={handleCommentSubmit}
                                className="mb-4"
                            >
                                <div className="flex gap-2">
                                    <Textarea
                                        id="comment-input"
                                        value={data.comment}
                                        onChange={(e) =>
                                            setData('comment', e.target.value)
                                        }
                                        placeholder="Write a comment..."
                                        className="min-h-20 resize-none border-[#dadde1] focus-visible:ring-[#1877f2]"
                                    />
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || !data.comment.trim()
                                        }
                                        className="bg-[#1877f2] hover:bg-[#166fe5]"
                                    >
                                        Post
                                    </Button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                {topLevelComments.map((comment) => (
                                    <CommentThreadItem
                                        key={comment.id}
                                        comment={comment}
                                        postId={post.id}
                                        allComments={comments}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
