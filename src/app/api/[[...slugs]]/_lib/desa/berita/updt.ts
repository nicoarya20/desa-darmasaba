import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

type FormUpdate = Prisma.BeritaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
    content: true;
    kategoriBeritaId: true;
    imageId: true;
  };
}>;

// async function beritaUpdate(context: Context) {
//   const body = (await context.body) as FormUpdate;

//   const {
//     id,
//     judul,
//     deskripsi,
//     content,
//     kategoriBeritaId,
//     imageId,
//   } = body;

//   if (!id) {
//     return {
//       status: 400,
//       body: "ID tidak boleh kosong",
//     };
//   }

//   const existing = await prisma.berita.findUnique({
//     where: { id },
//     include: {
//       image: true,
//     },
//   });

//   if (!existing) {
//     return {
//       status: 404,
//       body: "Berita tidak ditemukan",
//     };
//   }

//   // Cek jika imageId diubah
//   if (existing.imageId && existing.imageId !== imageId) {
//     const oldImage = existing.image;
//     if (oldImage) {
//       try {
//         const filePath = path.join(oldImage.path, oldImage.name);
//         await fs.unlink(filePath); // hapus file dari filesystem
//         await prisma.fileStorage.delete({
//           where: { id: oldImage.id }, // hapus record dari DB
//         });
//       } catch (err) {
//         console.error("Gagal hapus gambar lama:", err);
//       }
//     }
//   }

//   const updated = await prisma.berita.update({
//     where: { id },
//     data: {
//       judul,
//       deskripsi,
//       content,
//       kategoriBeritaId,
//       imageId,
//     },
//   });

//   return {
//     success: true,
//     message: "Berita berhasil diupdate (gambar lama juga dihapus jika ada)",
//     data: updated,
//   };
// }

// export default beritaUpdate;


async function beritaUpdate(context: Context) {
    const id = context.params.id as string; // ambil dari URL
    const body = (await context.body) as Omit<FormUpdate, "id">;
  
    const {
      judul,
      deskripsi,
      content,
      kategoriBeritaId,
      imageId,
    } = body;
  
    if (!id) {
      return {
        status: 400,
        body: "ID tidak boleh kosong",
      };
    }
  
    const existing = await prisma.berita.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });
  
    if (!existing) {
      return {
        status: 404,
        body: "Berita tidak ditemukan",
      };
    }
  
    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        try {
          const filePath = path.join(oldImage.path, oldImage.name);
          await fs.unlink(filePath);
          await prisma.fileStorage.delete({
            where: { id: oldImage.id },
          });
        } catch (err) {
          console.error("Gagal hapus gambar lama:", err);
        }
      }
    }
  
    const updated = await prisma.berita.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        content,
        kategoriBeritaId,
        imageId,
      },
    });
  
    return {
      success: true,
      message: "Berita berhasil diupdate",
      data: updated,
    };
  }
  export default beritaUpdate;
