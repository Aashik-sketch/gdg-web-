/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // `images.domains` is deprecated in favour of the more explicit
    // remotePatterns, which also pins the protocol and path.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/**",
      },
    ],
  },
  // react-icons and lucide-react are barrel files; without this, importing one
  // icon pulls the whole package into the server bundle (react-icons alone was
  // an 11 MB vendor chunk).
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "lucide-react",
      "@material-symbols-svg/react",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // The admin console and every API response carry applicant PII.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
