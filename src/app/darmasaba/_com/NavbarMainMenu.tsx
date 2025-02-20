'use client'

import colors from "@/con/colors"
import stateNav from "@/state/state-nav"
import { ActionIcon, Button, Container, Flex, Image, Stack } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { useTransitionRouter } from 'next-view-transitions'
import { useSnapshot } from "valtio"
import { MenuItem } from "../../../../types/menu-item"
import { NavbarSearch } from "./NavBarSearch"
import { NavbarSubMenu } from "./NavbarSubMenu"
import { IconSearch } from "@tabler/icons-react"

export function NavbarMainMenu({ listNavbar }: {
    listNavbar: MenuItem[]
}) {
    const { item, isSearch } = useSnapshot(stateNav)
    const router = useTransitionRouter()
    return <Stack gap={0} visibleFrom="sm" bg={colors["white-trans-1"]}>
        <Container pos={"relative"} w={{
            base: '100%',
            md: '80%',
        }} fluid>
            <Flex align={"center"} justify={"space-between"} wrap={{
                base: "wrap",
                md: "nowrap"
            }}>
                <ActionIcon radius={"100"} onClick={() => {
                    router.push("/darmasaba")
                    stateNav.clear()
                }} >
                    <Image radius={"100"} src={"/assets/images/darmasaba-icon.png"} alt="icon" w={24} h={24} loading="lazy" />
                </ActionIcon>
                {listNavbar.map((item, k) => {
                    return <MenuItemCom key={k} item={item} />
                })}
                <ActionIcon variant="transparent" c={isSearch ? 'grey' : colors["blue-button"]}
                    onClick={() => {
                        stateNav.item = null
                        stateNav.isSearch = !stateNav.isSearch
                    }}
                >
                    {/* TODO: add icon search */}
                    <IconSearch size={"1.5rem"} />
                </ActionIcon>
            </Flex>
        </Container>
        {item && <NavbarSubMenu item={item as MenuItem[]} />}
        {isSearch && <NavbarSearch />}
    </Stack>

}

function MenuItemCom({ item, }: { item: MenuItem }) {
    const { ref, hovered } = useHover()
    const router = useTransitionRouter()

    return <Button
        ref={ref}
        color={hovered ? "grey" : colors["blue-button"]}
        onMouseEnter={() => {
            stateNav.item = item.children || null
            stateNav.isSearch = false
        }}
        variant="transparent"
        onClick={() => {
            router.push(item.href)
            stateNav.clear()
        }}
    >{item.name}</Button>
}