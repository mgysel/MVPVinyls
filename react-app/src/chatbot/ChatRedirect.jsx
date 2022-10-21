import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ChatRedirect = (props) => {
  return (
    <Flex
      border="1px"
      borderColor="teal"
      h="3rem"
      borderRadius="5px"
      justify="center"
      align="center"
      as={RouterLink}
      to={
        props.data.type === "order"
          ? `/order/${props.data.id}`
          : `/vinyl/${props.data.id}`
      }
    >
      <Text fontWeight="bold" color="teal">
        View {props.data.type === "order" ? "Order" : "Product"}
      </Text>
    </Flex>
  );
};

export default ChatRedirect;
