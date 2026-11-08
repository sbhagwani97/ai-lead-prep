import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make sure the prep page template is bundled with the /prep route on Vercel.
  outputFileTracingIncludes: {
    "/prep": ["./content/**/*"],
  },
};

export default nextConfig;
