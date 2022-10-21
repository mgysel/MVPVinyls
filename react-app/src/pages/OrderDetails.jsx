import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  UnorderedList,
  Divider,
  Progress,
  Button,
} from "@chakra-ui/react";
import { useParams, useHistory } from "react-router-dom";
import API from "../helpers/api";
import CartItemRow from "../components/CartItemRow";

const OrderDetails = () => {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [fulfilled, setFulfilled] = useState("");
  const [shippingDetails, setShippingDetails] = useState({
    first_name: "",
    last_name: "",
    city: "",
    email: "",
    postcode: "",
    state: "",
    street: "",
  });
  const [orderList, setOrderList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  let { orderId } = useParams();
  let history = useHistory();

  // Get order details from order ID
  useEffect(() => {
    API.getPath(`order/${orderId}`)
      .then((json) => {
        setLoading(false);
        setEmail(json.data.order.shipping_details.email);
        setDate(json.data.order.date);
        setFulfilled(json.data.order.fulfilled);
        setShippingDetails(json.data.order.shipping_details);
        setOrderList(json.data.order.order);
        // Calculate total price
        let calculatingTotal = 0;
        json.data.order.order.forEach((p) => {
          const subtotal = parseFloat(p.product.price * p.quantity).toFixed(2);
          calculatingTotal =
            parseFloat(calculatingTotal) + parseFloat(subtotal);
        });
        setTotal(calculatingTotal);
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          console.warn(`Error: ${err}`);
          return;
        }
        err.json().then((json) => {
          console.warn(`Error: ${json.message}`);
        });
      });
  }, [orderId]);

  // Loading bar
  if (loading) {
    return (
      <Flex w="100%" maxW="1366px" p="1rem" flexDirection="column">
        <Progress size="md" colorScheme="teal" isIndeterminate />
      </Flex>
    );
  }

  return (
    <Flex w="100%" maxW="1366px" p="1rem" flexDirection="column">
      <Heading as="h1">Order Details</Heading>
      <Box
        w="100%"
        bg="white"
        flexGrow="1"
        mt="1rem"
        borderRadius="5px"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.200"
        p="1rem"
      >
        <Flex justify="space-between">
          <Box mb="1rem">
            <Heading
              as="h2"
              fontWeight="semibold"
              fontSize="1.4em"
              d="inline-block"
            >
              Order Number:
            </Heading>
            <Text fontSize="1.1em" d="inline-block" ml="1rem">
              {orderId}
            </Text>
          </Box>
          <Box mb="1rem">
            <Heading
              as="h2"
              fontWeight="semibold"
              fontSize="1.4em"
              d="inline-block"
            >
              Order Placed:
            </Heading>
            <Text fontSize="1.1em" d="inline-block" ml="1rem">
              {date}
            </Text>
          </Box>
          <Box mb="1rem">
            <Heading
              as="h2"
              fontWeight="semibold"
              fontSize="1.4em"
              d="inline-block"
            >
              Shipping Email:
            </Heading>
            <Text fontSize="1.1em" d="inline-block" ml="1rem">
              {email}
            </Text>
          </Box>
        </Flex>
        <Divider />
        <Flex my="1rem">
          <Heading
            as="h2"
            fontWeight="semibold"
            fontSize="1.4em"
            d="inline-block"
          >
            Shipping Details:
          </Heading>
          <Box d="inline-block">
            <Text fontSize="1.1em" ml="1rem">
              {`${shippingDetails.first_name} ${shippingDetails.last_name}, 
              ${shippingDetails.street}, 
              ${shippingDetails.city} ${shippingDetails.postcode}, 
              ${shippingDetails.state}`}
            </Text>
          </Box>
        </Flex>
        <Divider />
        <Box my="1rem">
          <Heading
            as="h2"
            fontWeight="semibold"
            fontSize="1.4em"
            d="inline-block"
          >
            Fulfilled:
          </Heading>
          <Text fontSize="1.1em" d="inline-block" ml="1rem">
            {fulfilled ? "True" : "False"}
          </Text>
        </Box>
        <Divider />
        <Box my="1rem">
          <Heading
            as="h2"
            fontWeight="semibold"
            fontSize="1.4em"
            d="inline-block"
          >
            Order total:
          </Heading>
          <Text fontSize="1.1em" d="inline-block" ml="1rem">
            ${parseFloat(total).toFixed(2)}
          </Text>
        </Box>
        <Divider />
        <Box my="1rem">
          <Heading as="h2" fontWeight="semibold" fontSize="1.4em">
            Items:
          </Heading>
          <UnorderedList listStyleType="None" m={0}>
            {orderList.map((order, idx) => (
              <CartItemRow
                key={idx}
                images={order.product.images}
                album={order.product.album}
                artists={order.product.artists}
                price={order.product.price}
                quantity={order.quantity}
              />
            ))}
          </UnorderedList>
        </Box>
        <Button
          float="right"
          colorScheme="teal"
          onClick={() => history.goBack()}
        >
          Return to previous
        </Button>
      </Box>
    </Flex>
  );
};

export default OrderDetails;
