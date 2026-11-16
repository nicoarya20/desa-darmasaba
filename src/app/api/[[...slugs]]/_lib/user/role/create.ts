import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import type { UserManagerContext } from "../guard";

type FormCreate = {
    name: string;
}

export default async function roleCreate(context: UserManagerContext) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.role.create({
            data: {
                name: body.name,
            },
        });
        await audit({
            actor: context.actor,
            action: AUDIT_ACTIONS.ROLE_CREATE,
            targetType: "role",
            targetId: result.id,
            summary: `Membuat role ${result.name}`,
            meta: { name: result.name },
        });
        return {
            success: true,
            message: "Berhasil membuat role",
            data: result,
        };
    } catch (error) {
        console.error("Error creating role:", error);
        throw new Error("Gagal membuat role: " + (error as Error).message);
    }
}