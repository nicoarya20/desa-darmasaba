import { proxy } from "valtio"

const stateNav = proxy<{
    /** id menu desktop yang flyout-nya sedang terbuka (null = tertutup) */
    openMenuId: string | null
    isSearch: boolean,
    clear: () => void,
    module: string | null,
    mobileOpen: boolean
}>({
    openMenuId: null,
    isSearch: false,
    clear: () => {
        stateNav.openMenuId = null
        stateNav.isSearch = false
    },
    module: null,
    mobileOpen: false
})

export default stateNav
