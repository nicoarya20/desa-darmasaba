import prisma from "@/lib/prisma";

export default async function profileDesaFindMany() {
  const res = await prisma.profileDesa.findMany({
    include: {
      ProfilPerbekel: true,
    },
  });
  return {
    data: res,
  };
}
