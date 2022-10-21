import React, { useEffect, useState } from "react";
import {
  Heading,
  Flex,
  Button,
  Box,
  Text,
  UnorderedList,
  CircularProgress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import API from "../helpers/api";
import { loadStripe } from "@stripe/stripe-js";
import CartItemRow from "../components/CartItemRow";
const stripePromise = loadStripe(
  "pk_test_51IXYu4E50AUaAlkBw1i5mJzeQPcDe6x8JLdi7yBx38drG9G1rT4AvLofKuPS0DAhNRpx04gT6hEiTxNCn2HTEBmV00RZLuwuDN"
);

const CheckoutSummary = () => {
  const details = useState(
    JSON.parse(sessionStorage.getItem("delivery_details"))
  )[0];
  const [productList, setProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  let history = useHistory();

  // Get a users cart
  useEffect(() => {
    API.getPath("user/profile")
      .then((json) => {
        sessionStorage.setItem("order", JSON.stringify(json.data.user.cart));
        // Map cart to better format with product data
        const productPromises = json.data.user.cart.map((product) => {
          return API.getPath(`product/${product.product_id}`).then((json) => {
            return { data: json.data, quantity: product.quantity };
          });
        });
        // Resolve promise list, set into state and calculate total cost
        Promise.all(productPromises).then((resolvedList) => {
          setProductList(resolvedList);
          let calculatingTotal = 0;
          resolvedList.forEach((p) => {
            const subtotal = parseFloat(p.data.price * p.quantity).toFixed(2);
            calculatingTotal =
              parseFloat(calculatingTotal) + parseFloat(subtotal);
          });
          setTotal(calculatingTotal);
        });
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  // Handle payment redirect with Stripe
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      const stripe = await stripePromise;
      const payload = {
        success_url: "http://localhost:3000/checkout/end",
        cancel_url: "http://localhost:3000/checkout/summary",
      };
      const options = {
        method: "POST",
        headers: {
          "x-access-token": localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };
      const response = await fetch(
        `${API.url}/payments/create-checkout-session`,
        options
      );
      if (!response.ok) {
        throw response;
      }
      const session = await response.json();
      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session.data.id,
      });
      if (result.error) {
        setPaymentLoading(false);
        setAlertDisplay("flex");
        setAlertStatus("error");
        setAlertMessage(result.error.message);
      }
    } catch (err) {
      const errorMessage = await err.json();
      setPaymentLoading(false);
      setAlertDisplay("flex");
      setAlertStatus("error");
      setAlertMessage(errorMessage.message);
    }
  };

  // Go to previous page
  const handleBack = () => {
    history.goBack();
  };

  return (
    <Flex w="100%" maxW="1366px" mb="2rem" direction="column" p="1rem">
      <Heading as="h1" mb="1rem">
        Checkout
      </Heading>
      <Alert status={alertStatus} mb="1rem" d={alertDisplay}>
        <AlertIcon />
        <AlertTitle mr={2}>
          {alertStatus === "error" ? "Error" : "Success"}
        </AlertTitle>
        <AlertDescription>{alertMessage}</AlertDescription>
        <CloseButton
          onClick={() => {
            setAlertDisplay("none");
          }}
          position="absolute"
          right="8px"
          top="8px"
        />
      </Alert>
      <Box
        bg="white"
        mb="1rem"
        p="1rem"
        boxShadow="md"
        borderRadius="5px"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="md" mb="1rem">
          2. Order Summary
        </Heading>
        <Heading as="h3" size="md" mb="1rem">
          Cart
        </Heading>
        <Box my="1rem">
          <UnorderedList listStyleType="None" m={0}>
            {productList.map((product, idx) => (
              <CartItemRow
                key={idx}
                images={product.data.images}
                album={product.data.album}
                artists={product.data.artists}
                price={product.data.price}
                quantity={product.quantity}
              />
            ))}
          </UnorderedList>
        </Box>
        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Shipping details
          </Heading>
          <Text>
            {details.firstName} {details.lastName}
          </Text>
          <Text>
            {details.street}, {details.city}, {details.state} {details.postcode}
          </Text>
          <Text>{details.email}</Text>
        </Box>
        <Flex mt="1rem" justify="space-between">
          <Text fontSize="1.2em" fontWeight="bold">
            Order Total:
          </Text>
          <Text fontSize="1.2em" fontWeight="bold">
            ${parseFloat(total).toFixed(2)}
          </Text>
        </Flex>
      </Box>
      <Flex justify="space-between">
        <Button size="lg" colorScheme="teal" onClick={handleBack}>
          Go back
        </Button>
        <Button size="lg" colorScheme="teal" onClick={handlePayment}>
          {paymentLoading ? (
            <CircularProgress isIndeterminate color="green.300" />
          ) : (
            "Proceed to payment"
          )}
        </Button>
      </Flex>
    </Flex>
  );
};

export default CheckoutSummary;
