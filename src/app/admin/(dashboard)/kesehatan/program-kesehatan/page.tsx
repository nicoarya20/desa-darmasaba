'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import JudulList from '../../_com/judulList';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import programKesehatan from '../../_state/kesehatan/program-kesehatan/programKesehatan';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';

function ProgramKesehatan() {
  return (
    <Box>
      <HeaderSearch
        title='ProgramKesehatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListProgramKesehatan />
    </Box>
  );
}

function ListProgramKesehatan() {
  const programKesehatanState = useProxy(programKesehatan)
  const router = useRouter()

  useShallowEffect(() => {
    programKesehatanState.findMany.load()
  }, [])

  if (!programKesehatanState.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List Program Kesehatan'
            href='/admin/kesehatan/program-kesehatan/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh w={250}>Judul</TableTh>
                  <TableTh w={250}>Deskripsi Singkat</TableTh>
                  <TableTh w={250}>Image</TableTh>
                  <TableTh w={200}>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {programKesehatanState.findMany.data?.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>{item.deskripsiSingkat}</TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="image" />
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/kesehatan/program-kesehatan/${item.id}`)}>
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

export default ProgramKesehatan;
