import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import type { UserManagerContext } from "../guard";

export default async function roleDelete(context: UserManagerContext) {
    const id = context.params.id as string;

    const deleted = await prisma.role.delete({
        where: { id },
    });

    await audit({
        actor: context.actor,
        action: AUDIT_ACTIONS.ROLE_DELETE,
        targetType: "role",
        targetId: id,
        summary: `Menghapus role ${deleted.name}`,
        meta: { name: deleted.name },
    });

    return {
        status: 200,
        success: true,
        message: "Sukses Menghapus role",
    };
}