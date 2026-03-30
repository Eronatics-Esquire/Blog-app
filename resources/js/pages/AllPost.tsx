import { useEchoPublic } from '@laravel/echo-react';
import PostCard, { Post } from './PostCard';
import { InfiniteScroll, router, useForm, usePage } from '@inertiajs/react';
import FBnavbar from './components/FBnavbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
type Props = {
    posts: { data: Post[] };
    user: User;
};

const AllPost = ({ posts, user }: Props) => {
    const { auth } = usePage().props as any;
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
                <form
                    onSubmit={handleSubmit}
                    className="flex w-96 flex-col justify-center border-4 bg-amber-100"
                >
                    <Input
                        className="w-full text-center"
                        value={data.post}
                        onChange={(e) => setData('post', e.target.value)}
                        placeholder="Create Posts..."
                    />
                    <Button
                        type="submit"
                        className="w-36"
                        disabled={processing}
                    >
                        Post
                    </Button>
                </form>
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
