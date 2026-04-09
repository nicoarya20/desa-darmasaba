'use client';

import type React from 'react';
import { Grid, GridCol, Paper, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { UnifiedTitle } from '@/components/admin/UnifiedTypography';

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
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <Grid mb={10}>
      <GridCol span={{ base: 12, md: 9 }}>
        <UnifiedTitle order={3}>{title}</UnifiedTitle>
      </GridCol>
      <GridCol span={{ base: 12, md: 3 }}>
        <Paper radius="lg" bg={tokens.colors.bg.surface}>
          <TextInput
            radius="lg"
            placeholder={placeholder}
            leftSection={searchIcon}
            w="100%"
            value={value}
            onChange={onChange}
            style={{
              input: {
                backgroundColor: tokens.colors.bg.surface,
                color: tokens.colors.text.primary,
                borderColor: tokens.colors.border.default,
                '::placeholder': {
                  color: tokens.colors.text.muted,
                },
              },
            }}
          />
        </Paper>
      </GridCol>
    </Grid>
  );
};

export default HeaderSearch;
