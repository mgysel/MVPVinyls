import React, { useEffect, useState } from "react";
import {
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import API from "../helpers/api";

const EditProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userJson, setUserJson] = useState({});
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Get a users profile details
  useEffect(() => {
    API.getPath("user/profile")
      .then((json) => {
        setFirstName(json.data.user.first_name);
        setLastName(json.data.user.last_name);
        setEmail(json.data.user.email);
        setUserJson(json.data.user);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  // Handle form submission of profile details change
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic error handling
    if (firstName === "" || lastName === "" || email === "") {
      setAlertDisplay("flex");
      setAlertStatus("error");
      setAlertMessage("Please enter all fields");
      return;
    }
    const payload = {
      email: email,
      first_name: firstName,
      last_name: lastName,
      payment_methods: userJson.payment_methods,
      shipping_address: userJson.shipping_address,
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
        Edit Profile
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
        <FormControl my="1rem" id="edit-first-name">
          <FormLabel>First Name</FormLabel>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
        </FormControl>
        <FormControl my="1rem" id="edit-last-name">
          <FormLabel>Last Name</FormLabel>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />
        </FormControl>
        <FormControl my="1rem" id="edit-email">
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
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

export default EditProfile;
