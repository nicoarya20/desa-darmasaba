'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, Image, Skeleton, Group, Tooltip } from '@mantine/core';
import { IconArrowBack, IconTrash, IconEdit } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import posyanduState from '../../../_state/kesehatan/posyandu/posyandu';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';


function DetailPosyandu() {
 const statePosyandu = useProxy(posyanduState);
 const params = useParams();
 const router = useRouter();
 const [modalHapus, setModalHapus] = useState(false);
 const [selectedId, setSelectedId] = useState<string | null>(null);


 useShallowEffect(() => {
   statePosyandu.findUnique.load(params?.id as string);
 }, []);


 const handleHapus = () => {
   if (selectedId) {
     statePosyandu.delete.byId(selectedId);
     setModalHapus(false);
     setSelectedId(null);
     router.push("/admin/kesehatan/posyandu");
   }
 };


 if (!statePosyandu.findUnique.data) {
   return (
     <Stack py={10}>
       <Skeleton height={500} radius="md" />
     </Stack>
   );
 }


 const data = statePosyandu.findUnique.data;


 return (
   <Box py={10}>
     {/* Tombol kembali */}
     <Button
       variant="subtle"
       onClick={() => router.back()}
       leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
       mb={15}
     >
       Kembali
     </Button>


     {/* Card utama */}
     <Paper
       withBorder
       w={{ base: "100%", md: "60%" }}
       bg={colors['white-1']}
       p="lg"
       radius="md"
       shadow="sm"
     >
       <Stack gap="md">
         <Text fz="2xl" fw="bold" c={colors['blue-button']}>
           Detail Posyandu
         </Text>


         <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
           <Stack gap="sm">
             <Box>
               <Text fz="lg" fw="bold">Nama Posyandu</Text>
               <Text fz="md" c="dimmed">{data.name || '-'}</Text>
             </Box>


             <Box>
               <Text fz="lg" fw="bold">Nomor Posyandu</Text>
               <Text fz="md" c="dimmed">{data.nomor || '-'}</Text>
             </Box>


             <Box>
               <Text fz="lg" fw="bold">Deskripsi</Text>
               <Text
                 fz="md"
                 c="dimmed"
                 dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
               />
             </Box>


             <Box>
               <Text fz="lg" fw="bold">Jadwal Pelayanan</Text>
               <Text
                 fz="md"
                 c="dimmed"
                 dangerouslySetInnerHTML={{ __html: data.jadwalPelayanan || '-' }}
               />
             </Box>


             <Box>
               <Text fz="lg" fw="bold">Gambar</Text>
               {data.image?.link ? (
                 <Image
                   src={data.image.link}
                   alt={data.name || 'Gambar Posyandu'}
                   w={200}
                   h={200}
                   radius="md"
                   fit="cover"
                   loading="lazy"
                 />
               ) : (
                 <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
               )}
             </Box>


             {/* Aksi */}
             <Group gap="sm">
               <Tooltip label="Hapus Posyandu" withArrow position="top">
                 <Button
                   color="red"
                   onClick={() => {
                     setSelectedId(data.id);
                     setModalHapus(true);
                   }}
                   variant="light"
                   radius="md"
                   size="md"
                 >
                   <IconTrash size={20} />
                 </Button>
               </Tooltip>


               <Tooltip label="Edit Posyandu" withArrow position="top">
                 <Button
                   color="green"
                   onClick={() => router.push(`/admin/kesehatan/posyandu/${data.id}/edit`)}
                   variant="light"
                   radius="md"
                   size="md"
                 >
                   <IconEdit size={20} />
                 </Button>
               </Tooltip>
             </Group>
           </Stack>
         </Paper>
       </Stack>
     </Paper>


     {/* Modal konfirmasi hapus */}
     <ModalKonfirmasiHapus
       opened={modalHapus}
       onClose={() => setModalHapus(false)}
       onConfirm={handleHapus}
       text="Apakah Anda yakin ingin menghapus posyandu ini?"
     />
   </Box>
 );
}


export default DetailPosyandu;