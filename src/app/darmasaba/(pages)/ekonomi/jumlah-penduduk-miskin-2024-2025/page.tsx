'use client'
import colors from '@/con/colors';
import { Box, CheckIcon, Combobox, ComboboxChevron, ComboboxOption, ComboboxOptions, ComboboxTarget, Group, InputBase, InputPlaceholder, Paper, SimpleGrid, Stack, Text, useCombobox } from '@mantine/core';
import { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';

const data = [
  {
    id: 1,
    tahun: '2024',
    Penduduk: 400000
  },
  {
    id: 2,
    tahun: '2025',
    Penduduk: 450000
  },

]
const tahun = [
  '2024',
  '2025'
];
function Page() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === 'keyboard') {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex('active');
      }
    },
  });

  const [value, setValue] = useState<string | null>('2024');

  const options = tahun.map((item) => (
    <ComboboxOption value={item} key={item} active={item === value}>
      <Group gap="xs">
        {item === value && <CheckIcon size={12} />}
        <span>{item}</span>
      </Group>
    </ComboboxOption>
  ));
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Jumlah Penduduk Miskin Tahun 2024-2025
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            pb={20}
            cols={{
              base: 1,
              md: 2
            }}
          >
            <Paper p={'xl'}>
              <Text fz={'h3'}>Tahun: 2024</Text>
              <Text fw={"bold"} fz={'h1'}>4,800,000 Orang</Text>
            </Paper>
            <Paper p={'xl'}>
              <Text>Pilih Tahun</Text>
              <Combobox
                store={combobox}
                resetSelectionOnOptionHover
                withinPortal={false}
                onOptionSubmit={(val) => {
                  setValue(val);
                  combobox.updateSelectedOptionIndex('active');
                }}
              >
                <ComboboxTarget targetType="button">
                  <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<ComboboxChevron />}
                    rightSectionPointerEvents="none"
                    onClick={() => combobox.toggleDropdown()}
                  >
                    {value || <InputPlaceholder>Pick value</InputPlaceholder>}
                  </InputBase>
                </ComboboxTarget>

                <Combobox.Dropdown>
                  <ComboboxOptions>{options}</ComboboxOptions>
                </Combobox.Dropdown>
              </Combobox>
            </Paper>
          </SimpleGrid>
          <Paper p={'xl'}>
            <Text pb={10} fw={'bold'} fz={'h4'}>Jumlah Penduduk Miskin Per Tahun</Text>
            <BarChart
              p={10}
              h={300}
              data={data}
              dataKey="tahun"
              series={[
                { name: 'Penduduk', color: '#8785D3' },
              ]}
              tickLine="y"
            />
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
