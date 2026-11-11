import { proxy } from "valtio"

/**
 * Mode baca suara (aksesibilitas): saat aktif, teks yang diarahkan kursor / diketuk dibacakan.
 * Dibagi antara tombol navbar desktop & mobile (keduanya ter-mount, hanya disembunyikan CSS).
 */
const stateHoverSpeech = proxy<{ active: boolean }>({ active: false })

export default stateHoverSpeech
