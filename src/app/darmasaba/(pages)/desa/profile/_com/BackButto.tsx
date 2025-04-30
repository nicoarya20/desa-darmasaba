'use client'

import colors from "@/con/colors";
import { ActionIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTransitionRouter } from 'next-view-transitions';

export default function BackButton() {
    const router = useTransitionRouter()
    return (
        <ActionIcon bg={colors["blue-button"]} onClick={() => router.back()}>
            <IconArrowLeft />
        </ActionIcon>
    );
}