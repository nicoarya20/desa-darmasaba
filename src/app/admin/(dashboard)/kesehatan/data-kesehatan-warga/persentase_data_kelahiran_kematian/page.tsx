/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { ActionIcon, Badge, Box, Center, Flex, Tooltip as MantineTooltip, Paper, Select, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBabyCarriage, IconGrave2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';


type TooltipPayload = {
 name: string;
 value: number;
 payload: any;
 color: string;
 dataKey: string;
};


type CustomTooltipProps = TooltipProps<number, string> & {
 active?: boolean;
 payload?: TooltipPayload[];
 label?: string;
};


function PersentaseDataKelahiranKematian() {
 return (
   <Stack gap="md">
     <GrafikPersentaseKelahiranKematian />
   </Stack>
 );
}


function GrafikPersentaseKelahiranKematian() {
 const router = useRouter();


 type DataTahunan = {
   tahun: string;
   totalKelahiran: number;
   totalKematian: number;
   data: Array<{
     id: string;
     bulan: string;
     kelahiran: number;
     kematian: number;
   }>;
 };


 // ✅ Fungsi hitung tahunan + bulanan
 const countByYearAndMonth = (kelahiran: any[], kematian: any[]): DataTahunan[] => {
   const dataTahunan: Record<string, DataTahunan> = {};


   const namaBulan = [
     'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
   ];


   // Proses kelahiran
   kelahiran?.forEach((item: any) => {
     const date = new Date(item.tanggal);
     const tahun = date.getFullYear().toString();
     const bulanIndex = date.getMonth();


     if (!dataTahunan[tahun]) {
       dataTahunan[tahun] = {
         tahun,
         totalKelahiran: 0,
         totalKematian: 0,
         data: namaBulan.map((nama, idx) => ({
           id: `${tahun}-${idx + 1}`,
           bulan: nama,
           kelahiran: 0,
           kematian: 0
         }))
       };
     }


     dataTahunan[tahun].totalKelahiran += 1;
     dataTahunan[tahun].data[bulanIndex].kelahiran += 1;
   });


   // Proses kematian
   kematian?.forEach((item: any) => {
     const date = new Date(item.tanggal);
     const tahun = date.getFullYear().toString();
     const bulanIndex = date.getMonth();


     if (!dataTahunan[tahun]) {
       dataTahunan[tahun] = {
         tahun,
         totalKelahiran: 0,
         totalKematian: 0,
         data: namaBulan.map((nama, idx) => ({
           id: `${tahun}-${idx + 1}`,
           bulan: nama,
           kelahiran: 0,
           kematian: 0
         }))
       };
     }


     dataTahunan[tahun].totalKematian += 1;
     dataTahunan[tahun].data[bulanIndex].kematian += 1;
   });


   return Object.values(dataTahunan).sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));
 };


 const statePersentase = useProxy(persentasekelahiran);
 const [chartData, setChartData] = useState<DataTahunan[]>([]);
 const [selectedYear, setSelectedYear] = useState<string | null>(null);


 const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);


 const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
   if (active && payload && payload.length) {
     return (
       <Paper p="sm" shadow="md" withBorder radius="md">
         <Text size="sm" fw={600}>Tahun {label}</Text>
         <Text size="sm" c="blue.6">Kelahiran: {formatNumber(payload[0].value)}</Text>
         <Text size="sm" c="red.6">Kematian: {formatNumber(payload[1].value)}</Text>
       </Paper>
     );
   }
   return null;
 };


 useShallowEffect(() => {
   statePersentase.kelahiran.findMany.load(1, 1000);
   statePersentase.kematian.findMany.load(1, 1000);
 }, []);


 useEffect(() => {
   if (statePersentase.kelahiran.findMany.data && statePersentase.kematian.findMany.data) {
     const hasil = countByYearAndMonth(
       statePersentase.kelahiran.findMany.data,
       statePersentase.kematian.findMany.data
     );


     setChartData(hasil);
     setSelectedYear(hasil[0]?.tahun || null);
   }
 }, [statePersentase.kelahiran.findMany.data, statePersentase.kematian.findMany.data]);


 if (!statePersentase.kelahiran.findMany.data || !statePersentase.kematian.findMany.data) {
   return <Skeleton h={400} radius="lg" />;
 }


 const selectedYearData = chartData.find(d => d.tahun === selectedYear);


 return (
   <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
     <Stack gap="lg">
       <Flex justify="space-between" align="center">
         <Title order={3} fw={700}>Statistik Kelahiran & Kematian</Title>
         <Flex gap="sm">
           <MantineTooltip label="Tambah Data Kelahiran" withArrow>
             <ActionIcon size="lg" radius="xl" color="blue.6" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran')}>
               <IconBabyCarriage size={22} />
             </ActionIcon>
           </MantineTooltip>
           <MantineTooltip label="Tambah Data Kematian" withArrow>
             <ActionIcon size="lg" radius="xl" color="red.6" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian')}>
               <IconGrave2 size={22} />
             </ActionIcon>
           </MantineTooltip>
         </Flex>
       </Flex>


       {chartData.length === 0 ? (
         <Center py="xl">
           <Text c="dimmed" fs="italic">Belum ada data untuk ditampilkan</Text>
         </Center>
       ) : (
         <>
           <Box maw={220}>
             <Select
               label="Pilih Tahun"
               placeholder="Pilih tahun data"
               data={chartData.map((item) => ({ value: item.tahun, label: item.tahun }))}
               value={selectedYear}
               onChange={(value) => setSelectedYear(value || null)}
               size="sm"
               radius="md"
             />
           </Box>


           <Box h={360}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                 <XAxis dataKey="tahun" />
                 <YAxis />
                 <Tooltip content={<CustomTooltip />} />
                 <Legend />
                 <Bar dataKey="totalKelahiran" name="Kelahiran" fill="#4dabf7" radius={[6, 6, 0, 0]} />
                 <Bar dataKey="totalKematian" name="Kematian" fill="#f03e3e" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </Box>


           {selectedYearData && (
             <Box>
               <Flex align="center" gap="sm" mb="md">
                 <Title order={4} fw={600}>Rincian Tahun {selectedYear}</Title>
                 <Badge variant="light" color="blue">{formatNumber(selectedYearData.totalKelahiran)} kelahiran</Badge>
                 <Badge variant="light" color="red">{formatNumber(selectedYearData.totalKematian)} kematian</Badge>
               </Flex>
               <Table striped withTableBorder highlightOnHover>
                 <Table.Thead>
                   <Table.Tr>
                     <Table.Th>Bulan</Table.Th>
                     <Table.Th ta="right">Kelahiran</Table.Th>
                     <Table.Th ta="right">Kematian</Table.Th>
                   </Table.Tr>
                 </Table.Thead>
                 <Table.Tbody>
                   {selectedYearData.data.length > 0 ? (
                     <>
                       {selectedYearData.data.map((item) => (
                         <Table.Tr key={item.id}>
                           <Table.Td>{item.bulan}</Table.Td>
                           <Table.Td ta="right">{formatNumber(item.kelahiran)}</Table.Td>
                           <Table.Td ta="right">{formatNumber(item.kematian)}</Table.Td>
                         </Table.Tr>
                       ))}
                       <Table.Tr style={{ fontWeight: 'bold' }}>
                         <Table.Td>Total</Table.Td>
                         <Table.Td ta="right">{formatNumber(selectedYearData.totalKelahiran)}</Table.Td>
                         <Table.Td ta="right">{formatNumber(selectedYearData.totalKematian)}</Table.Td>
                       </Table.Tr>
                     </>
                   ) : (
                     <Table.Tr>
                       <Table.Td colSpan={3} ta="center" c="dimmed">Tidak ada rincian bulanan</Table.Td>
                     </Table.Tr>
                   )}
                 </Table.Tbody>
               </Table>
             </Box>
           )}
         </>
       )}
     </Stack>
   </Paper>
 );
}


export default PersentaseDataKelahiranKematian;