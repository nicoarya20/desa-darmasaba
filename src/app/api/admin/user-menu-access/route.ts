// src/app/api/admin/user-menu-access/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ❌ HAPUS { params } karena tidak dipakai
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID diperlukan' },
        { status: 400 }
      )
    }

    const menuAccess = await prisma.userMenuAccess.findMany({
      where: { userId },
      select: { menuId: true },
    })

    return NextResponse.json({
      success: true,
      menuIds: menuAccess.map(m => m.menuId),
    })
  } catch (error) {
    console.error('GET User Menu Access Error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memuat menu akses' },
      { status: 500 }
    )
  }
}

// POST tetap sama (tanpa perubahan)
export async function POST(request: Request) {
  try {
    const { userId, menuIds } = await request.json()

    if (!userId || !Array.isArray(menuIds)) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid' },
        { status: 400 }
      )
    }

    await prisma.userMenuAccess.deleteMany({ where: { userId } })

    if (menuIds.length > 0) {
      await prisma.userMenuAccess.createMany({
        data: menuIds.map((menuId: string) => ({ userId, menuId })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST User Menu Access Error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan menu akses' },
      { status: 500 }
    )
  }
}