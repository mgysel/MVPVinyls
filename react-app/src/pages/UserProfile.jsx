import React, { useEffect, useState } from "react";
import { Heading, Text, Box } from "@chakra-ui/react";
import API from "../helpers/api";

const UserProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [goodAddress, setGoodAddress] = useState(false);

  // Get user profile
  useEffect(() => {
    API.getPath("user/profile")
      .then((json) => {
        setFirstName(json.data.user.first_name);
        setLastName(json.data.user.last_name);
        setEmail(json.data.user.email);
        if (json.data.user.shipping_address.length !== 0) {
          const jsonAdd = json.data.user.shipping_address[0];
          if (jsonAdd.street !== "") {
            setGoodAddress(true);
          }
          setAddress(
            `${jsonAdd.street}, ${jsonAdd.city} ${jsonAdd.postcode}, ${jsonAdd.state}, ${jsonAdd.country}`
          );
        }
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  return (
    <>
      <Heading as="h1" size="xl">
        User Profile
      </Heading>
      <Box my="1rem">
        <Heading as="h2" size="md">
          Name
        </Heading>
        <Text mt="0.5rem">
          {firstName} {lastName}
        </Text>
      </Box>
      <Box my="1rem">
        <Heading as="h2" size="md">
          Email Address
        </Heading>
        <Text mt="0.5rem">{email}</Text>
      </Box>
      <Box my="1rem">
        <Heading as="h2" size="md">
          Shipping Address
        </Heading>
        <Text mt="0.5rem">{goodAddress ? address : "None"}</Text>
      </Box>
    </>
  );
};

export default UserProfile;
