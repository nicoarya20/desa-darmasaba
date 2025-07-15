import prisma from "@/lib/prisma";

export default async function ajukanIdeInovatifFindMany() {
  try {
    const data = await prisma.ajukanIdeInovatif.findMany({});

    return {
      success: true,
      message: "Success fetch ajukan ide inovatif",
      data,
    };
  } catch (error) {
    console.error("Find many error:", error);
    return {
      success: false,
      message: "Failed fetch ajukan ide inovatif",
    };
  }
}
