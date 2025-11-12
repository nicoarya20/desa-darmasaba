import prisma from "@/lib/prisma";
import { Context } from "elysia";

type ArtikelKesehatanInput = {
    title: string;
    content: string;
    imageId: string;
    introduction: {content: string};
    symptom: {title: string; content: string};
    prevention: {title: string; content: string};
    firstAid: {title: string; content: string};
    mythVsFact: {title: string; mitos: string; fakta: string};
    doctorSign: {content: string};
}

const artikelKesehatanCreate = async (context: Context) => {
    const body = await context.body as ArtikelKesehatanInput;
    const { title, content, introduction, symptom, prevention, firstAid, mythVsFact, doctorSign, imageId } = body;

    const [createdIntroduction, createdSymptom, createdPrevention, createdFirstAid, createdMythVsFact, createdDoctorSign] = await Promise.all([
        prisma.introduction.create({ data: introduction }),
        prisma.symptom.create({ data: symptom }),
        prisma.prevention.create({ data: prevention }),
        prisma.firstAid.create({ data: firstAid }),
        prisma.mythVsFact.create({ data: mythVsFact }),
        prisma.doctorSign.create({ data: doctorSign }),
    ])

    const artikelKesehatan = await prisma.artikelKesehatan.create({
        data: {
            title,
            content,
            imageId,
            introductionId: createdIntroduction.id,
            symptomId: createdSymptom.id,
            preventionId: createdPrevention.id,
            firstAidId: createdFirstAid.id,
            mythVsFactId: createdMythVsFact.id,
            doctorSignId: createdDoctorSign.id,
        },
        include: {
            image: true,
            introduction: true,
            symptom: true,
            prevention: true,
            firstaid: true,
            mythvsfact: true,
            doctorsign: true,
        }
    })

    return {
        success: true,
        message: "Sukses menambahkan artikel kesehatan",
        data: artikelKesehatan,
    }
}
export default artikelKesehatanCreate;  // export the function