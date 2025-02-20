import stateNav from "@/state/state-nav";
import { Container, Stack, TextInput } from "@mantine/core";

export function NavbarSearch() {
    return <Container w={{
        base: '100%',
        md: '80%',
    }} fluid py={"xl"}
        onMouseLeave={stateNav.clear}
    >
        <Stack pt={"xl"}>
            <TextInput
                autoFocus
                styles={{
                    input: {
                        borderRadius: "xl",
                        color: "black",
                        // backgroundColor: "rgba(255, 255, 255, 0.3)"
                    }
                }} size="lg" variant="transparent" placeholder="Cari" />
        </Stack>
    </Container>
}