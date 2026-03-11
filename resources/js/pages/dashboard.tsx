import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PostCard from './PostCard'; // <- import the new component
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Posts', href: dashboard() }];

type Comment = { comment: string; user: { name: string } };
type Post = {
    id: number;
    title: string;
    post: string;
    user: { id: number; name: string }
    comments?: Comment[];
};
export type Props = { posts: { data: Post[] } };

export default function Dashboard({ posts }: Props) {
    const {
        data: postData,
        setData: setPostData,
        post: submitPost,
        reset: resetPost,
        processing: creatingPost,
        errors: postErrors,
    } = useForm<{ title: string; post: string }>({ title: '', post: '' });

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitPost('/dashboard', {
            onSuccess: () => resetPost(),
            preserveScroll: true,
        });
    };
    console.log(postData);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Create Post Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Create Post</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={handlePostSubmit}>
                            <DialogHeader>
                                <DialogTitle>Create Post</DialogTitle>
                                <DialogDescription>
                                    Make changes to your post here. Click save
                                    when you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>

                            <FieldGroup>
                                <Field>
                                    <Label>Title</Label>
                                    <Input
                                        value={postData.title}
                                        onChange={(e) =>
                                            setPostData('title', e.target.value)
                                        }
                                    />
                                    {postErrors.title && (
                                        <p className="text-sm text-red-500">
                                            {postErrors.title}
                                        </p>
                                    )}
                                </Field>
                                <Field>
                                    <Label>Post</Label>
                                    <Textarea
                                        value={postData.post}
                                        onChange={(e) =>
                                            setPostData('post', e.target.value)
                                        }
                                    />
                                    {postErrors.post && (
                                        <p className="text-sm text-red-500">
                                            {postErrors.post}
                                        </p>
                                    )}
                                </Field>
                            </FieldGroup>

                            <DialogFooter>
                                <div className="flex w-full justify-center">
                                    <Button
                                        type="submit"
                                        className="w-36"
                                        disabled={creatingPost}
                                    >
                                        Post
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Display Posts */}
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {!posts || posts.data.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500">
                            No posts yet.
                        </p>
                    ) : (
                        posts.data.map((p) => <PostCard key={p.id} post={p} />)
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
