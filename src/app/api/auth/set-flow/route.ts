// app/api/auth/set-flow/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { flow } = await request.json();
    
    if (!flow || !['login', 'register'].includes(flow)) {
      return NextResponse.json(
        { success: false, message: 'Invalid flow parameter' },
        { status: 400 }
      );
    }
    
    // ✅ Next.js 15 syntax
    const cookieStore = await cookies();
    cookieStore.set('auth_flow', flow, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5,
      path: '/'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error setting flow cookie:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}