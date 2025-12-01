import { Box, Container, Divider, List, ListItem, Paper, Stack, Text, Title } from '@mantine/core';
import React from 'react';

function Page() {
  return (
    <Container size="md" py={40}>
      <Stack gap="xl">
        <Title order={1} size="h1" fw={700} c="blue.9">
          Syarat & Ketentuan Penggunaan Admin Desa Darmasaba
        </Title>

        <Paper p="lg" radius="md" withBorder bg="gray.0" style={{ borderLeft: '4px solid #1e3a5f' }}>
          <Text c="gray.8">
            Dengan menggunakan website <Text component="span" fw={600}>Admin Desa Darmasaba</Text> (&quot;Website&quot;),
            Anda setuju untuk mematuhi dan terikat oleh syarat dan ketentuan berikut. Jika Anda tidak setuju
            dengan ketentuan ini, harap jangan gunakan Website.
          </Text>
        </Paper>

        <Box>
          <Title order={2} size="h2" fw={700} c="blue.9" mb="md">
            1. Definisi
          </Title>
          <Text c="gray.7">
            <Text component="span" fw={600}>Admin Desa Darmasaba</Text> adalah website resmi untuk Admin Desa Darmasaba, yang bertujuan
            menambahkan, menghapus, dan mengedit konten desa ke dalam website.
          </Text>
        </Box>

        <Box>
          <Title order={2} size="h2" fw={700} c="blue.9" mb="md">
            2. Larangan Konten Tidak Pantas
          </Title>
          <Text c="gray.7" mb="md">
            Anda <Text component="span" fw={600}>dilarang keras</Text> menambahkan, menghapus, dan mengedit konten desa apa pun yang mengandung:
          </Text>
          <List spacing="xs" c="gray.7">
            <ListItem>Ujaran kebencian, diskriminasi, atau konten SARA (Suku, Agama, Ras, Antar-golongan)</ListItem>
            <ListItem>Pornografi, konten seksual eksplisit, atau gambar tidak senonoh</ListItem>
            <ListItem>Ancaman, pelecehan, bullying, atau perilaku melecehkan</ListItem>
            <ListItem>Informasi palsu, hoaks, spam, atau konten menyesatkan</ListItem>
            <ListItem>Konten ilegal, melanggar hukum, atau melanggar hak kekayaan intelektual pihak lain</ListItem>
            <ListItem>Promosi narkoba, perjudian, atau aktivitas ilegal lainnya</ListItem>
          </List>
        </Box>

        <Box>
          <Title order={2} size="h2" fw={700} c="blue.9" mb="md">
            3. Tanggung Jawab Pengguna
          </Title>
          <List spacing="xs" c="gray.7">
            <ListItem>Anda bertanggung jawab penuh atas setiap konten yang Anda unggah atau bagikan.</ListItem>
            <ListItem>Konten yang melanggar ketentuan ini dapat dihapus kapan saja tanpa pemberitahuan.</ListItem>
          </List>
        </Box>

        <Box>
          <Title order={2} size="h2" fw={700} c="blue.9" mb="md">
            4. Tindakan terhadap Pelanggaran
          </Title>
          <Text c="gray.7" mb="md">
            Jika kami menerima laporan atau menemukan konten yang melanggar ketentuan ini, kami akan:
          </Text>
          <List spacing="xs" c="gray.7">
            <ListItem>Segera menghapus konten tersebut</ListItem>
            <ListItem>Menghapus akun pengguna</ListItem>
            <ListItem>Dalam kasus berat, melaporkan ke pihak berwajib sesuai hukum yang berlaku</ListItem>
          </List>
        </Box>
        <Box>
          <Title order={2} size="h2" fw={700} c="blue.9" mb="md">
            5. Perubahan Ketentuan
          </Title>
          <Text c="gray.7">
            Kami berhak memperbarui Syarat & Ketentuan ini sewaktu-waktu. Versi terbaru akan dipublikasikan di
            halaman ini dengan tanggal revisi yang diperbarui.
          </Text>
        </Box>

        <Box>
          <Title order={2} size="h2" fw={700} c="blue.9" mb="md">
            6. Kontak
          </Title>
          <Text c="gray.7">
            Jika Anda memiliki pertanyaan tentang ketentuan ini, silakan hubungi kami di:
          </Text>
          <Text c="gray.7" fw={600} mt="xs">
            bip.baliinteraktifperkasa@gmail.com
          </Text>
        </Box>

        <Divider my="xl" />

        <Text ta="center" c="gray.6" size="sm">
          © 2025 Bali Interaktif Perkasa. All rights reserved.
        </Text>
      </Stack>
    </Container>
  );
}

export default Page;
