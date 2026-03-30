import { router, useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Post } from './PostCard';
import { useEchoPublic } from '@laravel/echo-react';

type Props = {
    post: Post | null;
    onClose: () => void;
};

export default function EditPostDialog({ post, onClose }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: post?.title ?? '',
        post: post?.post ?? '',
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
        });
    };

    return (
        <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleUpdate}>
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label>Title</Label>
                            <Input
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </Field>
                        <Field>
                            <Label>Post</Label>
                            <Textarea
                                value={data.post}
                                onChange={(e) =>
                                    setData('post', e.target.value)
                                }
                            />
                            {errors.post && (
                                <p className="text-sm text-red-500">
                                    {errors.post}
                                </p>
                            )}
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <div className="flex w-full justify-center">
                            <Button
                                type="submit"
                                className="w-36"
                                disabled={processing}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
