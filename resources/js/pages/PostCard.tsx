import React, { useRef } from 'react';
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
import {
    ChevronLeft,
    ChevronRight,
    Edit2,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import Reaction from './components/Reaction';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEchoPublic } from '@laravel/echo-react';
import EditPostDialog from './components/EditPostDialog';
import CommentThreadItem, {
    ThreadComment,
} from './components/CommentThreadItem';

export type Comment = { comment: string; user: { name: string } };
export type Post = {
    id: number;
    title: string;
    post: string;
    image_url?: string | null;
    image_urls?: string[];
    user_reaction: string;
    reaction_counts: Record<string, number>;
    total_counts: number;
    user: { id: number; name: string };
    comments?: ThreadComment[];
};

type PostCardProps = {
    post: Post;
    onDelete: (post: Post) => void;
};

export default function PostCard({ post, onDelete }: PostCardProps) {
    const { auth } = usePage().props as any;
    const authorName = post.user?.name ?? 'Unknown';
    const authorInitial = authorName.charAt(0).toUpperCase();
    const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState<
        number | null
    >(null);

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

    const comments = post.comments ?? [];
    const topLevelComments = comments.filter((c) => !c.parent_id);
    const imageUrls = [
        ...(post.image_urls ?? []),
        ...(post.image_url ? [post.image_url] : []),
    ].filter((value, index, array) => array.indexOf(value) === index);
    const visibleImages = imageUrls.slice(0, 4);
    const remainingImages = Math.max(imageUrls.length - 4, 0);
    const activeImage =
        selectedImageIndex !== null ? imageUrls[selectedImageIndex] : null;

    const openImageViewer = (index: number) => setSelectedImageIndex(index);

    const nextImage = () => {
        if (selectedImageIndex === null || imageUrls.length === 0) return;
        setSelectedImageIndex((selectedImageIndex + 1) % imageUrls.length);
    };

    const prevImage = () => {
        if (selectedImageIndex === null || imageUrls.length === 0) return;
        setSelectedImageIndex(
            (selectedImageIndex - 1 + imageUrls.length) % imageUrls.length,
        );
    };

    React.useEffect(() => {
        if (selectedImageIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, imageUrls.length]);

    return (
        <>
            <EditPostDialog
                key={editData.id}
                post={editData.id === post.id ? post : null}
                onClose={() => resetEdit()}
            />
            <Card className="relative w-full rounded-xl border border-[#dddfe2] bg-white shadow-sm">
                <CardHeader className="items-start pb-3">
                    <div className="flex w-full items-start gap-3 pr-20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e6eb] text-sm font-semibold text-[#1c1e21]">
                            {authorInitial}
                        </div>
                        <div className="min-w-0">
                            <CardDescription className="text-sm font-semibold text-[#050505]">
                                {authorName}
                            </CardDescription>
                            <CardTitle className="mt-0.5 line-clamp-2 text-base leading-snug text-[#1c1e21]">
                                {post.title || 'Untitled post'}
                            </CardTitle>
                        </div>
                    </div>
                    {auth?.user?.id === post.user?.id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-5 right-5 z-10 h-9 w-9 rounded-full p-0 text-[#65676b] hover:bg-[#e4e6eb]"
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-40 rounded-xl"
                            >
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => setEditData('id', post.id)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => onDelete(post)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardHeader>

                <TooltipProvider>
                    <CardContent className="space-y-4">
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#1c1e21]">
                            {post.post}
                        </p>
                        {imageUrls.length > 0 && (
                            <div
                                className={`grid gap-2 ${
                                    visibleImages.length === 1
                                        ? 'grid-cols-1'
                                        : 'grid-cols-2'
                                }`}
                            >
                                {visibleImages.map((imageUrl, index) => (
                                    <button
                                        key={imageUrl}
                                        type="button"
                                        className="relative overflow-hidden rounded-xl border border-[#dddfe2]"
                                        onClick={() => openImageViewer(index)}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={post.title || 'Post image'}
                                            className={`w-full object-cover transition hover:scale-[1.01] ${
                                                visibleImages.length === 1
                                                    ? 'h-80'
                                                    : 'h-44'
                                            }`}
                                        />
                                        {index === 3 && remainingImages > 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-3xl font-semibold text-white">
                                                +{remainingImages}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="border-y border-[#dadde1] py-2">
                            <Reaction
                                postId={post.id}
                                initialReaction={post.user_reaction}
                                reactionCounts={post.reaction_counts}
                                totalReactions={post.total_counts}
                                commentsCount={topLevelComments.length}
                                onCommentClick={() =>
                                    commentInputRef.current?.focus()
                                }
                            />
                        </div>

                        <div className="mt-4 max-h-40 overflow-y-auto border-t pt-4">
                            {topLevelComments.length ? (
                                topLevelComments.map((c) => (
                                    <CommentThreadItem
                                        key={c.id}
                                        comment={c}
                                        allComments={comments}
                                        postId={post.id}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No comments yet.
                                </p>
                            )}
                        </div>

                            <form
                                onSubmit={handleCommentSubmit}
                                className="mt-4 flex flex-col gap-2"
                            >
                                <Textarea
                                    ref={commentInputRef}
                                    disabled={!auth.user}
                                    className="min-h-20 resize-none rounded-2xl border-[#ccd0d5] bg-[#f0f2f5] text-sm focus-visible:ring-[#1877f2]"
                                    placeholder="Write a comment..."
                                    value={data.comment}
                                    onChange={(e) =>
                                        setData('comment', e.target.value)
                                    }
                                />
                                <Button
                                    type="submit"
                                    className="w-32 self-end rounded-full bg-[#1877f2] hover:bg-[#166fe5]"
                                    disabled={processing || !auth.user}
                                >
                                    Comment
                                </Button>
                            </form>
                    </CardContent>
                </TooltipProvider>
            </Card>
            <Dialog
                open={selectedImageIndex !== null}
                onOpenChange={(open) => !open && setSelectedImageIndex(null)}
            >
                <DialogContent className="max-w-6xl border-none bg-black/95 p-2">
                    {activeImage && (
                        <div className="relative">
                            <img
                                src={activeImage}
                                alt="Expanded post image"
                                className="max-h-[85vh] w-full rounded-md object-contain"
                            />
                            {imageUrls.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevImage}
                                        className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                    <div className="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
                                        {(selectedImageIndex ?? 0) + 1} /{' '}
                                        {imageUrls.length}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
