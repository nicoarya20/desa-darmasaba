/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function VisimisiDesa() {
    const state = useProxy(stateProfileDesa.visiMisiDesa)

    useEffect(() => {
        state.findUnique.load("edit")
    }, [])

    const { data, loading } = state.findUnique

    if (loading || !data) {
        return (
            <Box py={10}>
                <Skeleton h={500} />
            </Box>
        )
    }
    return (
        <>
            <Box pb={30}>
                <Stack align='center' gap={0}>
                    <Box pb={30}>
                        <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                    </Box>
                    <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                        <Text c={colors['blue-button']} ta={"center"} fw={"lighter"} fz={"2.5rem"}>Visi Desa</Text>
                        <Text fz={"1.5rem"} ta={"center"} fw={"bold"} dangerouslySetInnerHTML={{ __html: data.visi }} />
                    </Paper>
                    <Paper my={20} p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                        <Text c={colors['blue-button']} ta={"center"} fw={"lighter"} fz={"2.5rem"}>Misi Desa</Text>
                        <Box>
                            <Text fz={"1.5rem"} fw={"bold"} dangerouslySetInnerHTML={{ __html: data.misi }} />
                        </Box>
                    </Paper>
                </Stack>
            </Box >
        </>
    );
}

export default VisimisiDesa;
