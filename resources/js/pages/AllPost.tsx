import { InfiniteScroll, router, useForm, usePage } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useEffect } from 'react';
import FbSideBarLeft from '@/components/FbSideBarLeft';
import FbSideBarRight from '@/components/FbSideBarRight';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types';
import FBnavbar from './components/FBnavbar';
import PostCard from './PostCard';
import FloatingChat from '@/components/FloatingChat';
import type { Post } from './PostCard';

type Props = {
    posts: { data: Post[] };
    user: User;
};

const AllPost = ({ posts, user }: Props) => {
    const { auth } = usePage().props as { auth: { user?: User } };

    useEchoPublic('posts', 'BroadcastEvent', () => {
        router.reload({ only: ['posts'], reset: ['posts'] });
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        const commentId = params.get('comment');

        if (postId) {
            setTimeout(() => {
                const element = document.getElementById(`post-${postId}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }

                if (commentId) {
                    setTimeout(() => {
                        const commentElement = document.getElementById(
                            `comment-${commentId}`,
                        );
                        if (commentElement) {
                            commentElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            });
                        }
                    }, 500);
                }
            }, 100);
        }
    }, []);

    const { data, setData, post, reset, processing } = useForm<{
        title: string;
        post: string;
        images: File[];
    }>({
        title: '',
        post: '',
        images: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard', {
            onSuccess: () => reset(),
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleDelete = (post: Post) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/posts/${post.id}`, {
                preserveScroll: true,
            });
        }
    };

    const displayName = auth.user?.name ?? 'Guest';

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <FBnavbar user={auth.user ?? user} />

            <div className="mx-auto flex w-full max-w-[1600px] gap-4 px-3 py-4">
                <div className="sticky top-18 hidden h-[calc(100vh-5rem)] w-1/4 lg:block">
                    <FbSideBarLeft />
                </div>

                <div className="mx-auto w-full max-w-2xl flex-1">
                    <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full rounded-full border border-[#ccd0d5] bg-[#f0f2f5] px-4 py-2.5 text-left text-sm text-[#65676b] transition hover:bg-[#e4e6eb]"
                                >
                                    {`What's on your mind, ${displayName}?`}
                                </button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-lg">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <DialogHeader className="border-b pb-3">
                                        <DialogTitle className="text-center text-xl font-semibold text-[#050505]">
                                            Create post
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e6eb] text-sm font-semibold text-[#1c1e21]">
                                                {displayName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <p className="text-sm font-semibold text-[#050505]">
                                                {displayName}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-[#65676b]">
                                                Title
                                            </Label>
                                            <Input
                                                className="mt-1 border-[#ccd0d5] focus-visible:ring-[#1877f2]"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-[#65676b]">
                                                Post
                                            </Label>
                                            <Textarea
                                                className="mt-1 min-h-36 resize-none border-[#ccd0d5] text-base focus-visible:ring-[#1877f2]"
                                                value={data.post}
                                                placeholder={`What's on your mind, ${displayName}?`}
                                                onChange={(e) =>
                                                    setData(
                                                        'post',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-[#65676b]">
                                                Photo
                                            </Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="mt-1 border-[#ccd0d5] focus-visible:ring-[#1877f2]"
                                                onChange={(e) =>
                                                    setData(
                                                        'images',
                                                        Array.from(
                                                            e.target.files ??
                                                                [],
                                                        ),
                                                    )
                                                }
                                            />
                                            {data.images.length > 0 && (
                                                <div className="mt-2 grid grid-cols-3 gap-2">
                                                    {data.images.map(
                                                        (image, idx) => (
                                                            <img
                                                                key={`${image.name}-${idx}`}
                                                                src={URL.createObjectURL(
                                                                    image,
                                                                )}
                                                                alt={image.name}
                                                                className="h-20 w-full rounded-md border object-cover"
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter className="border-t pt-4">
                                        <DialogClose asChild>
                                            <Button
                                                variant="outline"
                                                type="button"
                                                className="rounded-md border-[#ccd0d5]"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            className="bg-[#1877f2] hover:bg-[#166fe5]"
                                            disabled={
                                                processing ||
                                                (data.post.trim() === '' &&
                                                    data.images.length === 0)
                                            }
                                        >
                                            {processing ? 'Posting...' : 'Post'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!posts || posts.data.length === 0 ? (
                        <p className="rounded-xl border bg-white p-8 text-center text-gray-500 shadow-sm">
                            No posts yet.
                        </p>
                    ) : (
                        <InfiniteScroll data="posts">
                            <div className="flex flex-col gap-4">
                                {posts.data.map((p) => (
                                    <div key={p.id} id={`post-${p.id}`}>
                                        <PostCard
                                            post={p}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}
                            </div>
                        </InfiniteScroll>
                    )}
                </div>

                <div className="sticky top-18 hidden h-[calc(100vh-5rem)] w-1/4 lg:block">
                    <FbSideBarRight />
                </div>
            </div>

            <FloatingChat />
        </div>
    );
};

export default AllPost;
