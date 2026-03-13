import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import Reaction from './components/Reaction';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEchoPublic } from '@laravel/echo-react';
import { router } from '@inertiajs/react';

type Comment = { comment: string; user: { name: string } };

export type Post = {
    id: number;
    title: string;
    post: string;
    user_reaction: string;
    reaction_counts: Record<string, number>;
    total_counts: number;
    user: { id: number; name: string };
    comments?: Comment[];
};

export default function PostCard({ post }: { post: Post }) {
    const { auth } = usePage().props as any;

    const {
        data,
        setData,
        post: submitComment,
        processing,
        reset,
        delete: destroy,
    } = useForm<{ comment: string }>({ comment: '' });

    // Reload only this post's data when comment or reaction comes in
    useEchoPublic(`posts.${post.id}`, '.BroadcastEvent', () => {
        router.reload({ only: ['posts'] });
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitComment(`/comments/${post.id}`, {
            method: 'post',
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const DeletePost = () => {
        if (confirm('Are you sure you want to delete this post?')) {
            destroy(`/posts/${post.id}`);
        }
    };

    return (
        <Card className="relative w-full">
            <CardHeader className="items-start">
                <div>
                    <CardTitle className="mb-2">{post.title}</CardTitle>
                    <CardDescription>
                        Posted by {post.user?.name || 'Unknown'}
                    </CardDescription>
                </div>
                {auth?.user?.id === post.user?.id && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-6 right-6 z-10 p-2"
                        onClick={DeletePost}
                    >
                        <Trash2 className="h-6 w-6" />
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                <p className="text-gray-600">{post.post}</p>
                <TooltipProvider>
                    <Reaction
                        postId={post.id}
                        initialReaction={post.user_reaction}
                        reactionCounts={post.reaction_counts}
                        totalReactions={post.total_counts}
                    />
                </TooltipProvider>

                <div className="mt-4 max-h-40 overflow-y-auto border-t pt-4">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c, idx) => (
                            <div
                                key={idx}
                                className="mb-2 wrap-break-word whitespace-pre-wrap"
                            >
                                <span className="font-semibold">
                                    {c.user.name}:
                                </span>{' '}
                                {c.comment}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No comments yet.</p>
                    )}
                </div>

                <form
                    onSubmit={handleCommentSubmit}
                    className="mt-4 flex flex-col gap-2"
                >
                    <Textarea
                        disabled={!auth.user}
                        className="resize-none"
                        placeholder="Write a comment..."
                        value={data.comment}
                        onChange={(e) => setData('comment', e.target.value)}
                    />
                    <Button
                        type="submit"
                        className="w-32 self-end"
                        disabled={processing || !auth.user}
                    >
                        Comment
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
