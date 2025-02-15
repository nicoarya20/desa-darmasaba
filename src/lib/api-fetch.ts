
import { AppServer } from '@/app/api/[[...slugs]]/route'
import { treaty } from '@elysiajs/eden'
const ApiFetch = treaty<AppServer>(process.env.NEXT_PUBLIC_HOST || 'localhost:3000')

export default ApiFetch