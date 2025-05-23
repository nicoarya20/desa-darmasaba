import prisma from "@/lib/prisma";

async function beritaFindMany() {
  try {
    const data = await prisma.berita.findMany({
      where: { isActive: true },
      include: {
        image: true,
        kategoriBerita: true,
      },
    });

    return {
      success: true,
      message: "Success fetch berita",
      data,
    };
  } catch (e) {
    console.error("Find many error:", e);
    return {
      success: false,
      message: "Failed fetch berita",
    };
  }
}

export default beritaFindMany;
