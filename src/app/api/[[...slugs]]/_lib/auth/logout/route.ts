// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   const sessionKey = process.env.NEXT_PUBLIC_BASE_SESSION_KEY!; // Gunakan environment variable yang tidak diekspos ke client-side
//   if (!sessionKey) {
//     return NextResponse.json(
//       { success: false, message: "Session key tidak ditemukan" },
//       { status: 500 }
//     );
//   }

//   const cookieStore = cookies();
//   const sessionCookie = cookieStore.get(sessionKey);

//   if (!sessionCookie) {
//     return NextResponse.json(
//       { success: false, message: "Session tidak ditemukan" },
//       { status: 400 }
//     );
//   }

//   try {
//     cookieStore.delete(sessionKey);
//     return NextResponse.json(
//       { success: true, message: "Logout berhasil" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Gagal menghapus cookie:", error);
//     return NextResponse.json(
//       { success: false, message: "Gagal melakukan logout" },
//       { status: 500 }
//     );
//   }
// }
