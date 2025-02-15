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



})();