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

type Comment = { comment: string; user: { name: string } };

type Post = {
    id: number;
    title: string;
    post: string;
    user: { name: string };
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
    } = useForm<{ comment: string }>({ comment: '' });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitComment(`/comments/${post.id}`, {
            method: 'post',
            onSuccess: () => reset(),
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                    Posted by {post.user?.name || 'Unknown'}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-gray-600">{post.post}</p>

                {/* Comments */}
                <div className="mt-4 max-h-40 overflow-y-auto border-t pt-4">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c, idx) => (
                            <div
                                key={idx}
                                className="mb-2 break-words whitespace-pre-wrap"
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

                {/* Comment Form */}
                {auth?.user ? (
                    <form
                        onSubmit={handleCommentSubmit}
                        className="mt-4 flex flex-col gap-2"
                    >
                        <Textarea
                            placeholder="Write a comment..."
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                        />

                        <Button
                            type="submit"
                            className="w-32 self-end"
                            disabled={processing}
                        >
                            Comment
                        </Button>
                    </form>
                ) : (
                    <div className="max-h-40 overflow-y-auto rounded-2xl border-2 pt-4">
                        <p className="ml-2 py-3 text-gray-400">
                            You must log in to comment.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
