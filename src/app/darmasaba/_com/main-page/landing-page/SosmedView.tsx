import images from "@/con/images";
import { ActionIcon, Flex, Image } from "@mantine/core";

function SosmedView() {
  const listSosmed = Object.values(images.sosmed);
  return (
    <Flex gap={"md"} justify={"center"} align={"center"}>
        {listSosmed.map((item, k) => {
          return (
            <ActionIcon
              variant="transparent"
              key={k}
              w={32}
              h={32}
              pos={"relative"}
            >
              <Image src={item} alt="icon" loading="lazy" />
            </ActionIcon>
          );
        })}
    </Flex>
  );
}

export default SosmedView;
