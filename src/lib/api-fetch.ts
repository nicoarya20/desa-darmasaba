import { AppServer } from '@/app/api/[[...slugs]]/route'
import { treaty } from '@elysiajs/eden'

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const ApiFetch = treaty<AppServer>(BASE_URL)

export default ApiFetch