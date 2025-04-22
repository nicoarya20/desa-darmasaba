import layanan from './data/list-layanan.json'
import potensi from './data/list-potensi.json'
import katagoryBerita from './data/katagory-berita.json'
import categoryPengumuman from './data/category-pengumuman.json'
import prisma from '@/lib/prisma';
(async () => {
    for (const l of layanan) {
        await prisma.layanan.upsert({
            where: {
                name: l.name
            },
            update: {
                name: l.name
            },
            create: {
                name: l.name
            }
        })
    }

    console.log("layanan success ...")

    for (const p of potensi) {
        await prisma.potensi.upsert({
            where: {
                name: p.name
            },
            update: {
                name: p.name
            },
            create: {
                name: p.name
            }
        })
    }

    console.log("potensi success ...")

    for (const k of katagoryBerita) {
        await prisma.katagoryBerita.upsert({
            where: {
                name: k.name
            },
            update: {
                name: k.name
            },
            create: {
                name: k.name
            }
        })
    }

    console.log("katagory berita success ...")

    for (const c of categoryPengumuman) {
        await prisma.categoryPengumuman.upsert({
            where: {
                name: c.name
            },
            update: {
                name: c.name
            },
            create: {
                name: c.name
            }
        })
    }

    console.log("category pengumuman success ...")
})().then(() => prisma.$disconnect()).catch((e) => {
    console.error(e)
    prisma.$disconnect()
});

process.on('exit', () => {
    prisma.$disconnect()
})

process.on('SIGINT', () => {
    prisma.$disconnect()
    process.exit(0)
})