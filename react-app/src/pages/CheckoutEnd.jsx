import React, { useEffect, useState } from "react";
import { Flex, Heading, Text, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import API from "../helpers/api";

const CheckoutEnd = () => {
  const [orderSuccess, setOrderSuccess] = useState(true);

  // Format order payload and post
  useEffect(() => {
    if (
      sessionStorage.getItem("order") !== null &&
      sessionStorage.getItem("delivery_details") !== null
    ) {
      // Creating order
      const shippingDetails = JSON.parse(
        sessionStorage.getItem("delivery_details")
      );
      let order = JSON.parse(sessionStorage.getItem("order"));
      order = order.map((order) => {
        return {
          product: {
            product_id: order.product_id,
          },
          quantity: order.quantity,
        };
      });
      const orderPayload = {
        order: order,
        shipping_details: shippingDetails,
      };
      // Post order
      API.postAuthPath("order/add", orderPayload).catch((err) => {
        setOrderSuccess(false);
        if (err instanceof TypeError) {
          console.warn(`Error: ${err}`);
          return;
        }
        err.json().then((json) => {
          console.warn(`Error: ${json.message}`);
        });
      });
      sessionStorage.removeItem("delivery_details");
      sessionStorage.removeItem("order");

      // Remove items from cart
      const cartPayload = {
        cart: [],
      };
      API.putPath("user/cart/edit", cartPayload).catch((err) => {
        if (err instanceof TypeError) {
          console.warn(`Error: ${err}`);
          return;
        }
        err.json().then((json) => {
          console.warn(`Error: ${json.message}`);
        });
      });
    }
    //eslint-disable-next-line
  }, []);

  return (
    <Flex
      w="100%"
      maxW="1366px"
      p="1rem"
      direction="column"
      align="center"
      pt="12%"
    >
      {orderSuccess ? (
        <>
          <Heading as="h1" size="xl" mb="1rem">
            Successfully ordered!
          </Heading>
          <Text fontSize="1.2em" mb="2rem">
            To view your new purchases, go to the Order History tab in your user
            profile
          </Text>
          <Button colorScheme="teal" size="lg" as={RouterLink} to="/homepage">
            Return home
          </Button>
        </>
      ) : (
        <>
          <Heading as="h1" size="xl" mb="1rem">
            Order unsuccessful
          </Heading>
          <Text fontSize="1.2em" mb="2rem">
            Something went wrong and your order was not placed. Double check
            your payment details and try again
          </Text>
          <Button colorScheme="teal" size="lg" as={RouterLink} to="/cart">
            Return to cart
          </Button>
        </>
      )}
    </Flex>
  );
};

export default CheckoutEnd;
