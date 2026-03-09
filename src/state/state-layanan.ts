/**
 * DEPRECATED: File ini dipertahankan untuk backward compatibility.
 * Gunakan state management baru dari `@/state/admin/` atau `@/state/public/`
 */

import { proxy } from "valtio";

// Simple state untuk backward compatibility
type Layanan = {
    layanan: string | null
}

const stateLayanan = proxy<Layanan>({
    layanan: null
})

export default stateLayanan