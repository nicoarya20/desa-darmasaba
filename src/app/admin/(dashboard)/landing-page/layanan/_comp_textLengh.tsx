import React from 'react';
import { Text } from '@mantine/core';

function CompTextLengh({input, maxLength}: {input: string, maxLength: number}) {
  return (
    <div>
      <Text fz={"xs"}>{input.length}/{maxLength}</Text>
    </div>
  );
}

export default CompTextLengh;
