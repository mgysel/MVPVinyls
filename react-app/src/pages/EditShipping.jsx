import React, { useEffect, useState } from "react";
import {
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import API from "../helpers/api";

const EditShipping = () => {
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [userJson, setUserJson] = useState({});
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Get a users shipping details
  useEffect(() => {
    API.getPath("user/profile")
      .then((json) => {
        if (json.data.user.shipping_address.length !== 0) {
          setStreetAddress(json.data.user.shipping_address[0].street);
          setCity(json.data.user.shipping_address[0].city);
          setPostcode(json.data.user.shipping_address[0].postcode);
          setState(json.data.user.shipping_address[0].state);
          setCountry(json.data.user.shipping_address[0].country);
        }
        setUserJson(json.data.user);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  // Handle form submission of shipping details change
  const handleSubmit = (e) => {
    e.preventDefault();
    const newAddress = {
      street: streetAddress,
      city: city,
      postcode: postcode,
      state: state,
      country: country,
    };

    const payload = {
      email: userJson.email,
      first_name: userJson.first_name,
      last_name: userJson.last_name,
      payment_methods: userJson.payment_methods,
      shipping_address: [newAddress],
      spotify_id: userJson.spotify_id,
      cart: userJson.cart,
    };

    API.putPath("user/profile/editUser", payload)
      .then((json) => {
        setAlertDisplay("flex");
        setAlertStatus("success");
        setAlertMessage(json.message);
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          setAlertDisplay("flex");
          setAlertStatus("error");
          setAlertMessage("Didn't receive response from backend");
          return;
        }
        err.json().then((json) => {
          setAlertDisplay("flex");
          setAlertStatus("error");
          setAlertMessage(json.message);
        });
      });
  };

  return (
    <>
      <Heading as="h1" size="xl">
        Shipping Address
      </Heading>
      <Alert status={alertStatus} my="1rem" d={alertDisplay}>
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
      <form onSubmit={handleSubmit}>
        <FormControl my="1rem" id="edit-street">
          <FormLabel>Street Address</FormLabel>
          <Input
            type="text"
            value={streetAddress}
            onChange={(e) => {
              setStreetAddress(e.target.value);
            }}
          />
        </FormControl>
        <FormControl my="1rem" id="edit-city">
          <FormLabel>City or Town</FormLabel>
          <Input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
            }}
          />
        </FormControl>
        <FormControl my="1rem" id="edit-postcode">
          <FormLabel>Postcode</FormLabel>
          <Input
            type="text"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value);
            }}
          />
        </FormControl>
        <FormControl my="1rem" id="edit-state">
          <FormLabel>State</FormLabel>
          <Input
            type="text"
            value={state}
            onChange={(e) => {
              setState(e.target.value);
            }}
          />
        </FormControl>
        <FormControl my="1rem" id="edit-country">
          <FormLabel>Country</FormLabel>
          <Input
            type="text"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
            }}
          />
        </FormControl>
        <Button my="1rem" colorScheme="teal" type="submit">
          Save Changes
        </Button>
      </form>
    </>
  );
};

export default EditShipping;
