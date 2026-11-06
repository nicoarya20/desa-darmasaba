'use client'

import colors from "@/con/colors";
import { ActionIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTransitionRouter } from 'next-view-transitions';

/** Label pembaca layar untuk tombol ikon kembali (tombol tanpa teks wajib punya nama aksesibel). */
export const BACK_BUTTON_LABEL = "Kembali ke halaman sebelumnya";

/** Tombol ikon kembali ke halaman sebelumnya, dipakai di banyak halaman publik. */
export default function BackButton() {
    const router = useTransitionRouter()
    return (
        <ActionIcon
            bg={colors["blue-button"]}
            onClick={() => router.back()}
            aria-label={BACK_BUTTON_LABEL}
            title={BACK_BUTTON_LABEL}
        >
            <IconArrowLeft aria-hidden />
        </ActionIcon>
    );
}