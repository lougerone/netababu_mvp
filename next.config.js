/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    // Define the external image domains you want to allow.
    // See https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
    remotePatterns: [
      // Stackby attachments stored in Amazon S3 buckets
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      // Stackby domains (e.g. if attachments are proxied through stackby.com)
      {
        protocol: 'https',
        hostname: '**.stackby.com',
        pathname: '/**',
      },
      // Airtable attachment domains (remove these if you no longer serve Airtable images)
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
        pathname: '/**',
      },
      // Wikimedia domains for party logos and other external images
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.wikimedia.org',
        pathname: '/**',
      },
    ],
    // Restrict image quality values (default 75). This becomes required in Next.js 16:contentReference[oaicite:4]{index=4}.
    qualities: [75],
  },
};
