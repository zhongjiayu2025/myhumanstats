
'use client';

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Optimization for Unsplash images
  if (src.startsWith('https://images.unsplash.com')) {
    // Append Unsplash resizing parameters
    // fit=max: resizes the image to fit within the specified dimensions while maintaining aspect ratio
    // auto=format: automatically delivers WebP/AVIF if the browser supports it
    return `${src}&w=${width}&q=${quality || 75}&fit=max&auto=format`;
  }

  // Optimization for local images (if you were using a CDN like Cloudinary, you'd handle it here)
  // For static local assets in 'public/', we return as is, or you could prefix a CDN URL
  return src;
}
