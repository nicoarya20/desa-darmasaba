import colors from '@/con/colors';
import { Box, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import React from 'react';

function Page() {
  return (
    <Box py={5}>
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Title order={3}>Ajukan Ide Inovatif</Title>
        <Box>
          <Table striped withRowBorders withColumnBorders withTableBorder>
            <TableThead>
              <TableTr>
                <TableTh>No</TableTh>
                <TableTh>Nama</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Nama Ide Inovatif</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Masalah yang ingin diatasi</TableTh>
                <TableTh>Benefit</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              
                <TableTr>
                  <TableTd>1</TableTd>
                  <TableTd>nama</TableTd>
                  <TableTd>alamat</TableTd>
                  <TableTd>ide inovatif</TableTd>
                  <TableTd>deskripsi</TableTd>
                  <TableTd>masalah</TableTd>
                  <TableTd>benefit</TableTd>
                </TableTr>
              
            </TableTbody>
          </Table> </Box>
      </Stack>
    </Paper>
  </Box>
  );
}

export default Page;
