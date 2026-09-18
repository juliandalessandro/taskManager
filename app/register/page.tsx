"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {

    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        setIsSubmitting(false);

        if(!response.ok) {
            const body = await response.json();
            setError(body.error || "Something went wrong");
            return;
        }

        router.push("/login");

    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
                    Register
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        data-testid="register-username-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    <input
                        data-testid="register-email-input"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    <input
                        data-testid="register-password-input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    {error && (
                        <p 
                            data-testid="register-error-message"
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}
                    <button
                        data-testid="register-submit-button"
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-gray-900 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )

}