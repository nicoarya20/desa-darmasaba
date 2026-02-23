
'use client'
import { Grid, GridCol, Button } from '@mantine/core';
import { IconCircleDashedPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { UnifiedText } from '@/components/admin/UnifiedTypography';

const JudulList = ({ title = "", href = "#" }) => {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const router = useRouter();

  const handleNavigate = () => {
    router.push(href);
  };

  return (
    <Grid align="center" mb={10}>
      <GridCol span={{ base: 12, md: 11 }}>
        <UnifiedText size="body" weight="bold" color="primary">{title}</UnifiedText>
      </GridCol>
      <GridCol span={{ base: 12, md: 1 }} ta="right">
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

export default JudulList;
