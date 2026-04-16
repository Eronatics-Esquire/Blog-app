import { Link, router, usePage } from '@inertiajs/react';
import {
    Camera,
    Check,
    Edit2,
    ImageIcon,
    MapPin,
    User as UserIcon,
    Users,
    Video,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import FBnavbar from './components/FBnavbar';
import PostCard from './PostCard';
import FloatingChat from '@/components/FloatingChat';
import type { Post } from './PostCard';

type ProfileUser = {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
    profile_photo_url: string | null;
    cover_photo: string | null;
    cover_photo_url: string | null;
    posts: Post[];
    friends_count?: number;
    photos_count?: number;
};

type Props = {
    user: ProfileUser;
    isOwnProfile?: boolean;
};

type TabType = 'posts' | 'about' | 'friends' | 'photos' | 'videos';

export default function Profile({ user, isOwnProfile = true }: Props) {
    const { auth } = usePage().props as { auth?: { user?: User } };
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(
        user.profile_photo_url || '',
    );
    const [coverPhotoUrl, setCoverPhotoUrl] = useState(
        user.cover_photo_url || '',
    );
    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!uploadingProfile) {
            setProfilePhotoUrl(user.profile_photo_url || '');
        }
    }, [user.profile_photo_url, uploadingProfile]);

    useEffect(() => {
        if (!uploadingCover) {
            setCoverPhotoUrl(user.cover_photo_url || '');
        }
    }, [user.cover_photo_url, uploadingCover]);

    const handleProfilePhotoChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProfile(true);

        const formData = new FormData();
        formData.append('profile_photo', file);

        fetch('/profile/update-profile-photo', {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.profile_photo_url) {
                    window.location.reload();
                } else if (data.errors) {
                    alert('Upload failed: ' + JSON.stringify(data.errors));
                    setUploadingProfile(false);
                } else {
                    setUploadingProfile(false);
                }
            })
            .catch((err) => {
                console.error('Upload error:', err);
                setUploadingProfile(false);
            });
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);

        const formData = new FormData();
        formData.append('cover_photo', file);

        fetch('/profile/update-cover-photo', {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.cover_photo_url) {
                    window.location.reload();
                } else if (data.errors) {
                    alert('Upload failed: ' + JSON.stringify(data.errors));
                    setUploadingCover(false);
                } else {
                    setUploadingCover(false);
                }
            })
            .catch((err) => {
                console.error('Upload error:', err);
                setUploadingCover(false);
            });
    };

    const handleDelete = (post: Post) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/posts/${post.id}`, {
                preserveScroll: true,
            });
        }
    };

    const userInitial = user.name.charAt(0).toUpperCase();
    const friendsCount = user.friends_count ?? 0;
    const photosCount = user.photos_count ?? 0;

    const tabs: { id: TabType; label: string }[] = [
        { id: 'posts', label: 'Posts' },
        { id: 'about', label: 'About' },
        { id: 'friends', label: 'Friends' },
        { id: 'photos', label: 'Photos' },
        { id: 'videos', label: 'Videos' },
    ];

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <FBnavbar user={(auth?.user ?? user) as User} />

            <div className="mx-auto max-w-5xl px-4">
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="relative h-52 overflow-hidden rounded-t-xl sm:h-80">
                        {coverPhotoUrl ? (
                            <img
                                src={coverPhotoUrl}
                                alt="Cover"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-r from-[#1877f2] to-[#166fe5]">
                                <ImageIcon className="h-16 w-16 text-white/50" />
                            </div>
                        )}

                        {isOwnProfile && (
                            <>
                                <button
                                    onClick={() =>
                                        coverInputRef.current?.click()
                                    }
                                    disabled={uploadingCover}
                                    className="absolute right-4 bottom-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#050505] shadow-sm transition-colors hover:bg-[#f0f2f5]"
                                >
                                    <Camera className="h-4 w-4" />
                                    {uploadingCover
                                        ? 'Uploading...'
                                        : 'Add Cover Photo'}
                                </button>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCoverPhotoChange}
                                />
                            </>
                        )}
                    </div>

                    <div className="relative px-4 pb-4 sm:px-6">
                        <div className="flex flex-col items-center sm:flex-row sm:items-end">
                            <div className="relative -mt-16 sm:-mt-20">
                                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-[#e4e6eb] ring-4 ring-white sm:h-40 sm:w-40">
                                    {profilePhotoUrl ? (
                                        <img
                                            src={profilePhotoUrl}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-[#1877f2] text-5xl font-bold text-white sm:text-6xl">
                                            {userInitial}
                                        </div>
                                    )}
                                </div>

                                {isOwnProfile && (
                                    <button
                                        onClick={() =>
                                            profileInputRef.current?.click()
                                        }
                                        disabled={uploadingProfile}
                                        className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#e4e6eb] text-[#050505] shadow-sm transition-colors hover:bg-[#d8dadf] sm:right-2 sm:bottom-2"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                )}
                                <input
                                    ref={profileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleProfilePhotoChange}
                                />
                            </div>

                            <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
                                <h1 className="text-2xl font-bold text-[#050505] sm:text-3xl">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-[#65676b]">
                                    {friendsCount} friends
                                </p>
                            </div>

                            {isOwnProfile ? (
                                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                                    <Button className="gap-2 bg-[#1877f2] hover:bg-[#166fe5]">
                                        <Edit2 className="h-4 w-4" />
                                        Edit profile
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="gap-2 bg-[#e4e6eb] hover:bg-[#d8dadf]"
                                    >
                                        <Check className="h-4 w-4" />
                                        Accept
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                                    <Button className="gap-2 bg-[#1877f2] hover:bg-[#166fe5]">
                                        <UserIcon className="h-4 w-4" />
                                        Add Friend
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="gap-2 bg-[#e4e6eb] hover:bg-[#d8dadf]"
                                    >
                                        <Check className="h-4 w-4" />
                                        Accept
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="gap-2 bg-[#e4e6eb] hover:bg-[#d8dadf]"
                                    >
                                        Message
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 border-t border-[#dadde1] pt-4">
                            <div className="flex flex-wrap gap-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-[#e4e6eb] text-[#050505]'
                                                : 'text-[#65676b] hover:bg-[#f0f2f5]'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                                <button className="rounded-lg px-4 py-2 text-sm font-semibold text-[#65676b] transition-colors hover:bg-[#f0f2f5]">
                                    More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4">
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <h2 className="text-lg font-bold text-[#050505]">
                                Intro
                            </h2>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-[#65676b]">
                                    <MapPin className="h-5 w-5" />
                                    <span>Lives in Manila, Philippines</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#65676b]">
                                    <Users className="h-5 w-5" />
                                    <span>{friendsCount} friends</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#65676b]">
                                    <Video className="h-5 w-5" />
                                    <span>{photosCount} photos</span>
                                </div>
                            </div>
                            <Button className="mt-4 w-full bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]">
                                Edit bio
                            </Button>
                        </div>

                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[#050505]">
                                    Photos
                                </h2>
                                <button className="text-sm text-[#1877f2] hover:underline">
                                    See all photos
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {profilePhotoUrl && (
                                    <div className="aspect-square overflow-hidden rounded-lg bg-[#f0f2f5]">
                                        <img
                                            src={profilePhotoUrl}
                                            alt="Profile Photo"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                {user.posts
                                    ?.filter((p) => p.image_url)
                                    .slice(0, 5)
                                    .map((post, i) => (
                                        <div
                                            key={post.id}
                                            className="aspect-square overflow-hidden rounded-lg bg-[#f0f2f5]"
                                        >
                                            <img
                                                src={post.image_url || ''}
                                                alt={`Post ${i + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                {[1, 2, 3, 4, 5]
                                    .filter(
                                        () =>
                                            (user.posts?.filter(
                                                (p) => p.image_url,
                                            ).length ?? 0) +
                                                (profilePhotoUrl ? 1 : 0) <
                                            6,
                                    )
                                    .map((i) => (
                                        <div
                                            key={`placeholder-${i}`}
                                            className="aspect-square overflow-hidden rounded-lg bg-[#f0f2f5]"
                                        >
                                            <img
                                                src={`https://picsum.photos/seed/${i + 50}/200/200`}
                                                alt={`Photo ${i}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))
                                    .slice(
                                        0,
                                        Math.max(
                                            0,
                                            6 -
                                                (user.posts?.filter(
                                                    (p) => p.image_url,
                                                ).length ?? 0) -
                                                (profilePhotoUrl ? 1 : 0),
                                        ),
                                    )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[#050505]">
                                    Friends
                                </h2>
                                <button className="text-sm text-[#1877f2] hover:underline">
                                    See all friends
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="text-center">
                                        <img
                                            src={`https://i.pravatar.cc/150?img=${i + 10}`}
                                            alt={`Friend ${i}`}
                                            className="mx-auto h-16 w-16 rounded-lg object-cover"
                                        />
                                        <p className="mt-1 truncate text-xs text-[#050505]">
                                            Friend {i}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {isOwnProfile && (
                            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-sm font-semibold text-white">
                                        {userInitial}
                                    </div>
                                    <div className="flex-1">
                                        <Link
                                            href="/all-post"
                                            className="block w-full rounded-full border border-[#ccd0d5] bg-[#f0f2f5] px-4 py-2 text-left text-sm text-[#65676b] hover:bg-[#e4e6eb]"
                                        >
                                            What's on your mind,{' '}
                                            {user.name.split(' ')[0]}?
                                        </Link>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2 border-t pt-3">
                                    <Link
                                        href="/all-post"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm text-[#65676b] hover:bg-[#f0f2f5]"
                                    >
                                        <Video className="h-5 w-5 text-red-500" />
                                        Live video
                                    </Link>
                                    <Link
                                        href="/all-post"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm text-[#65676b] hover:bg-[#f0f2f5]"
                                    >
                                        <ImageIcon className="h-5 w-5 text-green-500" />
                                        Photo/video
                                    </Link>
                                    <Link
                                        href="/all-post"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm text-[#65676b] hover:bg-[#f0f2f5]"
                                    >
                                        <Users className="h-5 w-5 text-yellow-500" />
                                        Tag friends
                                    </Link>
                                </div>
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div className="space-y-4">
                                {user.posts && user.posts.length > 0 ? (
                                    user.posts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                                        <p className="text-[#65676b]">
                                            No posts yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-[#050505]">
                                    About
                                </h2>
                                <p className="mt-4 text-[#65676b]">
                                    No information to show yet.
                                </p>
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-[#050505]">
                                    Friends
                                </h2>
                                <p className="mt-4 text-[#65676b]">
                                    No friends to show yet.
                                </p>
                            </div>
                        )}

                        {activeTab === 'photos' && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-[#050505]">
                                    Photos
                                </h2>
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <div
                                            key={i}
                                            className="aspect-square overflow-hidden rounded-lg bg-[#f0f2f5]"
                                        >
                                            <img
                                                src={`https://picsum.photos/seed/${i + 100}/400/400`}
                                                alt={`Photo ${i}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-[#050505]">
                                    Videos
                                </h2>
                                <p className="mt-4 text-[#65676b]">
                                    No videos to show yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pb-8" />
            </div>

            <FloatingChat />
        </div>
    );
}
