// app/api/auth/get-flow/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // ✅ Next.js 15 syntax
    const cookieStore = await cookies();
    const flow = cookieStore.get('auth_flow')?.value || 'login';
    
    return NextResponse.json({ 
      success: true, 
      flow 
    });
  } catch (error) {
    console.error('❌ Error getting flow cookie:', error);
    return NextResponse.json(
      { success: false, flow: 'login' },
      { status: 500 }
    );
  }
}