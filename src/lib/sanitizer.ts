/**
 * HTML Sanitizer Utility
 * 
 * Membersihkan HTML content dari script dan tag berbahaya
 * Menggunakan DOMPurify-like approach untuk environment Node.js
 */

/**
 * Sanitize HTML content untuk mencegah XSS attacks
 * @param html - HTML content yang akan disanitize
 * @returns HTML yang sudah dibersihkan dari script berbahaya
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove javascript: protocol in href/src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?javascript:[^"'\s>]*/gi, '$1=""');

  // Remove on* event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^"'\s>]*/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // Remove style tags (optional - can be kept if needed)
  // sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove data: protocol in src attributes (can be used for XSS)
  sanitized = sanitized.replace(/(src)\s*=\s*["']?data:[^"'\s>]*/gi, '$1=""');

  // Remove expression() in CSS (IE-specific XSS vector)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');

  return sanitized;
}

/**
 * Sanitize text input (remove HTML tags completely)
 * @param text - Text input yang akan disanitize
 * @returns Plain text tanpa HTML tags
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove all HTML tags
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize URL - hanya izinkan http dan https
 * @param url - URL yang akan disanitize
 * @returns URL yang aman atau empty string jika tidak valid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return '';
    }

    return parsedUrl.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize YouTube URL - extract video ID
 * @param url - YouTube URL
 * @returns YouTube video ID atau empty string jika tidak valid
 */
export function sanitizeYouTubeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    
    // Check if it's a YouTube URL
    if (!parsedUrl.hostname.includes('youtube.com') && 
        !parsedUrl.hostname.includes('youtu.be')) {
      return '';
    }

    // Extract video ID
    let videoId = '';
    
    if (parsedUrl.hostname.includes('youtu.be')) {
      videoId = parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname.includes('youtube.com')) {
      videoId = parsedUrl.searchParams.get('v') || '';
    }

    // Validate video ID (YouTube video IDs are 11 characters)
    if (videoId.length !== 11) {
      return '';
    }

    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch {
    return '';
  }
}
