import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import colors from '@/con/colors';
import { Center, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import _ from 'lodash';
import { useProxy } from 'valtio/utils';

function DokterdanTenagaMedisList() {
  const kesehatanState = useProxy(stateFasilitasKesehatan.dokterdantenagamedis);
  
  useShallowEffect(() => {
    kesehatanState.findMany.load();
  }, []);

  // Penanganan kasus ketika tidak ada data
  if (_.isEmpty(kesehatanState.findMany.data)) {
    return (
      <Stack>
        <Table
          striped 
          highlightOnHover 
          withTableBorder 
          withColumnBorders
          bg={colors['white-1']}
        >
          <TableThead>
            <TableTr>
              <TableTh>
                <Center>Nama</Center>
              </TableTh>
              <TableTh>
                <Center>Specialist</Center>
              </TableTh>
              <TableTh >
                <Center>Jadwal</Center>
              </TableTh>
            </TableTr>
          </TableThead>
          <TableTbody >
            <TableTr >
              <TableTd  colSpan={3}>
                <Center>
                  <Text>Tidak ada data</Text>
                </Center>
              </TableTd>
            </TableTr>
          </TableTbody> 
        </Table>
      </Stack>
    );
  }

  return (
    <Stack>
      <Table     
        striped 
        highlightOnHover 
        withTableBorder 
        withColumnBorders
        bg={colors['white-1']}
      >
        <TableThead >
          <TableTr >
            <TableTh >
              <Center>Nama</Center>
            </TableTh>
            <TableTh >
              <Center>Specialist</Center>
            </TableTh>
            <TableTh >
              <Center>Jadwal</Center>
            </TableTh>
          </TableTr>
        </TableThead>
        <TableTbody >
          {kesehatanState.findMany.data?.map((item) => (
            <TableTr  key={item.id}>
              <TableTd  ta="center">{item.name}</TableTd>
              <TableTd  ta="center">Specialist {item.specialist}</TableTd>
              <TableTd  ta="center">{item.jadwal}</TableTd>
            </TableTr>
          ))}
        </TableTbody> 
      </Table>
    </Stack>
  );
}

export default DokterdanTenagaMedisList;