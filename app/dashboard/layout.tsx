import "../globals.css";
import React from "react";
import Link from "next/link";
import NavLink from "@/components/NavLink";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
    </>
  );
}

function Header() {
  return (
    <header className="bg-[#16222c]/80 border-b border-gray-800 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-primary font-bold"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Hourly Journal
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/dashboard/day" label="Hourly View" />
            <NavLink href="/dashboard/entries/new" label="New Entry" />
            <NavLink href="/dashboard/export" label="Export" />
          </nav>
        </div>
      </div>
    </header>
  );
}
