import { Head, router, useForm } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Post } from './PostCard';
import PostCard from './PostCard';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Posts', href: '/all-post' }];

export type Props = { posts: { data: Post[] } };

export default function Dashboard({ posts }: Props) {
    const {
        data: postData,
        setData: setPostData,
        post: submitPost,
        reset: resetPost,
        processing: creatingPost,
        errors: postErrors,
        delete: destroy,
    } = useForm<{ title: string; post: string; images: File[] }>({
        title: '',
        post: '',
        images: [],
    });

    useEchoPublic('posts', 'BroadcastEvent', () => {
        router.reload({ only: ['posts'] });
    });

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitPost('/dashboard', {
            onSuccess: () => resetPost(),
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const DeletePost = (post: Post) => {
        if (confirm('Are you sure you want to delete this post?')) {
            destroy(`/posts/${post.id}`, {
                onSuccess: () =>
                    router.reload({ only: ['posts'], reset: ['posts'] }),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full max-w-lg rounded-full border border-[#ccd0d5] bg-[#f0f2f5] py-5 text-left text-sm font-normal text-[#65676b] hover:bg-[#e4e6eb]"
                        >
                            What&apos;s on your mind?
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handlePostSubmit} className="space-y-5">
                            <DialogHeader className="border-b pb-3">
                                <DialogTitle className="text-center text-xl font-semibold text-[#050505]">
                                    Create post
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-[#65676b]">
                                        Title
                                    </Label>
                                    <Input
                                        className="mt-1 border-[#ccd0d5] focus-visible:ring-[#1877f2]"
                                        value={postData.title}
                                        onChange={(e) =>
                                            setPostData('title', e.target.value)
                                        }
                                    />
                                    {postErrors.title && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {postErrors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-[#65676b]">
                                        Post
                                    </Label>
                                    <Textarea
                                        className="mt-1 min-h-36 resize-none border-[#ccd0d5] text-base focus-visible:ring-[#1877f2]"
                                        value={postData.post}
                                        onChange={(e) =>
                                            setPostData('post', e.target.value)
                                        }
                                    />
                                    {postErrors.post && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {postErrors.post}
                                        </p>
                                    )}
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
                                            setPostData(
                                                'images',
                                                Array.from(
                                                    e.target.files ?? [],
                                                ),
                                            )
                                        }
                                    />
                                    {postData.images.length > 0 && (
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {postData.images.map(
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
                                    {(postErrors as any).images && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {(postErrors as any).images}
                                        </p>
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
                                        creatingPost ||
                                        (postData.post.trim() === '' &&
                                            postData.images.length === 0)
                                    }
                                >
                                    {creatingPost ? 'Posting...' : 'Post'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {!posts || posts.data.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500">
                            No posts yet.
                        </p>
                    ) : (
                        posts.data.map((p) => (
                            <PostCard
                                key={p.id}
                                post={p}
                                onDelete={DeletePost}
                            />
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
