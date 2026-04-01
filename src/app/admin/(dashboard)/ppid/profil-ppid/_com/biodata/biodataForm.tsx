'use client'
import { Box, Text } from '@mantine/core';
import EditPPIDEditor from '../../_com/editPPIDEditor';



function Biodata({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  
  return (<Box>
    <Text fw={"bold"}>Biodata</Text>
    <EditPPIDEditor
      value={value}
      onChange={onChange}
    />
    {error && <Text c="red" size="sm">{error}</Text>}
  </Box>
  );
}

export default Biodata;