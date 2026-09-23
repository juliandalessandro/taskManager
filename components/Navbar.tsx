"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export function Navbar({ username }: { username: string }) {

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = "/login";
    };

    return (

        <nav className="flex items-center justify-between bg-zinc-900 px-6 py-4">
            
            <span className="text-lg font-semibold text-white">Task Manager</span>

            <div className="relative" ref={menuRef}>
                <button
                    data-testid="navbar-menu-toggle"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition hover:bg-gray-800"
                >
                    {username}
                    <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && (
                    <div
                        data-testid="navbar-dropdown"
                        className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    >
                        <button
                        data-testid="navbar-logout-button"
                        onClick={handleLogout}
                        className="cursor-pointer w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                        >
                        Log out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
};