/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import {
 Box,
 Button,
 Group,
 Paper,
 Stack,
 TextInput,
 Title,
 Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditKelahiran() {
 const editState = useProxy(persentaseKelahiranKematian.kelahiran);
 const router = useRouter();
 const params = useParams();


 const [formData, setFormData] = useState({
   nama: editState.edit.form.nama || '',
   tanggal: editState.edit.form.tanggal || '',
   jenisKelamin: editState.edit.form.jenisKelamin || '',
   alamat: editState.edit.form.alamat || '',
 });


 useEffect(() => {
   const loadKelahiran = async () => {
     const id = params?.id as string;
     if (!id) return;


     try {
       const data = await editState.edit.load(id);
       if (data) {
         setFormData({
           nama: data.nama || '',
           tanggal: data.tanggal || '',
           jenisKelamin: data.jenisKelamin || '',
           alamat: data.alamat || '',
         });
       }
     } catch (error) {
       console.error('Error loading data kelahiran:', error);
       toast.error('Gagal memuat data kelahiran');
     }
   };


   loadKelahiran();
 }, [params?.id]);


 const handleSubmit = async () => {
   try {
     editState.edit.form = {
       ...editState.edit.form,
       nama: formData.nama,
       tanggal: formData.tanggal,
       jenisKelamin: formData.jenisKelamin,
       alamat: formData.alamat,
     };


     await editState.edit.update();
     toast.success('Data kelahiran berhasil diperbarui!');
     router.push(
       '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran'
     );
   } catch (error) {
     console.error('Error updating data kelahiran:', error);
     toast.error('Terjadi kesalahan saat memperbarui data kelahiran');
   }
 };


 return (
   <Box px={{ base: 'sm', md: 'lg' }} py="md">
     {/* Header */}
     <Group mb="md">
       <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
         <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
           <IconArrowBack color={colors['blue-button']} size={24} />
         </Button>
       </Tooltip>
       <Title order={4} ml="sm" c="dark">
         Edit Data Kelahiran
       </Title>
     </Group>


     {/* Form */}
     <Paper
       w={{ base: '100%', md: '50%' }}
       bg={colors['white-1']}
       p="lg"
       radius="md"
       shadow="sm"
       style={{ border: '1px solid #e0e0e0' }}
     >
       <Stack gap="md">
         <TextInput
           value={formData.nama}
           onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
           label="Nama"
           placeholder="Masukkan nama"
           required
         />
         <TextInput
           type="date"
           value={formData.tanggal}
           onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
           label="Tanggal"
           placeholder="Masukkan tanggal"
           required
         />
         <TextInput
           value={formData.jenisKelamin}
           onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
           label="Jenis Kelamin"
           placeholder="Masukkan jenis kelamin"
           required
         />
         <TextInput
           value={formData.alamat}
           onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
           label="Alamat"
           placeholder="Masukkan alamat"
           required
         />


         <Group justify="right">
           <Button
             onClick={handleSubmit}
             radius="md"
             size="md"
             style={{
               background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
               color: '#fff',
               boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
             }}
           >
             Simpan
           </Button>
         </Group>
       </Stack>
     </Paper>
   </Box>
 );
}


export default EditKelahiran;