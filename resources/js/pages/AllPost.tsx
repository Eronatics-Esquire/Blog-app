import { useEchoPublic } from '@laravel/echo-react';
import { Props } from './dashboard';
import PostCard from './PostCard';
import { InfiniteScroll, router } from '@inertiajs/react';

const AllPost = ({ posts }: Props) => {
    useEchoPublic('posts', '.BroadcastEvent', () => {
        router.reload({ only: ['posts'], reset: ['posts'] });
    });

    return (
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
                                <PostCard post={p} />
                            </div>
                        ))}
                    </InfiniteScroll>
                )}
            </div>
        </div>
    );
};

export default AllPost;
