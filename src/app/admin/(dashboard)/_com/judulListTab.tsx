'use client'
import colors from '@/con/colors';
import { Grid, GridCol, Button, Text, Paper, TextInput } from '@mantine/core';
import { IconCircleDashedPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

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
  const router = useRouter();

  const handleNavigate = () => {
    router.push(href);
  };

  return (
    <Grid mb={10}>
      <GridCol span={{ base: 12, md: 8 }}>
        <Text fz={{ base: "md", md: "xl" }} fw={"bold"}>{title}</Text>
      </GridCol>
      <GridCol span={{ base: 9, md: 3 }} ta="right">
        <Paper radius={"lg"} bg={colors['white-1']}>
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
      <GridCol span={{ base: 3, md: 1 }} ta="right">
        <Button onClick={handleNavigate} bg={colors['blue-button']}>
          <IconCircleDashedPlus size={25} />
        </Button>
      </GridCol>
    </Grid>
  );
};

export default JudulListTab;
