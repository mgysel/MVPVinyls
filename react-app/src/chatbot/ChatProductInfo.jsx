import React from "react";
import { Flex, Image, Text, Box, LinkOverlay, LinkBox } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ChatProductInfo = (props) => {
  return (
    <LinkBox>
      <Flex
        w="100%"
        my="1rem"
        align="center"
        p="0.5rem"
        borderRadius="5px"
        border="1px"
        borderColor="teal"
        justify="space-between"
      >
        <Flex align="center">
          <Image src={props.src} boxSize="4rem" />
          <Box ml="1rem">
            <LinkOverlay as={RouterLink} to={`/vinyl/${props.id}`}>
              <Text fontWeight="bold">{props.album}</Text>
            </LinkOverlay>
            <Text>{props.artist}</Text>
          </Box>
        </Flex>
        <Box mr="1rem">
          <Text>${parseFloat(props.price).toFixed(2)}</Text>
        </Box>
      </Flex>
    </LinkBox>
  );
};

export default ChatProductInfo;
