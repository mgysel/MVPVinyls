import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Flex,
  Box,
  Heading,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import API from "../helpers/api";
import { StoreContext } from "../helpers/context";

const Register = () => {
  const [show, setShow] = React.useState(false);
  const [getEmail, setEmail] = useState("");
  const [getPassword, setPassword] = useState("");
  const [getConfirmPassword, setConfirmPassword] = useState("");
  const [getFirstName, setFirstName] = useState("");
  const [getLastName, setLastName] = useState("");
  const history = useHistory();
  const context = useContext(StoreContext);
  const handleClick = () => setShow(!show);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  const setLoggedIn = context.loggedIn[1];

  // Handle registering a user
  const handleRegister = (e) => {
    e.preventDefault();
    const details = {
      first_name: getFirstName,
      last_name: getLastName,
      email: getEmail,
      password: getPassword,
      confirm_password: getConfirmPassword,
    };
    API.postPath("auth/register", details)
      .then((json) => {
        localStorage.setItem("token", json.token);
        setLoggedIn(true);
        history.push("/homepage");
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
      <Box
        bg="gray.700"
        w="450px"
        h="550px"
        borderRadius="10px"
        p="60px"
        pt="t0px"
        textAlign="center"
        color="white"
      >
        <Heading pb="30px">Register</Heading>
        <form onSubmit={handleRegister}>
          <Input
            bg="white"
            color="black"
            placeholder="First Name"
            mb="10px"
            borderColor="gray.300"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            bg="white"
            color="black"
            placeholder="Last Name"
            mb="10px"
            borderColor="gray.300"
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            bg="white"
            color="black"
            placeholder="Email"
            mb="10px"
            borderColor="gray.300"
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputGroup
            size="md"
            bg="white"
            borderRadius="10px"
            mb="10px"
            borderColor="gray.300"
          >
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Password"
              color="black"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleClick}
                colorScheme="teal"
                bg="gray.700"
                color="white"
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <InputGroup
            size="md"
            bg="white"
            borderRadius="10px"
            mb="20px"
            borderColor="gray.300"
          >
            <Input
              color="black"
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                colorScheme="teal"
                bg="gray.700"
                color="white"
                onClick={handleClick}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <Button type="submit" w="100%" colorScheme="teal">
            Register
          </Button>
        </form>
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
      </Box>
    </Flex>
  );
};

export default Register;
