'use client'
import colors from '@/con/colors';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { IconMessageCircleQuestion } from '@tabler/icons-react';
import { motion } from 'framer-motion';

function PengaduanMasyarakat() {
  return (
    <Box>
      <Stack >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.8 }}
        > 
        <Paper p={'xl'} >
          <Box>
          <IconMessageCircleQuestion size={50} color={colors['blue-button']} />,
          </Box>
          <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Pengaduan Masyarakat</Text>
          <Text fz={'lg'} c={'black'}>Sampaikan keluhan dan aspirasi Anda melalui platform digital kami</Text>
        </Paper>
        </motion.div>
      </Stack>
    </Box>
  );
}

export default PengaduanMasyarakat;
