

const pages = {
    "home": "/",
    "darmasaba": {
        "home": "/daramasaba",
        "desa": "/darmasaba/desa",
        "ekonomi": "/darmasaba/ekonomi",
        "keamanan": "/darmasaba/keamanan",
        "kesehatan": "/darmasaba/kesehatan",
        "inovasi": "/darmasaba/inovasi",
        "lingkungan": "/darmasaba/lingkungan",
        "pendidikan": "/darmasaba/pendidikan",
        "module": {
            "daves": "/darmasaba/module/daves",
            "mangan": "/darmasaba/module/mangan",
            "bicara-darma": "/darmasaba/module/bicara-darma",
            "bares": "/darmasaba/module/bares",
            "sajjana-dharma-raksaka": "/darmasaba/module/sajjana-dharma-raksaka",
            "pdkt": "/darmasaba/module/pdkt",
            "gelah-melah": "/darmasaba/module/gelah-melah",
            "inovasi-desa-darmasaba": "/darmasaba/module/inovasi-desa-darmasaba"
        }
    },


}


const apies = {
    "/api": "home",
    "/api/about": "about",
    "/api/contact": "contact",
}

const router = {
    pages,
    apies
} as const
export default router