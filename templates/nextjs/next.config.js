/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./styles'],
  },
  // Path aliases are configured in tsconfig.json
}

module.exports = nextConfig
