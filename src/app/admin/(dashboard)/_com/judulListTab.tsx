'use client'
import { Grid, GridCol, Button, Paper, TextInput } from '@mantine/core';
import { IconCircleDashedPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { UnifiedText } from '@/components/admin/UnifiedTypography';

type JudulListTabProps = {
  title: string;
  href: string;
  placeholder: string;
  searchIcon: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const JudulListTab = ({
  title = "",
  href = "#",
  placeholder = "pencarian",
  searchIcon = <IconSearch size={20} />,
  value,
  onChange
}: JudulListTabProps) => {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const router = useRouter();

  const handleNavigate = () => {
    router.push(href);
  };

  return (
    <Grid mb={10}>
      <GridCol span={{ base: 12, md: 8 }}>
        <UnifiedText 
          size="body" 
          weight="bold"
          color="primary"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        >
          {title}
        </UnifiedText>
      </GridCol>
      <GridCol span={{ base: 9, md: 3 }} ta="right">
        <Paper radius={"lg"} bg={tokens.colors.bg.surface}>
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
      <GridCol span={{ base: 3, md: 1 }} ta="right">
        <Button 
          onClick={handleNavigate} 
          bg={tokens.colors.primary}
          style={{
            background: `linear-gradient(135deg, ${tokens.colors.primary}, ${isDark ? '#60A5FA' : '#4facfe'})`,
            color: tokens.colors.text.inverse,
            boxShadow: isDark ? 'none' : `0 4px 15px rgba(79, 172, 254, 0.4)`,
          }}
        >
          <IconCircleDashedPlus size={25} />
        </Button>
      </GridCol>
    </Grid>
  );
};

export default JudulListTab;
