import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin gate.
 *
 * The legacy /admin was a plain static file — anyone who guessed the
 * URL got the panel, the order list and write access to homepage
 * content. Here the request never reaches the admin HTML without a
 * session.
 *
 * This is the front door, not the lock. Row Level Security is what
 * actually protects the data: even with the markup in hand, an
 * unauthenticated client can read nothing private and write nothing.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with Supabase rather than trusting
  // the cookie's contents, so a forged or expired session fails here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Return the visitor where they were headed once signed in.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in? The login page has nothing to offer.
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  /* Runs on /admin and /login only. Storefront requests skip it, so no
     shopper pays for an auth round-trip. */
  matcher: ["/admin/:path*", "/admin", "/login"],
};
