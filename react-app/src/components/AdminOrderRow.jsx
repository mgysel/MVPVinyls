import React, { useState, useRef } from "react";
import {
  Tr,
  Td,
  Button,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import API from "../helpers/api";

const AdminOrderRow = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();

  // Fulfill this order
  const handleFulfill = () => {
    const payload = {
      order_id: props.id,
    };
    API.putPath("admin/order/fulfill", payload)
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
      <Td>{props.id}</Td>
      <Td>{props.email}</Td>
      <Td>{props.date}</Td>
      <Td>
        <Button colorScheme="blue" as={RouterLink} to={`/order/${props.id}`}>
          View Order
        </Button>
      </Td>
      <Td>
        {props.fulfilled === false ? (
          <Button colorScheme="teal" onClick={() => setIsOpen(true)}>
            Fulfill Order
          </Button>
        ) : (
          <Text>Fulfilled</Text>
        )}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Fulfill
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to fulfill this order?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="teal" onClick={handleFulfill} ml={3}>
                  Fufill
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Td>
    </Tr>
  );
};

export default AdminOrderRow;
