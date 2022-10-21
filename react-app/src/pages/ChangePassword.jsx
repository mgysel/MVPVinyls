import React, { useState } from "react";
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
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import API from "../helpers/api";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Handle change password submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic error handling
    if (currentPassword === "" || newPassword === "") {
      setAlertDisplay("flex");
      setAlertStatus("error");
      setAlertMessage("Please enter all fields");
      return;
    }
    const payload = {
      old_password: currentPassword,
      new_password: newPassword,
    };
    API.putPath("user/profile/editUserPassword", payload)
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

  const handleShow = () => setShow(!show);

  return (
    <>
      <Heading as="h1" size="xl">
        Change Password
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
        <FormControl my="1rem" id="current-pass">
          <FormLabel>Current Password</FormLabel>
          <InputGroup>
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleShow}
                colorScheme="teal"
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl my="1rem" id="new-pass">
          <FormLabel>New Password</FormLabel>
          <InputGroup>
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleShow}
                colorScheme="teal"
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button my="1rem" colorScheme="teal" type="submit">
          Change password
        </Button>
      </form>
    </>
  );
};

export default ChangePassword;
