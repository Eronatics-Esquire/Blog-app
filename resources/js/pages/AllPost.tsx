import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { usePage, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import PostCard from './PostCard';

export default function AllPost() {
    const { posts } = usePage().props as any;

    // ✅ realtime updates (single listener only)
    useEchoPublic('posts', '.BroadcastEvent', () => {
        router.reload({
            only: ['posts'],
        });
    });

    // not suree pa
    const loadMore = () => {
        if (!posts.next_page_url) return;

        router.get(
            posts.next_page_url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['posts'],
            },
        );
    };

    return (
        <div className="flex justify-center bg-amber-600">
            <InfiniteScroll
                dataLength={posts.data.length}
                next={loadMore}
                hasMore={!!posts.next_page_url}
                loader={<h4 className="mt-4 text-center">Loading...</h4>}
                endMessage={
                    <p className="mt-4 text-center text-gray-500">
                        You have seen all posts.
                    </p>
                }
            >
                <div className="mt-6 flex w-xl max-w-2xl flex-col gap-4 bg-amber-200">
                    {posts.data.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No posts yet.
                        </p>
                    ) : (
                        posts.data.map((post: any) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    )}
                </div>
            </InfiniteScroll>
        </div>
    );
}
