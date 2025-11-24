// // app/api/auth/_lib/session_verify.ts
// import { cookies } from 'next/headers';
// import { decrypt } from './decrypt';
// import prisma from '@/lib/prisma';

// /**
//  * Verifikasi session hybrid:
//  * 1. Decrypt JWT token
//  * 2. Cek apakah token masih ada di database (untuk force logout)
//  * 3. Return data user terbaru dari database
//  */
// export async function verifySession(): Promise<Record<string, unknown> | null> {
//   try {
//     const sessionKey = process.env.BASE_SESSION_KEY;
//     if (!sessionKey) {
//       throw new Error('BASE_SESSION_KEY tidak ditemukan di environment');
//     }

//     const jwtSecret = process.env.BASE_TOKEN_KEY;
//     if (!jwtSecret) {
//       throw new Error('BASE_TOKEN_KEY tidak ditemukan di environment');
//     }

//     const cookieStore = await cookies();
//     const token = cookieStore.get(sessionKey)?.value;

//     if (!token) {
//       return null;
//     }

//     // Step 1: Decrypt JWT
//     const jwtUser = await decrypt({ token, jwtSecret });
    
//     if (!jwtUser || !jwtUser.id) {
//       console.log('⚠️ JWT decrypt failed atau tidak ada user ID');
//       return null;
//     }

//     // Step 2: Cek database UserSession (untuk force logout)
//     try {
//       const dbSession = await prisma.userSession.findFirst({
//         where: {
//           userId: jwtUser.id as string,
//           token: token,
//           active: true,
//           OR: [
//             { expires: null },
//             { expires: { gte: new Date() } },
//           ],
//         },
//         include: {
//           User: {
//             select: {
//               id: true,
//               username: true,
//               nomor: true,
//               roleId: true,
//               isActive: true,
//             },
//           },
//         },
//       });

//       // Token tidak ditemukan di database = sudah dihapus (force logout)
//       if (!dbSession) {
//         console.log('⚠️ Token valid tapi sudah dihapus dari database (force logout)');
//         return null;
//       }

//       // Step 3: Return data user terbaru dari database
//       // Ini penting agar roleId selalu update
//       return {
//         id: dbSession.User.id,
//         username: dbSession.User.username,
//         nomor: dbSession.User.nomor,
//         roleId: dbSession.User.roleId,
//         isActive: dbSession.User.isActive,
//       };

//     } catch (dbError) {
//       console.error("⚠️ Error cek database session:", dbError);
//       // Fallback: jika database error, tetap pakai JWT
//       return jwtUser;
//     }

//   } catch (error) {
//     console.warn('❌ Session verification failed:', error);
//     return null;
//   }
// }

// src/app/api/auth/_lib/session_verify.ts
import { cookies } from 'next/headers';
import { decrypt } from './decrypt';
import prisma from '@/lib/prisma';

export async function verifySession() {
  try {
    const sessionKey = process.env.BASE_SESSION_KEY;
    const jwtSecret = process.env.BASE_TOKEN_KEY;

    if (!sessionKey || !jwtSecret) {
      throw new Error('Environment variables tidak lengkap');
    }

    const token = (await cookies()).get(sessionKey)?.value;
    if (!token) return null;

    // Decrypt JWT
    const jwtUser = await decrypt({ token, jwtSecret });
    if (!jwtUser || !jwtUser.id) return null;

    // ✅ Cek apakah session di-invalidate
    const user = await prisma.user.findUnique({
      where: { id: jwtUser.id as string },
      select: {
        id: true,
        username: true,
        nomor: true,
        roleId: true,
        isActive: true,
        sessionInvalid: true, // ← Tambahkan field ini
      },
    });

    if (!user || user.sessionInvalid) {
      console.log('⚠️ Session tidak valid (force logout)');
      return null;
    }

    return user;
  } catch (error) {
    console.warn('Session verification failed:', error);
    return null;
  }
}