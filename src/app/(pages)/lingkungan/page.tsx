import { Stack } from "@mantine/core";

export default function Page({ params }: { params: { sub: string } }) {
    return <Stack>
        {params.sub}
    </Stack>
}