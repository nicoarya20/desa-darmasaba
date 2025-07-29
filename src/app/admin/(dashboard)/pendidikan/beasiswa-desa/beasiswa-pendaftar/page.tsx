/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import HeaderSearch from '../../../_com/header';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import beasiswaDesaState from '../../../_state/pendidikan/beasiswa-desa';


function BeasiswaPendaftar() {
    const [search, setSearch] = useState('');
    return (
        <Box>
            <HeaderSearch
                title='Beasiswa Pendaftar'
                placeholder='pencarian'
                searchIcon={<IconSearch size={20} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <ListBeasiswaPendaftar search={search} />
        </Box>
    );
}

function ListBeasiswaPendaftar({ search }: { search: string }) {
    const listDataState = useProxy(beasiswaDesaState.beasiswaPendaftar)
    const router = useRouter();

    useEffect(() => {
        listDataState.findMany.load()
    }, [])

    const filteredData = (listDataState.findMany.data || []).filter(item => {
        const keyword = search.toLowerCase();
        return (
            item.namaLengkap.toLowerCase().includes(keyword) ||
            item.alamatKTP.toLowerCase().includes(keyword) ||
            (item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString() : '').toLowerCase().includes(keyword) ||
            item.jenisKelamin.toLowerCase().includes(keyword)
        );
    });

    if (!listDataState.findMany.data) {
        return (
            <Stack py={10}>
                <Skeleton h={500} />
            </Stack>
        )
    }
    return (
        <Box py={10}>
            <Paper bg={colors['white-1']} p="md">
                <Stack>
                    <Title order={4}>List Beasiswa Pendaftar</Title>
                    <Box style={{ overflowX: 'auto' }}>
                        <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
                            <TableThead>
                                <TableTr>
                                    <TableTh>No</TableTh>
                                    <TableTh>Nama Lengkap</TableTh>
                                    <TableTh>Alamat</TableTh>
                                    <TableTh>Tanggal Lahir</TableTh>
                                    <TableTh>Jenis Kelamin</TableTh>
                                    <TableTh>Detail</TableTh>
                                </TableTr>
                            </TableThead>
                            <TableTbody>
                                {filteredData.map((item, index) => (
                                    <TableTr key={item.id}>
                                        <TableTd>
                                            <Box w={100}>
                                                <Text truncate="end" fz={"sm"}>{index + 1}</Text>
                                            </Box>
                                        </TableTd>
                                    <TableTd>
                                        <Text truncate="end" fz={"sm"}>{item.namaLengkap}</Text>
                                    </TableTd>
                                    <TableTd>
                                        <Text truncate="end" fz={"sm"}>{item.alamatKTP}</Text>
                                    </TableTd>
                                    <TableTd>
                                        <Text truncate="end" fz={"sm"}>{item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString() : '-'}</Text>
                                    </TableTd>
                                    <TableTd>
                                        <Text truncate="end" fz={"sm"}>{item.jenisKelamin}</Text>
                                    </TableTd>
                                    <TableTd>
                                        <Button onClick={() => router.push(`/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar/${item.id}`)}>
                                            <IconDeviceImacCog size={25} />
                                        </Button>
                                    </TableTd>
                                </TableTr>
                            ))}
                            </TableTbody>   
                        </Table>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}

export default BeasiswaPendaftar;
