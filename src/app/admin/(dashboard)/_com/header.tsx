import React from 'react';
import { Grid, GridCol, Paper, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import colors from '@/con/colors';

type HeaderSearchProps = {
  title: string;
  placeholder?: string;
  searchIcon?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const HeaderSearch = ({
  title = "",
  placeholder = "pencarian",
  searchIcon = <IconSearch size={20} />,
  value,
  onChange,
}: HeaderSearchProps) => {
  return (
    <Grid mb={10}>
      <GridCol span={{ base: 12, md: 9 }}>
        <Title order={3}>{title}</Title>
      </GridCol>
      <GridCol span={{ base: 12, md: 3 }}>
        <Paper radius="lg" bg={colors['white-1']}>
          <TextInput
            radius="lg"
            placeholder={placeholder}
            leftSection={searchIcon}
            w="100%"
            value={value}
            onChange={onChange}
          />
        </Paper>
      </GridCol>
    </Grid>
  );
};

export default HeaderSearch;
