// src/app/api/admin/public-menu-access/route.ts
// Menu admin "Publik": terbuka untuk semua admin, ditambahkan di atas Menu Access per user.

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { canManageMenuAccess, isAdminRole } from '@/lib/auth-policy'

const forbidden = (message: string) =>
  NextResponse.json({ success: false, message }, { status: 403 })

/** Normalisasi body POST: array string non-kosong, tanpa duplikat; null bila bentuknya salah. */
function parseMenuIds(body: unknown): string[] | null {
  const menuIds = (body as { menuIds?: unknown } | null)?.menuIds
  if (!Array.isArray(menuIds) || !menuIds.every((id) => typeof id === 'string')) return null
  return Array.from(new Set(menuIds.map((id) => id.trim()).filter(Boolean)))
}

/** Daftar menu Publik — dibaca semua admin (dipakai sidebar & guard halaman). */
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.authenticated) return authResult.response
    if (!isAdminRole(authResult.user.roleId)) return forbidden('Forbidden - Khusus admin')

    const rows = await prisma.publicMenuAccess.findMany({ select: { menuId: true } })
    return NextResponse.json({ success: true, menuIds: rows.map((r) => r.menuId) })
  } catch (error) {
    console.error('GET Public Menu Access Error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memuat menu publik' },
      { status: 500 }
    )
  }
}

/** Ganti seluruh daftar menu Publik — hanya role 0/1. */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.authenticated) return authResult.response
    if (!canManageMenuAccess(authResult.user.roleId)) {
      return forbidden('Forbidden - Anda tidak berhak mengelola menu publik')
    }

    const menuIds = parseMenuIds(await request.json().catch(() => null))
    if (!menuIds) {
      return NextResponse.json({ success: false, message: 'Data tidak valid' }, { status: 400 })
    }

    // Satu transaksi supaya daftar tidak sempat kosong/terbelah bila createMany gagal.
    await prisma.$transaction([
      prisma.publicMenuAccess.deleteMany({}),
      prisma.publicMenuAccess.createMany({ data: menuIds.map((menuId) => ({ menuId })) }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST Public Menu Access Error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan menu publik' },
      { status: 500 }
    )
  }
}
