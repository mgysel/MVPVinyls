import React from "react";
import { Tr, Td, Button, Image, Wrap, WrapItem } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

const UserOrderRow = (props) => {
  let history = useHistory();
  // Redirect to order page
  const handleViewOrder = () => {
    history.push(`/order/${props.id}`);
  };

  return (
    <Tr>
      <Td>{props.id}</Td>
      <Td w={props.width}>{props.date}</Td>
      <Td>
        <Wrap>
          {props.items.map((image, idx) => {
            return (
              <WrapItem key={idx}>
                <Image
                  src={image}
                  alt="Vinyl Image"
                  boxShadow="md"
                  boxSize="5rem"
                />
              </WrapItem>
            );
          })}
        </Wrap>
      </Td>
      <Td>
        <Button colorScheme="teal" onClick={handleViewOrder}>
          View Details
        </Button>
      </Td>
    </Tr>
  );
};

export default UserOrderRow;
