
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nobartv-pro.vercel.app';

  // Daftar channel populer untuk diindeks oleh Google
  const popularChannels = [
    'rcti', 'sctv', 'indosiar', 'trans7', 'trans tv', 
    'mnc tv', 'gtv', 'antv', 'tvone', 'kompas tv', 'inews'
  ];

  const channelRoutes = popularChannels.map((channel) => ({
    url: `${baseUrl}/?channel=${encodeURIComponent(channel)}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/checker`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...channelRoutes,
  ]
}
