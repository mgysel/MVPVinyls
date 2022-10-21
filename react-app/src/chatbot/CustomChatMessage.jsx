import React from "react";
import { Box, Text } from "@chakra-ui/react";

const CustomChatMessage = (props) => {
  return (
    <Box bg="teal" p="0.8rem" w="14rem" borderRadius="5px" color="white">
      <Text>{props.message}</Text>
    </Box>
  );
};

export default CustomChatMessage;
