"use server";

import prisma from "@/lib/prisma";

export async function auth_getCodeOtpByNumber({kodeId}: {kodeId: string}) {
  const data = await prisma.kodeOtp.findFirst({
    where: {
      id: kodeId,
    },
  });

  return data;
}
