import prisma from "@/lib/prisma";
import { Context } from "elysia";

type JamOperasionalInput = {
  workDays: string;
  weekDays: string;
  holiday: string;
};

type KontakPuskesmasInput = {
  kontakPuskesmas: string;
  email: string;
  facebook: string;
  kontakUGD: string;
};

type CreatePuskesmasInput = {
  name: string;
  alamat: string;
  imageId: string;
  jam: JamOperasionalInput;
  kontak: KontakPuskesmasInput;
};

const puskesmasCreate = async (context: Context) => {
  const { name, alamat, imageId, jam, kontak } = await context.body as CreatePuskesmasInput;

  // 1. Buat jam operasional
  const createdJam = await prisma.jamOperasional.create({
    data: {
      workDays: jam.workDays,
      weekDays: jam.weekDays,
      holiday: jam.holiday
    }
  });

  // 2. Buat kontak puskesmas
  const createdKontak = await prisma.kontakPuskesmas.create({
    data: {
      kontakPuskesmas: kontak.kontakPuskesmas,
      email: kontak.email,
      facebook: kontak.facebook,
      kontakUGD: kontak.kontakUGD
    }
  });

  // 3. Buat puskesmas
  const createdPuskesmas = await prisma.puskesmas.create({
    data: {
      name,
      alamat,
      imageId,
      jamId: createdJam.id,
      kontakId: createdKontak.id
    },
    include: {
      image: true,
      jam: true,
      kontak: true
    }
  });

  return {
    success: true,
    data: createdPuskesmas
  };
};

export default puskesmasCreate;
