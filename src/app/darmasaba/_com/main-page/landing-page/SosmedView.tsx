import { ActionIcon, Card, Flex, Image, Text, Tooltip } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { useTransitionRouter } from "next-view-transitions";
import { IconBrandInstagram, IconBrandFacebook, IconBrandTwitter, IconWorld } from "@tabler/icons-react";

function SosmedView({
  data,
}: {
  data: Prisma.MediaSosialGetPayload<{ include: { image: true } }>[];
}) {
  const router = useTransitionRouter();

  const fallbackIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return <IconBrandInstagram size={22} />;
      case "facebook":
        return <IconBrandFacebook size={22} />;
      case "twitter":
        return <IconBrandTwitter size={22} />;
      default:
        return <IconWorld size={22} />;
    }
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
              {item.image?.link ? (
                <Image
                  src={item.image.link}
                  alt={item.name || "ikon"}
                  w={24}
                  h={24}
                  fit="contain"
                  loading="lazy"
                />
              ) : (
                fallbackIcon(item.name)
              )}
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
