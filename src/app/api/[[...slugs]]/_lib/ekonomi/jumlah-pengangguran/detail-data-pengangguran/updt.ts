// import prisma from "@/lib/prisma";
// import { Context } from "elysia";

// export default async function detailDataPengangguranUpdate(context: Context) {
//     const id = context.params?.id;

//     if (!id) {
//         return {
//             success: false,
//             message: "ID tidak ditemukan",
//         }
//     }

//     const { month, year, totalUnemployment, educatedUnemployment, uneducatedUnemployment, percentageChange } = context.body as {
//         month: string;
//         year: number;
//         totalUnemployment: number;
//         educatedUnemployment: number;
//         uneducatedUnemployment: number;
//         percentageChange: number;
//     }

//     const duplicate = await prisma.detailDataPengangguran.findFirst({
//         where: {
//             month,
//             year,
//             NOT: { id },
//         },
//     });
      
//     if (duplicate) {
//         return {
//           success: false,
//           message: `Data bulan ${month} ${year} sudah ada.`,
//         };
//       }

//     const existing = await prisma.detailDataPengangguran.findUnique({
//         where: {
//             id: id,
//         },
//     })

//     if (!existing) {
//         return {
//             success: false,
//             message: "Data tidak ditemukan",
//         }
//     }

//     const updated = await prisma.detailDataPengangguran.update({
//         where: { id },
//         data: {
//             month,
//             year,
//             totalUnemployment,
//             educatedUnemployment,
//             uneducatedUnemployment,
//             percentageChange,
//         },
//     })

//     return {
//         success: true,
//         message: "Data berhasil diupdate",
//         data: updated,
//     }
// }


import prisma from "@/lib/prisma";
import { Context } from "elysia";


const monthOrder = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default async function detailDataPengangguranUpdate(context: Context) {
    const id = context.params?.id;
  
    if (!id) {
      return { success: false, message: "ID tidak ditemukan" };
    }
  
    const { month, year: yearInput, totalUnemployment, educatedUnemployment, uneducatedUnemployment } = context.body as {
      month: string;
      year: number | string | Date;
      totalUnemployment: number | string;
      educatedUnemployment: number | string;
      uneducatedUnemployment: number | string;
    };
    
    // Normalize year to Date object
    const year = typeof yearInput === 'number' ? new Date(yearInput, 0, 1) : 
                yearInput instanceof Date ? yearInput : 
                new Date(parseInt(yearInput as string), 0, 1);
  
    const duplicate = await prisma.detailDataPengangguran.findFirst({
      where: {
        month,
        year,
        NOT: { id },
      },
    });
  
    if (duplicate) {
      return { success: false, message: `Data bulan ${month} ${year} sudah ada.` };
    }
  
    const current = await prisma.detailDataPengangguran.findUnique({ where: { id } });
  
    if (!current) {
      return { success: false, message: "Data tidak ditemukan" };
    }
  
    const currentMonthIndex = monthOrder.indexOf(month);
    const prevMonth = currentMonthIndex > 0 ? monthOrder[currentMonthIndex - 1] : "Des";
    const currentYear = year.getFullYear();
    const prevYear = currentMonthIndex > 0 ? currentYear : currentYear - 1;
  
    const prevData = await prisma.detailDataPengangguran.findFirst({
      where: {
        month: prevMonth,
        year: new Date(prevYear, 0, 1),
      },
    });
  
    let percentageChange: number | null = null;
    if (prevData) {
      const change = ((Number(totalUnemployment) - Number(prevData.totalUnemployment)) / Number(prevData.totalUnemployment)) * 100;
      percentageChange = parseFloat(change.toFixed(1));
    }
  
    const updated = await prisma.detailDataPengangguran.update({
      where: { id },
      data: {
        month,
        year: new Date(year), // Ensure it's a new Date instance
        totalUnemployment: Number(totalUnemployment),
        educatedUnemployment: Number(educatedUnemployment),
        uneducatedUnemployment: Number(uneducatedUnemployment),
        percentageChange,
      },
    });
  
    return {
      success: true,
      message: "Data berhasil diupdate",
      data: updated,
    };
  }
  