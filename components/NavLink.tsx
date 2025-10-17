"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={
        "transition-colors " +
        (active ? "text-primary" : "text-gray-400 hover:text-primary")
      }
    >
      {label}
    </Link>
  );
}
