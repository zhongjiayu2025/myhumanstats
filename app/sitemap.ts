
import { MetadataRoute } from 'next';
import { TESTS } from '@/lib/data';
import { BLOG_POSTS } from '@/lib/blogData';
import { TestCategory } from '@/types';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myhumanstats.org';

  // 1. Static Pages
  // Strategy: Don't set lastModified for static pages unless they actually change.
  // Google ignores "always fresh" dates if content doesn't change.
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
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Test Pages
  const testEntries = TESTS.map((test) => ({
    url: `${baseUrl}/test/${test.id}`,
    changeFrequency: 'monthly' as const, // Tests are stable software
    priority: 0.9,
  }));

  // 3. Dynamic Blog Posts
  // Blog posts MUST have accurate dates
  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 4. Categories
  const categoryEntries = Object.values(TestCategory).map((cat) => ({
    url: `${baseUrl}/category/${cat.toLowerCase()}`,
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
