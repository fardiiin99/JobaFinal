"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The five sections, exactly as specified.
 *
 * Every entry is a real URL rather than a hash route, so pages are
 * bookmarkable, the back button works, and a deep link survives a
 * reload — none of which the legacy hash-router admin managed.
 */
const NAV = [
  { href: "/admin", label: "Dashboard Analytics", children: [] },
  {
    href: "/admin/products",
    label: "Products",
    children: [
      { href: "/admin/products", label: "Existing Products List" },
      { href: "/admin/products/new", label: "Add Product" },
    ],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    children: [
      { href: "/admin/orders", label: "All Orders" },
      { href: "/admin/orders/new", label: "Add new orders" },
    ],
  },
  {
    href: "/admin/settings/categories",
    label: "Settings",
    children: [
      {
        href: "/admin/settings/categories",
        label: "Product Category Settings",
      },
      { href: "/admin/settings/homepage", label: "Homepage settings" },
      { href: "/admin/settings/meta", label: "Meta Pixel and CAPI Settings" },
      { href: "/admin/settings/logs", label: "Logs" },
    ],
  },
  { href: "/admin/analytics", label: "Detailed Analytics", children: [] },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV)[number]) => {
    if (item.href === "/admin") return pathname === "/admin";
    if (item.label === "Settings") return pathname.startsWith("/admin/settings");
    return pathname.startsWith(item.href);
  };

  return (
    <nav aria-label="Admin sections" className="w-full shrink-0 lg:w-64">
      <ol className="space-y-1">
        {NAV.map((item, i) => {
          const active = isActive(item);
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-joba px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                  active ? "bg-ink text-white" : "text-ink hover:bg-white"
                }`}
              >
                <span
                  className={`text-[12px] tabular-nums ${
                    active ? "text-white/50" : "text-ink-soft"
                  }`}
                >
                  {i + 1}
                </span>
                {item.label}
              </Link>

              {item.children.length > 0 && active && (
                <ol className="ml-6 mt-1 space-y-0.5 border-l border-line pl-3">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={
                          pathname === child.href ? "page" : undefined
                        }
                        className={`block rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                          pathname === child.href
                            ? "font-semibold text-hibiscus"
                            : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
