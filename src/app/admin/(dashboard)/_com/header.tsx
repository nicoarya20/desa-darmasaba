import React from 'react';
import { Grid, GridCol, Paper, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react'; // Sesuaikan jika kamu pakai icon lain
import colors from '@/con/colors';


const HeaderSearch = ({ title = "", placeholder = "pencarian", searchIcon = <IconSearch size={20} /> }: { title: string, placeholder?: string, searchIcon?: React.ReactNode }) => {
  return (
    <Grid>
      <GridCol span={{ base: 12, md: 9 }}>
        <Title order={3}>{title}</Title>
      </GridCol>
      <GridCol span={{ base: 12, md: 3 }}>
        <Paper radius={"lg"} bg={colors['white-1']}>
          <TextInput
            radius="lg"
            placeholder={placeholder}
            leftSection={searchIcon}
            w="100%"
          />
        </Paper>
      </GridCol>
    </Grid>
  );
};

export default HeaderSearch;