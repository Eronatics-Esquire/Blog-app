import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <Head title="Log in" />

            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
                <div className="grid w-full items-center gap-12 lg:grid-cols-2">
                    <div className="text-center lg:text-left">
                        <h1 className="text-6xl font-bold tracking-tight text-[#1877f2]">
                            facebook
                        </h1>
                        <p className="mt-4 text-3xl leading-tight text-[#1c1e21]">
                            Connect with friends and the world around you on
                            Facebook.
                        </p>
                    </div>

                    <div className="mx-auto w-full max-w-md">
                        <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="sr-only"
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="Email address or phone number"
                                                className="h-12 border-[#dddfe2] text-base focus-visible:ring-[#1877f2]"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password"
                                                className="sr-only"
                                            >
                                                Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                                className="h-12 border-[#dddfe2] text-base focus-visible:ring-[#1877f2]"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="h-12 w-full bg-[#1877f2] text-lg font-bold hover:bg-[#166fe5]"
                                            tabIndex={3}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Log in
                                        </Button>

                                        {canResetPassword && (
                                            <div className="text-center">
                                                <Link
                                                    href={request()}
                                                    className="text-sm text-[#1877f2] hover:underline"
                                                    tabIndex={4}
                                                >
                                                    Forgotten password?
                                                </Link>
                                            </div>
                                        )}

                                        <div className="border-t border-[#dadde1] pt-4">
                                            {canRegister && (
                                                <div className="text-center">
                                                    <Link
                                                        href={register()}
                                                        className="inline-flex h-12 items-center rounded-md bg-[#42b72a] px-4 text-base font-bold text-white hover:bg-[#36a420]"
                                                        tabIndex={5}
                                                    >
                                                        Create new account
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-[#606770]">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={6}
                                            />
                                            <Label htmlFor="remember">
                                                Remember me
                                            </Label>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>

                        {status && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <p className="mt-6 text-center text-sm text-[#1c1e21]">
                            <span className="font-semibold">Create a Page</span>{' '}
                            for a celebrity, brand or business.
                        </p>
                    </div>
                                </div>
            </div>
        </div>
    );
}
