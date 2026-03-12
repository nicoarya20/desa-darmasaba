import { AppServer } from '@/app/api/[[...slugs]]/route'
import { treaty } from '@elysiajs/eden'

// Use relative URL '/' for better deployment flexibility
// This allows the API to work correctly in both development and staging/production
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '/'

const ApiFetch = treaty<AppServer>(BASE_URL)

export default ApiFetch