import { ActionIcon, Flex, Image, Text } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { useTransitionRouter } from "next-view-transitions";



function SosmedView({data} : {data : Prisma.MediaSosialGetPayload<{ include: { image: true } }>[]}) {
  const router = useTransitionRouter();
  return (
    <Flex gap={"md"} justify={"center"} align={"center"}>
        {data?.map((item, k) => {
          return (
            <ActionIcon
              variant="transparent"
              key={k}
              w={32}
              h={32}
              pos={"relative"}
              onClick={() => {
                router.push(item.iconUrl || "");
              }}
            >
              {item.image?.link ? (
                <Image src={item.image.link} alt="icon" loading="lazy" />
              ) : (
                <Text>
                  none
                </Text>
              )}
            </ActionIcon>
          );
        })}
    </Flex>
  );
}

export default SosmedView;
