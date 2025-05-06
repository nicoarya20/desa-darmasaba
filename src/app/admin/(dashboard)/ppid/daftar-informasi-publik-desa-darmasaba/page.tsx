'use client'
import { Box, Button, Group, SimpleGrid, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, TextInput, Title } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateDaftarInformasiPublik from '../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import { PPIDEditor } from '../_com/ppid_Editor';
import colors from '@/con/colors';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const daftarInformasi = useProxy(stateDaftarInformasiPublik.daftarInformasi)
  const submit = () => {
    if (daftarInformasi.create.form.jenisInformasi &&
      daftarInformasi.create.form.deskripsi &&
      daftarInformasi.create.form.tanggal) {
      daftarInformasi.create.create()
    }
  }
  return (
    <Box>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Stack gap={"xs"}>
            <Title fw={"bold"} order={3}>Daftar Informasi Publik Desa Darmasaba</Title>
            <TextInput
              label="Jenis Informasi"
              placeholder="masukkan jenis informasi"
              onChange={(val) => {
                daftarInformasi.create.form.jenisInformasi = val.target.value
              }}
            />
            <PPIDEditor
              showSubmit={false}
              onChange={(val) => {
                daftarInformasi.create.form.deskripsi = val
              }}
            />
            <TextInput
              label="Tanggal Publikasi"
              placeholder="masukkan tanggal publikasi"
              onChange={(val) => {
                daftarInformasi.create.form.tanggal = val.target.value
              }}
            />
            <Group>
              <Button
              bg={colors['blue-button']}
                onClick={submit}
              >Submit</Button>
            </Group>
          </Stack>
        </Box>
        <Box>
          <ListDaftarInformasi />
        </Box>
      </SimpleGrid>
    </Box>
  );
}

function ListDaftarInformasi() {
  const listData = useProxy(stateDaftarInformasiPublik.daftarInformasi)
  useShallowEffect(() => {
    listData.findMany.load()
  }, [])
  if (!listData.findMany.data) return <Stack>
    {Array.from({length: 10}).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return  <Stack gap={"xs"}>
  <Title fw={"bold"} order={3}>List Daftar Informasi Publik Desa Darmasaba</Title>
  <Table
    suppressHydrationWarning
    striped
    highlightOnHover
    withTableBorder
    withColumnBorders
    bg={colors['white-1']}
  >
    <TableThead>
      <TableTr>
        <TableTh>
          No
        </TableTh>
        <TableTh>
          Jenis Informasi
        </TableTh>
        <TableTh>
          Deskripsi
        </TableTh>
        <TableTh>
          Tanggal Publikasi
        </TableTh>
      </TableTr>
    </TableThead>
    <TableTbody>
      {listData.findMany.data?.map((item) => (
        <TableTr key={item.id}>
          <TableTd>{item.nomor}</TableTd>
          <TableTd>{item.jenisInformasi}</TableTd>
          <TableTd dangerouslySetInnerHTML={{ __html: item.deskripsi }}></TableTd>
          <TableTd>{item.tanggal}</TableTd>
        </TableTr>
      ))}
    </TableTbody>
  </Table>
</Stack>
}

export default Page;
