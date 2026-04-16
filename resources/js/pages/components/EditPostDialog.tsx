import { router, useForm } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Post } from '../PostCard';

type Props = {
    post: Post | null;
    onClose: () => void;
};

export default function EditPostDialog({ post, onClose }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: post?.title ?? '',
        post: post?.post ?? '',
        images: [] as File[],
    });

    useEchoPublic('posts', '.BroadcastEvent', () => {
        router.reload({ only: ['posts'], reset: ['posts'] });
    });
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/posts/${post?.id}`, {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleUpdate} className="space-y-5">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-center text-xl font-semibold text-[#050505]">
                            Edit post
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-[#65676b]">Title</Label>
                            <Input
                                className="mt-1 border-[#ccd0d5] focus-visible:ring-[#1877f2]"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-[#65676b]">Post</Label>
                            <Textarea
                                className="mt-1 min-h-36 resize-none border-[#ccd0d5] text-base focus-visible:ring-[#1877f2]"
                                value={data.post}
                                onChange={(e) =>
                                    setData('post', e.target.value)
                                }
                            />
                            {errors.post && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.post}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-[#65676b]">
                                Change photo
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                className="mt-1 border-[#ccd0d5] focus-visible:ring-[#1877f2]"
                                onChange={(e) =>
                                    setData(
                                        'images',
                                        Array.from(e.target.files ?? []),
                                    )
                                }
                            />
                            {data.images.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {data.images.map((image, idx) => (
                                        <img
                                            key={`${image.name}-${idx}`}
                                            src={URL.createObjectURL(image)}
                                            alt={image.name}
                                            className="h-20 w-full rounded-md border object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                            {(errors as any).images && (
                                <p className="mt-1 text-sm text-red-500">
                                    {(errors as any).images}
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
                            disabled={processing}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
