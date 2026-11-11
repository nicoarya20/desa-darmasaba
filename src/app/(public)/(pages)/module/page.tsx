'use client'

import { Stack } from "@mantine/core"
import { useSnapshot } from "valtio"
import stateNav from "@/state/state-nav"

export default function Page() {
    const { module, isSearch } = useSnapshot(stateNav)

    return (
        <Stack h={"100vh"} >
            {JSON.stringify({ module, isSearch })}
        </Stack>
    )
}