import { Select, Group } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

interface YearFilterProps {
  value?: number;
  onChange: (year: number | undefined) => void;
  minYear?: number;
  maxYear?: number;
}

export function YearFilter({
  value,
  onChange,
  minYear = 2020,
  maxYear = new Date().getFullYear() + 1,
}: YearFilterProps) {
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const options = [
    { value: '', label: 'Semua Tahun' },
    ...years.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
  ];

  return (
    <Select
      placeholder="Pilih Tahun"
      data={options}
      value={value?.toString() ?? ''}
      onChange={(val) => onChange(val ? parseInt(val) : undefined)}
      leftSection={<IconCalendar size={18} />}
      clearable
      w={200}
    />
  );
}

export default YearFilter;
