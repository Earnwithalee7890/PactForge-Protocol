import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack for @stacks/connect compatibility
  transpilePackages: ["@stacks/connect", "@stacks/transactions", "@stacks/network", "@stacks/common"],
};

export default nextConfig;
