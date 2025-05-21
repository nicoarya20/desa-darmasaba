import { Box, Paper, Stack, Table, TableTbody, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import colors from '@/con/colors';
import React from 'react';

function ListKeamananLingkungan() {
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'} radius={10}>
        <Stack gap={'xs'}>
          <Title order={3}>List Keamanan Lingkungan</Title>
          <Box>
            <Table striped withTableBorder withColumnBorders withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Image</TableTh>
                  <TableTh>Nama Keamanan Lingkungan</TableTh>
                  <TableTh>Deskripsi Keamanan Lingkungan</TableTh>
                  <TableTh>Aksi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ListKeamananLingkungan;
