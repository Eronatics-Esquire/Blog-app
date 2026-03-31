import { useEchoPublic } from '@laravel/echo-react';
import PostCard, { Post } from './PostCard';
import { InfiniteScroll, router, useForm, usePage } from '@inertiajs/react';
import FBnavbar from './components/FBnavbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
type Props = {
    posts: { data: Post[] };
    user: User;
};

const AllPost = ({ posts, user }: Props) => {
    const { auth } = usePage().props as any;
    const userAUTH = auth.user;
    useEchoPublic('posts', '.BroadcastEvent', () => {
        router.reload({ only: ['posts'], reset: ['posts'] });
    });

    const { data, setData, post, reset, processing } = useForm({
        title: '',
        post: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard', {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const handleDelete = (post: Post) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/posts/${post.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <div>
            <FBnavbar user={auth.user} />
            <div className="flex justify-center bg-red-300 py-4">
                <Dialog>
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-96 flex-col gap-2 border-4 bg-amber-100 p-4"
                    >
                        {/* INPUT CLICK = OPEN DIALOG */}
                        <DialogTrigger asChild>
                            <div className="w-full cursor-pointer rounded-md border px-3 py-2 text-sm text-muted-foreground">
                                {data.post
                                    ? data.post
                                    : `What's on your mind? ${
                                          userAUTH?.name
                                              ? userAUTH.name
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                userAUTH.name.slice(1)
                                              : 'Guest'
                                      }`}
                            </div>
                        </DialogTrigger>

                        <Button
                            type="submit"
                            className="w-36"
                            disabled={processing}
                        >
                            Post
                        </Button>

                        {/* MODAL */}
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Post</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Post</Label>
                                    <Textarea
                                        value={data.post}
                                        placeholder="What's in your mind?"
                                        onChange={(e) =>
                                            setData('post', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Close</Button>
                                </DialogClose>

                                <DialogClose asChild>
                                    <Button>Done</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Dialog>
            </div>
            <div className="flex justify-center bg-amber-600">
                <div className="mt-6 flex w-xl max-w-2xl flex-col gap-4 bg-amber-200">
                    {!posts || posts.data.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500">
                            No posts yet.
                        </p>
                    ) : (
                        <InfiniteScroll data="posts">
                            {posts.data.map((p, index) => (
                                <div
                                    key={`${p.id}-${index}`}
                                    className="border-b p-2"
                                >
                                    <PostCard
                                        key={p.id}
                                        post={p}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </InfiniteScroll>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllPost;
