import colors from '@/con/colors';
import { Box, Card, Image, Stack, Text } from '@mantine/core';
import React from 'react';
import { Prisma } from '@prisma/client';

interface ProfileViewProps {
  data: Prisma.PejabatDesaGetPayload<{ include: { image: true } }> | null;
}

function ProfileView({ data }: ProfileViewProps) {
  if (!data) {
    return <div>No profile data available</div>;
  }

  return (
    <Stack
      justify="end"
      align="end"
      pos="relative"
      w={{
        base: "100%",
        md: "40%",
      }}
      px="xl"
    >
      {data.image?.link ? (
        <Image
          src={data.image.link}
          alt={data.name || "Profile image"}
          sizes="100%"
          fit="contain"
        />
      ): (
        <Text>
          -
        </Text>
      )}
      <Box
        pos="absolute"
        bottom={0}
        p={{
          base: "xs",
          md: "md",
        }}
      >
        <Card
          px="lg"
          radius="32"
          className="glass3"
          style={{
            border: `1px solid white`,
          }}
        >
          <Text>{data.position}</Text>
          <Text c={colors["blue-button"]} fw="bolder" fz="1rem">
            {data.name}
          </Text>
        </Card>
      </Box>
    </Stack>
  );
}

export default ProfileView;