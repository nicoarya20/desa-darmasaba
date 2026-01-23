// // import {v4} from 'uuid'

// import prisma from "@/lib/prisma";

// // console.log(v4())

// const listNama = [
//   { name: "Adi Pratama", phone: "081234567801" },
//   { name: "Budi Santoso", phone: "081234567802" },
//   { name: "Citra Lestari", phone: "081234567803" },
//   { name: "Dewi Anggraini", phone: "081234567804" },
//   { name: "Eka Putra", phone: "081234567805" },
//   { name: "Fajar Nugroho", phone: "081234567806" },
//   { name: "Gita Maharani", phone: "081234567807" },
//   { name: "Hadi Wijaya", phone: "081234567808" },
//   { name: "Indah Purnama", phone: "081234567809" },
//   { name: "Joko Susilo", phone: "081234567810" },
//   { name: "Kartika Sari", phone: "081234567811" },
//   { name: "Lukman Hakim", phone: "081234567812" },
//   { name: "Maya Fitriani", phone: "081234567813" },
//   { name: "Nanda Saputra", phone: "081234567814" },
//   { name: "Oka Mahendra", phone: "081234567815" },
//   { name: "Putri Ayu", phone: "081234567816" },
//   { name: "Rizky Kurniawan", phone: "081234567817" },
//   { name: "Sari Wulandari", phone: "081234567818" },
//   { name: "Taufik Hidayat", phone: "081234567819" },
//   { name: "Yoga Prasetya", phone: "081234567820" },
// ];

// (async () => {
//   for (const n of listNama) {
//     await prisma.percobaan.upsert({
//       create: {
//         nama: n.name,
//         phone: n.phone,
//       },
//       update: {
//         nama: n.name,
//       },
//       where: {
//         phone: n.phone,
//       },
//     });
//   }
// })()
//   .then(() => {
//     console.log("success");
//   })
//   .catch((e) => {
//     console.log(e);
//   });
