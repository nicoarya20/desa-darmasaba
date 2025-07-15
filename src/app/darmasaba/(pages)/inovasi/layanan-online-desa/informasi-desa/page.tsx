'use client'
import colors from '@/con/colors';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { motion } from 'framer-motion';

function InformasiDesa() {
  return (
    <Box>
      <Stack >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.8 }}
        >
        <Paper p={'xl'} >
          <Box>
          <IconBell size={50} color={colors['blue-button']} />,
          </Box>
          <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Informasi Desa</Text>
          <Text fz={'lg'} c={'black'}>Akses berita dan pengumuman terbaru seputar kegiatan desa</Text>
        </Paper>
        </motion.div>
      </Stack>
    </Box>
  );
}

export default InformasiDesa;
