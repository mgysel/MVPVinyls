import React from "react";
import {
  Heading,
  Flex,
  Box,
  Text,
  ListItem,
  Image,
  Divider,
} from "@chakra-ui/react";

const CartItemRow = (props) => {
  return (
    <>
      <ListItem>
        <Flex
          bg="white"
          h="7rem"
          p="0.5rem"
          align="center"
          justify="space-between"
        >
          <Flex align="center">
            <Image
              src={
                props.images[0].url
                  ? props.images[0].url
                  : props.images[0].base64
              }
              boxSize="5rem"
            />
            <Box ml="2rem">
              <Heading as="h4" size="sm" mb="0.5rem">
                {props.album.name}
              </Heading>
              <Text>{props.artists[0].name}</Text>
            </Box>
          </Flex>
          <Box textAlign="right">
            <Text>${parseFloat(props.price).toFixed(2)}</Text>
            <Box>
              <Text display="inline" fontWeight="semibold">
                Quantity:
              </Text>{" "}
              {props.quantity}
            </Box>
            <Box>
              <Text display="inline" fontWeight="semibold">
                Subtotal:
              </Text>{" "}
              ${parseFloat(props.price * props.quantity).toFixed(2)}
            </Box>
          </Box>
        </Flex>
      </ListItem>
      <Divider />
    </>
  );
};

export default CartItemRow;
