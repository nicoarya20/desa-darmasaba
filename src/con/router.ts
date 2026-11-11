

const pages = {
    "home": "/",
    "darmasaba": {
        "home": "/",
        "desa": "/pemerintahan",
        "ekonomi": "/ekonomi",
        "keamanan": "/keamanan",
        "kesehatan": "/kesehatan",
        "inovasi": "/inovasi",
        "lingkungan": "/lingkungan",
        "pendidikan": "/pendidikan",
        "module": {
            "daves": "/module/daves",
            "mangan": "/module/mangan",
            "bicara-darma": "/module/bicara-darma",
            "bares": "/module/bares",
            "sajjana-dharma-raksaka": "/module/sajjana-dharma-raksaka",
            "pdkt": "/module/pdkt",
            "gelah-melah": "/module/gelah-melah",
            "inovasi-desa-darmasaba": "/module/inovasi-desa-darmasaba"
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