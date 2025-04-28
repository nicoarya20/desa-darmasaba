import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import colors from '@/con/colors';
import { Center, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import _ from 'lodash';
import { useProxy } from 'valtio/utils';

function TarifDanLayananList() {
  const tarifdanlayanan = useProxy(stateFasilitasKesehatan.tarifdanlayanan)
  useShallowEffect(() => {
    tarifdanlayanan.findMany.load()
  }, [])
  
  if (_.isEmpty(tarifdanlayanan.findMany.data)) {
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

  return <Stack>
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
            Layanan
          </TableTh>
          <TableTh>
            Tarif
          </TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>
        {tarifdanlayanan.findMany.data?.map((item) => (
          <TableTr key={item.id}>
            <TableTd>{item.layanan}</TableTd>
            <TableTd>Rp.{item.tarif}</TableTd>
          </TableTr>
        ))}
      </TableTbody>
    </Table>
  </Stack>
}

export default TarifDanLayananList;
