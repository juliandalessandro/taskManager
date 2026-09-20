"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {

    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const result = await signIn("credentials", {
            identifier,
            password,
            redirect: false,
        });

        setIsSubmitting(false);

        if (result?.error) {
            setError("Invalid credentials");
            return;
        }

        // router.push("/tasks");
        window.location.href = "/tasks";
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        data-testid="login-identifier-input"
                        placeholder="Username or Email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    <input
                        data-testid="login-password-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    {error && (
                        <p
                            data-testid="login-error-message"
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}
                    <button 
                        data-testid="login-submit-button"
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-gray-900 hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
        
    )

}