import { useEchoPublic } from '@laravel/echo-react';
import { Props } from './dashboard';
import PostCard from './PostCard';
import { router } from '@inertiajs/react';

const AllPost = ({ posts }: Props) => {

    // new post created
    useEchoPublic('posts', '.BroadcastEvent', () => {
        router.reload({ only: ['posts'] });
    });

    // listen to updates of each post
    // posts.data.forEach((post) => {
    //     useEchoPublic(`posts.${post.id}`, '.BroadcastEvent', () => {
    //         router.reload({ only: ['posts'] });
    //     });
    // });

    return (
        <div>
            <div>AllPost</div>

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
    );
};

export default AllPost;