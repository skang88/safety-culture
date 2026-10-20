import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    // Docker 환경 내부에서는 backend 컨테이너, 로컬 개발 시에는 127.0.0.1
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      (process.env.NODE_ENV === "production" ? "http://backend:8000" : "http://127.0.0.1:8000");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
