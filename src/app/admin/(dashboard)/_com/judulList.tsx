
'use client'
import colors from '@/con/colors';
import { Grid, GridCol, Button, Text } from '@mantine/core';
import { IconCircleDashedPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const JudulList = ({ title = "", href = "#" }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(href);
  };

  return (
    <Grid align="center" mb={10}>
      <GridCol span={{ base: 12, md: 11 }}>
        <Text fz={"xl"} fw={"bold"}>{title}</Text>
      </GridCol>
      <GridCol span={{ base: 12, md: 1 }} ta="right">
        <Button onClick={handleNavigate} bg={colors['blue-button']}>
          <IconCircleDashedPlus size={25} />
        </Button>
      </GridCol>
    </Grid>
  );
};

export default JudulList;
