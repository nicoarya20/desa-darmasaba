import prisma from "@/lib/prisma";

export default async function roleFindMany() {
  const data = await prisma.role.findMany();

  return {
    success: true,
    message: "Success get all role",
    data,
  };
}
