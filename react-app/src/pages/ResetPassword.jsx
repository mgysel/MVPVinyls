import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Flex,
  Heading,
  Button,
  Input,
  FormControl,
  FormLabel,
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

const ResetPassword = () => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const [getCode, setCode] = useState("");
  const [getPassword, setPassword] = useState("");
  const history = useHistory();
  const context = useContext(StoreContext);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  const setLoggedIn = context.loggedIn[1];

  const handleReset = (e) => {
    e.preventDefault();

    // User enters reset code and resets password
    const details = {
      email: `${localStorage.getItem("email")}`,
      reset_code: getCode,
      password: getPassword,
    };
    API.postPath("auth/reset/reset", details)
      .then((json) => {
        const loginDetails = {
          email: `${localStorage.getItem("email")}`,
          password: getPassword,
        };

        API.postPath("auth/login", loginDetails).then((json) => {
          localStorage.setItem("token", json["token"]);
          setLoggedIn(true);
          history.push("/homepage");
        });
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
        w="520px"
        h="420px"
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
          Reset Password
        </Heading>
        <form onSubmit={handleReset}>
          <FormControl my="1rem" id="reset-code">
            <FormLabel>Enter Reset Code</FormLabel>
            <Input type="text" onChange={(e) => setCode(e.target.value)} />
          </FormControl>
          <FormControl my="1rem" id="new-password" pb="15px">
            <FormLabel>Enter New Password</FormLabel>
            <InputGroup size="md" bg="white" borderRadius="10px" color="black">
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
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
          </FormControl>
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
            <Button type="submit" colorScheme="teal">
              Reset Password
            </Button>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
};

export default ResetPassword;
