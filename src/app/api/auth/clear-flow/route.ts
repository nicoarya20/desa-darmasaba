// app/api/auth/clear-flow/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // ✅ Next.js 15 syntax
    const cookieStore = await cookies();
    cookieStore.delete('auth_flow');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error clearing flow cookie:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}