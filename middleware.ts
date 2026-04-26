import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/stores/:path*",
    "/challenges/:path*",
    "/matches/:path*",
    "/events/:path*",
    "/chat/:path*",
    "/rankings/:path*",
    "/admin/:path*",
  ],
};
