
import Bun from 'bun'
import { AppServer } from '@/app/api/[[...slugs]]/route'
import { treaty } from '@elysiajs/eden'
const ApiFetch = treaty<AppServer>(Bun.env.NEXT_PUBLIC_WIBU_URL || 'localhost:3000')

export default ApiFetch