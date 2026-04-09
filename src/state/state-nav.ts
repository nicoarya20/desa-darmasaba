import { proxy } from "valtio"
import type { MenuItem } from "../../types/menu-item"

const stateNav = proxy<{
    hover: boolean,
    item: MenuItem[] | null
    isSearch: boolean,
    clear: () => void,
    module: string | null,
    mobileOpen: boolean
}>({
    hover: false,
    item: null,
    isSearch: false,
    clear: () => {
        stateNav.hover = false
        stateNav.item = null
        stateNav.isSearch = false
    },
    module: null,
    mobileOpen: false
})

export default stateNav