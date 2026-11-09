'use client'
import PengaduanMasyarakatModal from '@/app/darmasaba/_com/pengaduan/PengaduanMasyarakatModal';
import colors from '@/con/colors';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMessageCircleQuestion } from '@tabler/icons-react';
import { motion } from 'framer-motion';

function PengaduanMasyarakat() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Box>
      <Stack >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.8 }}
          onClick={open}
        >
          <Paper p={'xl'} >
            <Box>
              <IconMessageCircleQuestion size={50} color={colors['blue-button']} />
            </Box>
            <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Pengaduan Masyarakat</Text>
            <Text fz={'lg'} c={'black'}>Sampaikan keluhan dan aspirasi Anda melalui platform digital kami</Text>
          </Paper>
        </motion.div>
      </Stack>
      <PengaduanMasyarakatModal opened={opened} onClose={close} />
    </Box>
  );
}

export default PengaduanMasyarakat;
