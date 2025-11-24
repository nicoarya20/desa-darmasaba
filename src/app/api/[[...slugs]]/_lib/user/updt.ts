// /* eslint-disable @typescript-eslint/no-explicit-any */
// import prisma from "@/lib/prisma";
// import { Context } from "elysia";

// export default async function userUpdate(context: Context) {
//   try {
//     const { id, isActive, roleId } = await context.body as {
//       id: string,
//       isActive?: boolean,
//       roleId?: string
//     };

//     if (!id) {
//       return {
//         success: false,
//         message: "ID user wajib ada",
//       };
//     }

//     // Optional: cek apakah roleId valid
//     if (roleId) {
//       const cekRole = await prisma.role.findUnique({
//         where: { id: roleId }
//       });

//       if (!cekRole) {
//         return {
//           success: false,
//           message: "Role tidak ditemukan",
//         };
//       }
//     }

//     // ✅ CEK: Apakah roleId berubah?
//     let isRoleChanged = false;
//     let oldRoleId: string | null = null;
    
//     if (roleId) {
//       const currentUser = await prisma.user.findUnique({
//         where: { id },
//         select: { 
//           roleId: true,
//           username: true,
//         }
//       });
      
//       if (currentUser && currentUser.roleId !== roleId) {
//         isRoleChanged = true;
//         oldRoleId = currentUser.roleId;
//         console.log(`🔄 Role berubah untuk ${currentUser.username}: ${oldRoleId} → ${roleId}`);
//       }
//     }

//     // Update user
//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: {
//         ...(isActive !== undefined && { isActive }),
//         ...(roleId && { roleId }),
//       },
//       select: {
//         id: true,
//         username: true,
//         nomor: true,
//         isActive: true,
//         roleId: true,
//         updatedAt: true,
//         role: {
//           select: {
//             id: true,
//             name: true,
//           }
//         }
//       }
//     });

//     // ✅ FORCE LOGOUT: Hapus UserSession jika role berubah
//     if (isRoleChanged) {
//       try {
//         const deletedSessions = await prisma.userSession.deleteMany({
//           where: { userId: id }
//         });
        
//         console.log(`🔒 Force logout user ${updatedUser.username} (${id})`);
//         console.log(`   Deleted ${deletedSessions.count} session(s)`);
//         console.log(`   Role: ${oldRoleId} → ${roleId}`);
//       } catch (sessionError: any) {
//         // Jika UserSession tidak ditemukan (user belum pernah login), skip error
//         if (sessionError.code !== 'P2025') {
//           console.error("⚠️ Error menghapus session:", sessionError);
//         } else {
//           console.log(`ℹ️ User ${updatedUser.username} belum pernah login`);
//         }
//       }
//     }

//     // ✅ Response dengan info tambahan
//     return {
//       success: true,
//       message: isRoleChanged 
//         ? `User berhasil diupdate. ${updatedUser.username} akan logout otomatis.`
//         : "User berhasil diupdate",
//       data: updatedUser,
//       roleChanged: isRoleChanged, // Info untuk frontend
//       oldRoleId: oldRoleId,
//       newRoleId: roleId,
//     };

//   } catch (e: any) {
//     console.error("❌ Error update user:", e);
//     return {
//       success: false,
//       message: "Gagal mengupdate user: " + (e.message || "Unknown error"),
//     };
//   }
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";


// API update user (Elysia atau Next.js API Route)
export default async function userUpdate(context: Context) {
  try {
    const { id, isActive, roleId } = await context.body as {
      id: string,
      isActive?: boolean,
      roleId?: string
    };

    if (!id) {
      return {
        success: false,
        message: "ID user wajib ada",
      };
    }

    // Cek apakah roleId valid
    if (roleId) {
      const cekRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!cekRole) {
        return {
          success: false,
          message: "Role tidak ditemukan",
        };
      }
    }

    // Deteksi perubahan role
    let isRoleChanged = false;
    if (roleId) {
      const currentUser = await prisma.user.findUnique({
        where: { id },
        select: { roleId: true }
      });
      isRoleChanged = currentUser?.roleId !== roleId;
    }

    // ✅ UPDATE USER + INVALIDATE SESSION
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(roleId && { roleId }),
        // Force logout: set sessionInvalid = true
        ...(isRoleChanged && { sessionInvalid: true }),
      },
      select: {
        id: true,
        username: true,
        nomor: true,
        isActive: true,
        roleId: true,
        role: { select: { name: true } }
      }
    });

    // ✅ Reset sessionInvalid setelah 5 detik (opsional)
    if (isRoleChanged) {
      setTimeout(async () => {
        try {
          await prisma.user.update({
            where: { id },
            data: { sessionInvalid: false }
          });
        } catch (e) {
          console.error('Gagal reset sessionInvalid:', e);
        }
      }, 5000);
    }

    return {
      success: true,
      message: isRoleChanged 
        ? `User berhasil diupdate. ${updatedUser.username} akan logout otomatis.`
        : "User berhasil diupdate",
      data: updatedUser,
    };
  } catch (e: any) {
    console.error("❌ Error update user:", e);
    return {
      success: false,
      message: "Gagal mengupdate user: " + (e.message || "Unknown error"),
    };
  }
}