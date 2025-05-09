import prisma from "@/lib/prisma";

export default async function profilePPIDFindMany() {
    const res = await prisma.profilePPID.findMany();
    return{
        data: res
    }
}
    