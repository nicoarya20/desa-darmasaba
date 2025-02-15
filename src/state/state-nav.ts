import { proxy } from "valtio"
import { MenuItem } from "../../types/menu-item"

const stateNav = proxy<{
    hover: boolean,
    item: MenuItem[] | null
    isSearch: boolean,
    clear: () => void,
    module: string | null
}>({
    hover: false,
    item: null,
    isSearch: false,
    clear: () => {
        stateNav.hover = false
        stateNav.item = null
        stateNav.isSearch = false
    },
    module: null
})

export default stateNav