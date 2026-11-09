import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.activiaabmed.org';
  const routes = [
    '',
    '/login',
    '/dashboard',
    '/dashboard/service',
    '/reporting',
    '/activities',
    '/tasks',
    '/calendar',
    '/mail',
    '/documents',
    '/folders',
    '/establishments',
    '/signals',
    '/trainings',
    '/settings',
    '/audit',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/login' ? 1.0 : 0.8,
  }));
}
