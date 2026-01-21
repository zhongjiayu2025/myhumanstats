
import { MetadataRoute } from 'next';
import { TESTS } from '@/lib/data';
import { BLOG_POSTS } from '@/lib/blogData';
import { TestCategory } from '@/types';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myhumanstats.org';

  // 1. Static Pages
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/statistics',
    '/tools',
    '/glossary',
    '/blog',
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Test Pages
  const testEntries = TESTS.map((test) => ({
    url: `${baseUrl}/test/${test.id}`,
    lastModified: new Date(), // Ideally this would come from a real updated date
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 3. Dynamic Blog Posts
  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 4. Categories
  const categoryEntries = Object.values(TestCategory).map((cat) => ({
    url: `${baseUrl}/category/${cat.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 5. Tools (Manual list based on routes)
  const toolIds = [
    'tone-generator',
    'bpm-counter',
    'dead-pixel-test',
    'stereo-test',
    'hz-test',
    'mic-test'
  ];
  
  const toolEntries = toolIds.map((id) => ({
    url: `${baseUrl}/tools/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...testEntries,
    ...blogEntries,
    ...categoryEntries,
    ...toolEntries,
  ];
}
