import React, { useEffect, useState } from "react";
import {
  Flex,
  Image,
  Text,
  Circle,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Spacer,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import API from "../helpers/api";

const CartItemCard = (props) => {
  const [quantity, setQuantity] = useState(0);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  const [subtotal, setSubtotal] = useState([]);

  useEffect(() => {
    setSubtotal(props.subtotal);
    setQuantity(props.quantity);
  }, [props.quantity, props.subtotal]);

  // Edit item in cart
  const handleEdit = () => {
    let newCart = [...props.cart];
    newCart[props.index].quantity = quantity;

    const data = {
      cart: newCart,
    };

    API.putPath("user/cart/edit", data)
      .then(() => {
        props.setUpdate(!props.update);
        setAlertDisplay("flex");
        setAlertStatus("success");
        setAlertMessage("Cart updated.");
        setSubtotal(props.subtotal + (quantity - props.quantity) * props.price);
      })
      .catch((err) => {
        err.json().then((json) => {
          setAlertDisplay("flex");
          setAlertStatus("error");
          setAlertMessage(json.message);
        });
      });
  };

  // Change handler for inputs
  const handleChange = (value) => setQuantity(value);

  // Delete item from cart
  const handleDelete = () => {
    let newCart = [...props.cart];
    newCart.splice(props.index, 1);
    const data = {
      cart: newCart,
    };
    API.putPath("user/cart/edit", data)
      .then(() => {
        props.setUpdate(!props.update);
      })
      .catch((err) => {
        err.json().then((json) => {
          console.warn(json.message);
        });
      });
  };

  return (
    <Flex bg="white" h="350px" boxShadow="md" mb="30px">
      <Image
        mt="75px"
        ml="50px"
        mb="0.3rem"
        src={props.image}
        alt="Vinyl Image"
        boxShadow="md"
        boxSize="12rem"
      />
      <Flex justify="space-between" flexGrow="1">
        <Flex pl="50px" pt="60px" direction="column">
          <Text fontSize="2xl" fontWeight="semibold">
            {props.albumName}
          </Text>
          <Text fontSize="lg">{props.artist}</Text>
          <Text fontSize="lg">${props.price}</Text>
          <Flex direction="row" mt="45px" mb="10px">
            <Circle mt="6px" mr="10px" size="12px" bg="green"></Circle>
            <Text fontSize="m">In Stock</Text>
          </Flex>
          <Flex>
            <NumberInput
              onChange={handleChange}
              value={quantity}
              min={1}
              w="110px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              colorScheme="teal"
              variant="solid"
              ml="20px"
              onClick={handleEdit}
            >
              Update
            </Button>
          </Flex>
          <Alert
            pr="70px"
            status={alertStatus}
            my="1rem"
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
        <Flex direction="column">
          <Button
            onClick={handleDelete}
            pt="15px"
            mr="15px"
            leftIcon={<DeleteIcon />}
            colorScheme="red"
            variant="link"
          >
            Delete
          </Button>
          <Spacer></Spacer>
          <Flex direction="column" position="relative" right="35px">
            <Text fontSize="lg" fontWeight="semibold">
              Subtotal:{" "}
            </Text>
            <Text pb="45px" fontSize="3xl">
              ${parseFloat(subtotal).toFixed(2)}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CartItemCard;
