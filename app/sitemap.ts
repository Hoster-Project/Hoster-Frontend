import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hoster.demo';

  // Static routes
  const routes = [
    '',
    '/login',
    '/signup',
    '/dashboard',
    '/calendar',
    '/inbox',
    '/admin',
    '/provider',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const listingRoutes = await fetch('http://localhost:5000/api/public/listings', { cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) return [];
      const listings = await res.json();
      return listings.map((l: any) => ({
        url: `${baseUrl}/listing/${l.id}`,
        lastModified: new Date(l.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    })
    .catch(() => []); // Fallback to empty if API is unreachable during build

  return [...routes, ...listingRoutes];
}
