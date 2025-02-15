import { Space, Stack } from "@mantine/core";
import { Navbar } from "./Navbar";
import Footer from "./Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Stack gap={0}>
            <Navbar />
            <Space h={{
                base: "2.2rem",
                md: "2.5rem"
            }} />
            {children}
            <Footer />
        </Stack>
    )
}