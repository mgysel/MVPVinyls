import React, { useState, useEffect } from "react";
import {
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import API from "../helpers/api";

const Checkout = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  const [userJson, setUserJson] = useState({});
  let history = useHistory();

  // Get delivery details if previously entered
  useEffect(() => {
    if (sessionStorage.getItem("delivery_details") !== null) {
      const session = JSON.parse(sessionStorage.getItem("delivery_details"));
      setFirstName(session.first_name);
      setLastName(session.last_name);
      setStreet(session.street);
      setCity(session.city);
      setPostcode(session.postcode);
      setState(session.state);
      setEmail(session.email);
    }
    API.getPath("user/profile")
      .then((json) => {
        setUserJson(json.data.user);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  // Go to previous page
  const handleBack = () => {
    history.goBack();
  };

  // Go to checkout summary page
  const handleContinue = () => {
    if (
      firstName === "" ||
      lastName === "" ||
      street === "" ||
      city === "" ||
      postcode === "" ||
      state === "" ||
      email === ""
    ) {
      setAlertDisplay("flex");
      setAlertStatus("error");
      setAlertMessage("Please enter all fields");
      return;
    }
    const deliveryDetails = {
      first_name: firstName,
      last_name: lastName,
      street: street,
      city: city,
      postcode: postcode,
      state: state,
      email: email,
    };
    sessionStorage.setItem("delivery_details", JSON.stringify(deliveryDetails));
    history.push("/checkout/summary", deliveryDetails);
  };

  // Use a users saved details to fill in form
  const handleSaved = () => {
    setFirstName(userJson.first_name);
    setLastName(userJson.last_name);
    if (userJson.shipping_address[0]) {
      setStreet(userJson.shipping_address[0].street);
      setCity(userJson.shipping_address[0].city);
      setPostcode(userJson.shipping_address[0].postcode);
      setState(userJson.shipping_address[0].state);
    }
    setEmail(userJson.email);
  };

  return (
    <Flex w="100%" maxW="1366px" mb="1rem" direction="column" p="1rem">
      <form onSubmit={handleContinue}>
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
        <Flex>
          <Box w="100%">
            <Box
              bg="white"
              mb="1rem"
              p="1rem"
              boxShadow="md"
              borderRadius="5px"
              border="1px solid"
              borderColor="gray.200"
            >
              <Flex align="center">
                <Heading as="h2" size="md">
                  1. Delivery Options
                </Heading>
                <Button ml="1rem" colorScheme="teal" onClick={handleSaved}>
                  Use saved
                </Button>
              </Flex>
              <FormControl my="1rem" id="checkout-first-name" isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  type="text"
                  placeholder="First name"
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                />
              </FormControl>
              <FormControl my="1rem" id="checkout-last-name" isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Last name"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                />
              </FormControl>
              <FormControl my="1rem" id="checkout-street" isRequired>
                <FormLabel>Street Address</FormLabel>
                <Input
                  type="text"
                  placeholder="Street Address"
                  onChange={(e) => setStreet(e.target.value)}
                  value={street}
                />
              </FormControl>
              <FormControl my="1rem" id="checkout-city" isRequired>
                <FormLabel>City</FormLabel>
                <Input
                  type="text"
                  placeholder="City"
                  onChange={(e) => setCity(e.target.value)}
                  value={city}
                />
              </FormControl>
              <FormControl my="1rem" id="checkout-postcode" isRequired>
                <FormLabel>Postcode</FormLabel>
                <Input
                  type="text"
                  placeholder="Postcode"
                  onChange={(e) => setPostcode(e.target.value)}
                  value={postcode}
                />
              </FormControl>
              <FormControl my="1rem" id="checkout-state" isRequired>
                <FormLabel>State</FormLabel>
                <Input
                  type="text"
                  placeholder="State"
                  onChange={(e) => setState(e.target.value)}
                  value={state}
                />
              </FormControl>
              <FormControl my="1rem" id="checkout-email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </FormControl>
            </Box>
          </Box>
        </Flex>
        <Flex justify="space-between">
          <Button size="lg" colorScheme="teal" onClick={handleBack}>
            Go back
          </Button>
          <Button size="lg" colorScheme="teal" type="submit">
            Continue
          </Button>
        </Flex>
      </form>
    </Flex>
  );
};

export default Checkout;
