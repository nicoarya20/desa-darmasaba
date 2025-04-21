import layanan from './data/list-layanan.json'
import potensi from './data/list-potensi.json'
import prisma from '@/lib/prisma';
; (async () => {
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

    // for (const lpl of ) {
    //     await prisma.landingPage_Layanan.upsert({
    //         where: {
    //             id: lpl.id
    //         },
    //         update: {
    //             deksripsi: lpl.deksripsi
    //         },
    //         create: {
    //             deksripsi: lpl.deksripsi
    //         }
    //     })
    // }

    // console.log("landing page success ...")
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