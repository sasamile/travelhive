import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "vekino.s3.us-east-1.amazonaws.com",
      "*.s3.amazonaws.com",
      "*.s3.*.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vekino.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Proxy para redirigir todas las rutas del backend al mismo dominio
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      // También proxy para rutas comunes del backend
      {
        source: "/auth/:path*",
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: "/agencies/:path*",
        destination: `${backendUrl}/agencies/:path*`,
      },
      {
        source: "/bookings/:path*",
        destination: `${backendUrl}/bookings/:path*`,
      },
      {
        source: "/trips/:path*",
        destination: `${backendUrl}/trips/:path*`,
      },
      {
        source: "/public/:path*",
        destination: `${backendUrl}/public/:path*`,
      },
    ];
  },
};

export default nextConfig;
