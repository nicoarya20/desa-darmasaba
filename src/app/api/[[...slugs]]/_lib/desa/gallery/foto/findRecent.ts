import prisma from "@/lib/prisma";

export default async function galleryFotoFindRecent() {
  const result = await prisma.galleryFoto.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 3, // ambil 4 data terbaru
    include: {
      imageGalleryFoto: true,
    },
  });

  return {
    success: true,
    data: result,
  };
}
