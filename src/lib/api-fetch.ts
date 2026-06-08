import type { AppServer } from '@/app/api/[[...slugs]]/route'
import { treaty } from '@elysiajs/eden'

// Determine the base URL based on environment
// treaty requires a full URL, cannot use relative paths like '/'
const getBaseUrl = () => {
  // Development (server-side)
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
  
  // Client-side (browser) - use current window origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Production/Staging server-side - use environment variable or default
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

const BASE_URL = getBaseUrl()

const ApiFetch = treaty<AppServer>(BASE_URL)

export default ApiFetch
