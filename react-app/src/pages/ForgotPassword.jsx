import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Flex,
  Heading,
  Input,
  Button,
  Text,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import API from "../helpers/api";

const ForgotPassword = () => {
  const [getEmail, setEmail] = useState("");
  const history = useHistory();
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // User gets sent a reset code to their email
  const handleGetCode = (e) => {
    e.preventDefault();
    const details = {
      email: getEmail,
    };
    API.postPath("auth/reset/request", details)
      .then(() => {
        localStorage.setItem("email", getEmail);
        history.push("/reset-password");
      })
      .catch((err) => {
        err.json().then((json) => {
          setAlertDisplay("flex");
          setAlertStatus("error");
          setAlertMessage(json.message);
        });
      });
  };

  return (
    <Flex w="100%" p="1rem" align="center" justify="center">
      <Flex
        direction="column"
        boxShadow="lg"
        bg="white"
        w="500px"
        h="400px"
        borderRadius="10px"
        p="30px"
        pt="20px"
        color="gray.700"
      >
        <Heading
          size="lg"
          pb="20px"
          borderBottom="1px"
          borderBottomColor="gray.200"
        >
          Forgot Password
        </Heading>
        <Text pt="20px">
          Enter your email and we will send a code for you to reset your
          password.
        </Text>
        <Input mt="20px" onChange={(e) => setEmail(e.target.value)}></Input>
        <Alert status={alertStatus} my="1rem" d={alertDisplay} color="black">
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
        <Flex flexGrow="1" align="flex-end" justify="flex-end">
          <Button as={RouterLink} to="/" mr="10px">
            Cancel
          </Button>
          <Button
            onClick={handleGetCode}
            as={RouterLink}
            to="/reset-password"
            colorScheme="teal"
          >
            Continue
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ForgotPassword;
