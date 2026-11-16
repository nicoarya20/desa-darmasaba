import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import type { UserManagerContext } from "../guard";

type FormUpdate = {
    name: string;
}

export default async function roleUpdate(context: UserManagerContext) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const previous = await prisma.role.findUnique({ where: { id }, select: { name: true } });
        const result = await prisma.role.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        const previousName = previous?.name;
        const renamed = previousName !== undefined && previousName !== result.name;
        await audit({
            actor: context.actor,
            action: AUDIT_ACTIONS.ROLE_UPDATE,
            targetType: "role",
            targetId: id,
            summary: renamed
                ? `Mengganti nama role ${previousName} menjadi ${result.name}`
                : `Mengubah role ${result.name}`,
            meta: renamed ? { name: result.name, previousName } : { name: result.name },
        });
        return {
            success: true,
            message: "Berhasil mengupdate role",
            data: result,
        };
    } catch (error) {
        console.error("Error updating role:", error);
        throw new Error("Gagal mengupdate role: " + (error as Error).message);
    }
}