import React, { useRef, useState } from "react";
import {
  Tr,
  Td,
  Image,
  IconButton,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import API from "../helpers/api";

const AdminProductRow = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();
  // Open the modal
  // Set the edit id to this product so details get displayed in modal
  const handleEdit = () => {
    props.onOpen();
    props.setEditId(props.id);
  };

  // Delete this product
  const handleDelete = () => {
    API.deletePath(`admin/products/remove/${props.id}`)
      .then((json) => {
        props.setAlertDisplay("flex");
        props.setAlertStatus("success");
        props.setAlertMessage(json.message);
        onClose();
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
  };

  return (
    <Tr>
      <Td>
        <Image src={props.image} boxSize="5rem" />
      </Td>
      <Td>{props.name}</Td>
      <Td>{props.artist}</Td>
      <Td>{props.quantity}</Td>
      <Td>${parseFloat(props.price).toFixed(2)}</Td>
      <Td w="10rem">
        <IconButton
          color="white"
          colorScheme="red"
          aria-label="Delete product"
          icon={<DeleteIcon />}
          onClick={() => setIsOpen(true)}
        />
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Product
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to this delete this product
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button ml={3} colorScheme="red" onClick={handleDelete}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <IconButton
          color="white"
          aria-label="Edit product"
          colorScheme="blue"
          icon={<EditIcon />}
          m="1rem"
          onClick={handleEdit}
        />
      </Td>
    </Tr>
  );
};

export default AdminProductRow;
