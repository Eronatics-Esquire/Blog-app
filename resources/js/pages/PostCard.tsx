import React from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import Reaction from './components/Reaction';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEchoPublic } from '@laravel/echo-react';
import EditPostDialog from './components/EditPostDialog';

export type Comment = { comment: string; user: { name: string } };
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

type PostCardProps = {
    post: Post;
    onDelete: (post: Post) => void;
};

export default function PostCard({ post, onDelete }: PostCardProps) {
    const { auth } = usePage().props as any;

    const {
        data: editData,
        setData: setEditData,
        reset: resetEdit,
    } = useForm({ id: 0 });

    const {
        data,
        setData,
        post: submitComment,
        processing,
        reset,
    } = useForm<{ comment: string }>({ comment: '' });

    useEchoPublic(`posts.${post.id}`, '.BroadcastEvent', () => {
        router.reload({ only: ['posts'], reset: ['posts'] });
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitComment(`/comments/${post.id}`, {
            method: 'post',
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <>
            <EditPostDialog
                key={editData.id}
                post={editData.id === post.id ? post : null}
                onClose={() => resetEdit()}
            />
            <Card className="relative w-full">
                <CardHeader className="items-start">
                    <div>
                        <CardTitle className="mb-2">{post.title}</CardTitle>
                        <CardDescription>
                            Posted by{' '}
                            {post.user?.name
                                ? post.user.name.charAt(0).toUpperCase() +
                                  post.user.name.slice(1)
                                : 'Unknown'}
                        </CardDescription>
                    </div>
                    {auth?.user?.id === post.user?.id && (
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="p-2"
                                onClick={() => setEditData('id', post.id)}
                            >
                                <Edit2 className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="p-2"
                                onClick={() => onDelete(post)}
                            >
                                <Trash2 className="h-6 w-6" />
                            </Button>
                        </div>
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
                        {post.comments?.length ? (
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
        </>
    );
}
