import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <Head title="Register" />

            <div className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center px-4 py-12">
                <div className="w-full rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                    <div className="border-b border-[#dadde1] px-5 py-4">
                        <h1 className="text-[32px] leading-none font-bold text-[#1c1e21]">
                            Sign Up
                        </h1>
                        <p className="mt-1 text-[15px] text-[#606770]">
                            It&apos;s quick and easy.
                        </p>
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="p-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Input
                                                id="first_name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="given-name"
                                                name="first_name"
                                                placeholder="First name"
                                                className="h-11 border-[#ccd0d5] bg-[#f5f6f7] text-base focus-visible:ring-[#1877f2]"
                                            />
                                            <InputError
                                                message={errors.first_name}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                id="last_name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="family-name"
                                                name="last_name"
                                                placeholder="Last name"
                                                className="h-11 border-[#ccd0d5] bg-[#f5f6f7] text-base focus-visible:ring-[#1877f2]"
                                            />
                                            <InputError
                                                message={errors.last_name}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={3}
                                            autoComplete="email"
                                            name="email"
                                            placeholder="Mobile number or email"
                                            className="h-11 border-[#ccd0d5] bg-[#f5f6f7] text-base focus-visible:ring-[#1877f2]"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Enter new password"
                                            className="h-11 border-[#ccd0d5] bg-[#f5f6f7] text-base focus-visible:ring-[#1877f2]"
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            tabIndex={5}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Confirm password"
                                            className="h-11 border-[#ccd0d5] bg-[#f5f6f7] text-base focus-visible:ring-[#1877f2]"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <p className="mt-4 text-xs leading-relaxed text-[#777]">
                                    By clicking Sign Up, you agree to our Terms,
                                    Privacy Policy and Cookies Policy.
                                </p>

                                <div className="mt-5 text-center">
                                    <Button
                                        type="submit"
                                        className="h-11 min-w-48 bg-[#42b72a] px-8 text-lg font-bold hover:bg-[#36a420]"
                                        tabIndex={5}
                                        data-test="register-user-button"
                                    >
                                        {processing && <Spinner />}
                                        Sign Up
                                    </Button>
                                </div>

                                <div className="mt-4 text-center">
                                    <Link
                                        href={login()}
                                        className="text-sm text-[#1877f2] hover:underline"
                                        tabIndex={6}
                                    >
                                        Already have an account?
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}
