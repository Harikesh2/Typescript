import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DJANGO_API_URL: process.env.DJANGO_API_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
