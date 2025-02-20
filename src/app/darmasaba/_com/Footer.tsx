
import colors from "@/con/colors";
import { Stack, Container, Center, Text } from "@mantine/core";

function Footer() {
    return <Stack bg={colors["blue-button"]} c={colors["white-trans-1"]}>
        <Container w={{ base: "100%", md: "80%" }} p={"xl"} h={720} >
            <Center>
                <Text fz={"3.4rem"}>Footer</Text>
            </Center>
        </Container>
    </Stack>
}

export default Footer;