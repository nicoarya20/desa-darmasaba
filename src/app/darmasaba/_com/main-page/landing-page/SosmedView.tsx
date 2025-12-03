/* eslint-disable @typescript-eslint/no-explicit-any */
import { sosmedMap } from "@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed";
import colors from "@/con/colors";
import { ActionIcon, Box, Card, Flex, Image, Text, Tooltip } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { useTransitionRouter } from "next-view-transitions";

function SosmedView({
  data,
}: {
  data: Prisma.MediaSosialGetPayload<{ include: { image: true } }>[];
}) {
  const router = useTransitionRouter();

  const getIconSource = (item: any) => {
    if (item.image?.link) return item.image.link;
    if (item.icon && sosmedMap[item.icon as keyof typeof sosmedMap]?.src) {
      return sosmedMap[item.icon as keyof typeof sosmedMap].src;
    }
    return null;
  };

  return (
    <Flex gap="lg" justify="center" align="center" wrap="wrap">
      {data && data.length > 0 ? (
        data.map((item, k) => (
          <Tooltip
            key={k}
            label={item.name || "Tautan Sosial"}
            withArrow
            position="top"
            transitionProps={{ transition: "pop", duration: 150 }}
          >
            <ActionIcon
              variant="light"
              radius="xl"
              size="xl"
              onClick={() => item.iconUrl && router.push(item.iconUrl)}
              style={{
                transition: "all 0.3s ease",
                boxShadow: "0 0 12px rgba(28, 110, 164, 0.6)",
              }}
            >
              {(() => {
                const src = getIconSource(item);

                if (src) {
                  return (
                    <Image
                      loading="lazy"
                      src={src}
                      alt={item.name}
                      w={24}
                      h={24}
                      fit="contain"
                    />
                  );
                }

                return <Box bg={colors['blue-button']} w="100%" h="100%" />;
              })()}
            </ActionIcon>
          </Tooltip>
        ))
      ) : (
        <Card
          shadow="md"
          radius="xl"
          p="lg"
          withBorder
          style={{
            background: "linear-gradient(135deg, #1C6EA4 0%, #000 100%)",
          }}
        >
          <Text ta="center" c="dimmed" size="sm">
            Belum ada media sosial yang terhubung
          </Text>
        </Card>
      )}
    </Flex>
  );
}

export default SosmedView;
