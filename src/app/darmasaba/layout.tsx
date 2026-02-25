"use client";

import colors from "@/con/colors";
import { Box, Space, Stack } from "@mantine/core";

import { Navbar } from "@/app/darmasaba/_com/Navbar";
import Footer from "./_com/Footer";


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
            <Stack gap={0} bg={colors.grey[1]}>
                <Navbar />
                <Space h={{
                    base: "3.9rem",
                    md: "2.5rem"
                }} />
                <Box style={{
                    overflow: "scroll"
                }}>
                    {children}
                </Box>
                <Footer />
            </Stack>
    )
}