'use client'

import { ActionIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTransitionRouter } from 'next-view-transitions';

export default function BackButton() {
    const router = useTransitionRouter()
    return (
        <ActionIcon variant="transparent" onClick={() => router.back()}>
            <IconArrowLeft />
        </ActionIcon>
    );
}