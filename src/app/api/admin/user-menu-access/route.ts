// src/app/api/admin/user-menu-access/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { canManageMenuAccess, canReadMenuAccess } from '@/lib/auth-policy'

const forbidden = () =>
  NextResponse.json(
    { success: false, message: 'Forbidden - Anda tidak berhak mengelola menu akses user ini' },
    { status: 403 }
  )

/** Menu Access user: milik sendiri (semua role) atau user lain (hanya role 0/1). */
export async function GET(request: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.authenticated) return authResult.response

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID diperlukan' },
        { status: 400 }
      )
    }

    if (!canReadMenuAccess(authResult.user, userId)) return forbidden()

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

/** Ganti seluruh Menu Access seorang user — hanya role 0/1. */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.authenticated) return authResult.response
    if (!canManageMenuAccess(authResult.user.roleId)) return forbidden()

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