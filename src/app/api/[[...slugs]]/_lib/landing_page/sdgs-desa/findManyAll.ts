// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";

async function sdgsDesaFindManyAll() {
  try {
    const data = await prisma.sdgsDesa.findMany({
      include: {
        image: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return {
      success: true,
      message: "Success fetch SDGS Desa",
      data,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch SDGS Desa with pagination",
    };
  }
}

export default sdgsDesaFindManyAll;
