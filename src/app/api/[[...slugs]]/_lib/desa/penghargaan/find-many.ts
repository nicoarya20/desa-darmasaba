import prisma from "@/lib/prisma";

export default async function penghargaanFindMany() {
  try {
    const data = await prisma.penghargaan.findMany({
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "Success fetch penghargaan",
      data,
    };
  } catch (error) {
    console.error("Find many error:", error);
    return {
      success: false,
      message: "Failed fetch penghargaan",
    };
  }
}
