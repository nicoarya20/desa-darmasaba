import { MODEL_LANDING_PAGE_LAYANAN } from "@/app/admin/(dashboard)/landing-page/layanan/lib/interface";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function layanan_landingpage({req} : {req: MODEL_LANDING_PAGE_LAYANAN}) {
  try {
    const data = await prisma.landingPage_Layanan.create({
        data: {
            id: req.id,
            deksripsi: req.deskripsi    
        },
        select: {
            id: true,
            deksripsi: true
        }
    })
    return NextResponse.json(
        {
          success: true,
          message: "Success get collaboration",
          data: data,
        },
        { status: 200 }
      );
  } catch (error) {
    console.error("Error create layanan", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error create layanan",
        reason: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
