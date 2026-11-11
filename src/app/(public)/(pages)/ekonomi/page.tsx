import { Stack } from "@mantine/core";

export default async function Page({ params }: { params: Promise<{ sub: string }> }) {
    const { sub } = await params
    return <Stack>
        {sub}
    </Stack>
}