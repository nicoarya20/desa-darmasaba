import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { lhkpnUrlSchema } from "@/lib/profil-perbekel-lhkpn";

type FormUpdate = Prisma.ProfilPerbekelGetPayload<{
  select: {
    id: true;
    biodata: true;
    pengalaman: true;
    pengalamanOrganisasi: true;
    programUnggulan: true;
    imageId: true;
    lhkpnUrl: true;
  };
}>;
export default async function profilePerbekelUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id" | "lhkpnUrl"> & {
      lhkpnUrl?: string | null;
    };

    const { biodata, pengalaman, pengalamanOrganisasi, programUnggulan, imageId } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak boleh kosong",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // undefined = klien tidak mengirim field → nilai tersimpan dibiarkan; string kosong/null = dikosongkan.
    let lhkpnUrl: string | null | undefined;
    if (body.lhkpnUrl !== undefined) {
      const parsed = lhkpnUrlSchema.safeParse(body.lhkpnUrl);
      if (!parsed.success) {
        return Response.json(
          { success: false, message: parsed.error.issues[0]?.message ?? "Link LHKPN tidak valid" },
          { status: 400 }
        );
      }
      lhkpnUrl = parsed.data;
    }

    const exisitng = await prisma.profilPerbekel.findUnique({
      where: {
        id,
      },
      include: {
        image: true,
      },
    });

    if (!exisitng) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Data tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const updated = await prisma.profilPerbekel.update({
        where: {id},
        data: {
            biodata,
            pengalaman,
            pengalamanOrganisasi,
            programUnggulan,
            imageId,
            lhkpnUrl,
        }
    })

    if (exisitng.imageId !== imageId) {
      const oldImage = exisitng.image;
      if (oldImage) {
        await removeStoredFile(oldImage, "ProfilPerbekel");
      }
    }

    return new Response(
        JSON.stringify({
            success: true,
            message: "Data berhasil diperbarui",
            data: updated,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

  } catch (error) {
    console.error("Error updating profile Perbekel:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate profile Perbekel",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
