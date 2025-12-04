import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content while allowing external links with proper security attributes.
 * All external links will automatically have rel="noopener noreferrer" added.
 * Safe for SSR environments.
 */
export function sanitizeHTMLWithLinks(html: string): string {
  // First, sanitize with allowed tags
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'br', 'p', 'span', 'div', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'title'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
  })

  // Only process links on client side (document exists)
  if (typeof document === 'undefined') {
    return sanitized
  }

  // Create a temporary container to parse the sanitized HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = sanitized

  // Find all links and ensure they have proper security attributes
  const links = tempDiv.querySelectorAll('a')
  links.forEach((link) => {
    const href = link.getAttribute('href')

    // Check if it's an external link
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      // Add target="_blank" if opening external links
      link.setAttribute('target', '_blank')
      
      // Ensure rel attribute has noopener noreferrer
      const rel = link.getAttribute('rel') || ''
      const relValues = new Set(rel.split(/\s+/).filter(Boolean))
      
      relValues.add('noopener')
      relValues.add('noreferrer')
      relValues.add('nofollow') // Additional security measure
      
      link.setAttribute('rel', Array.from(relValues).join(' '))
    }
  })

  return tempDiv.innerHTML
}

/**
 * Configuration preset for sanitizing content with external links
 */
export const SANITIZE_CONFIG_WITH_LINKS = {
  ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'br', 'p', 'span', 'div', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
  ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'title'],
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
}

/**
 * Configuration preset for basic sanitization without links
 */
export const SANITIZE_CONFIG_NO_LINKS = {
  ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'br', 'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['style', 'class'],
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
}
