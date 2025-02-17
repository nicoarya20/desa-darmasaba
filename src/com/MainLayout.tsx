import colors from "@/con/colors";
import { Box, Space, Stack } from "@mantine/core";
import Footer from "./Footer";
import { Navbar } from "./Navbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Stack gap={0} bg={colors.grey[1]}>
            <Navbar />
            <Space h={{
                base: "2.2rem",
                md: "2.5rem"
            }} />
            <Box>
                {children}
            </Box>
            <Footer />
        </Stack>
    )
}