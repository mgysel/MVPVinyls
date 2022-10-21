import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Flex,
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
import { Link as RouterLink } from "react-router-dom";
import API from "../helpers/api";
import { StoreContext } from "../helpers/context";

const Login = () => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const [getEmail, setEmail] = useState("");
  const [getPassword, setPassword] = useState("");
  const history = useHistory();
  const context = useContext(StoreContext);
  const setLoggedIn = context.loggedIn[1];
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Handle login of user
  const handleLogIn = (e) => {
    e.preventDefault();
    const details = {
      email: getEmail,
      password: getPassword,
    };
    API.postPath("auth/login", details)
      .then((json) => {
        localStorage.setItem("token", json["token"]);
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
      <Flex
        boxShadow="lg"
        bg="gray.700"
        w="450px"
        h="450px"
        borderRadius="10px"
        p="40px 60px 0px 60px"
        textAlign="center"
        color="white"
        direction="column"
        justify="space-between"
      >
        <Flex direction="column">
          <Heading pt="20px" pb="30px">
            Login
          </Heading>
          <form onSubmit={handleLogIn}>
            <Input
              bg="white"
              placeholder="Enter username"
              mb="10px"
              color="black"
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputGroup
              size="md"
              bg="white"
              borderRadius="10px"
              mb="20px"
              color="black"
            >
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter password"
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
            <Button type="submit" w="100%" colorScheme="teal" mb="15px">
              Log in
            </Button>
          </form>
          <Alert
            status={alertStatus}
            my="0.5rem"
            d={alertDisplay}
            color="black"
          >
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
        </Flex>
        <Button
          as={RouterLink}
          to="/forgot-password"
          color="white"
          variant="link"
          mb="60px"
        >
          Forgot password?
        </Button>
      </Flex>
    </Flex>
  );
};

export default Login;
