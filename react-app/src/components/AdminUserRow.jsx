import React, { useState, useRef } from "react";
import {
  Tr,
  Td,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import API from "../helpers/api";

const AdminuserRow = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();

  // Promote or demote user depending on their role
  const handleAction = () => {
    const payload = {
      _id: props.id,
    };
    const type = props.role === "admin" ? "demote" : "promote";
    API.putPath(`admin/permissions/${type}`, payload)
      .then((json) => {
        props.setAlertDisplay("flex");
        props.setAlertStatus("success");
        props.setAlertMessage(json.message);
        props.setUpdate(!props.update);
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          props.setAlertDisplay("flex");
          props.setAlertStatus("error");
          props.setAlertMessage("Didn't receive response from backend");
          return;
        }
        err.json().then((json) => {
          props.setAlertDisplay("flex");
          props.setAlertStatus("error");
          props.setAlertMessage(json.message);
        });
      });
    onClose();
  };

  return (
    <Tr>
      <Td>{props.firstName}</Td>
      <Td>{props.lastName}</Td>
      <Td>{props.email}</Td>
      <Td>{props.role === "user" ? "User" : "Admin"}</Td>
      <Td>
        <Button
          colorScheme={props.role === "user" ? "green" : "red"}
          onClick={() => setIsOpen(true)}
        >
          {props.role === "user" ? "Promote" : "Demote"}
        </Button>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {props.role === "user" ? "Promote" : "Demote"} User
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to{" "}
                {props.role === "user" ? "promote" : "demote"} this user?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme={props.role === "user" ? "green" : "red"}
                  onClick={handleAction}
                  ml={3}
                >
                  {props.role === "user" ? "Promote" : "Demote"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Td>
    </Tr>
  );
};

export default AdminuserRow;
