import React from "react";
import { Tr, Td, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const OrderRow = (props) => {
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
    </Tr>
  );
};

export default OrderRow;
