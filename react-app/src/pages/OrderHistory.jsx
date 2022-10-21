import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import API from "../helpers/api";
import UserOrderRow from "../components/UserOrderRow";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Gets order history
  useEffect(() => {
    API.getPath("order/user")
      .then((json) => {
        setOrders(json.data.orders);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  return (
    <>
      <Heading mb="1rem" as="h1">
        Order History
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
      <Box h="74vh" overflowY="scroll" mt="1rem">
        <Table>
          <Thead>
            <Tr>
              <Th>Order #</Th>
              <Th>Date of order</Th>
              <Th>Items</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((o, idx) => (
              <UserOrderRow
                width="160px"
                key={idx}
                id={o._id}
                items={o.order.map((p) =>
                  p.product.images[0].url
                    ? p.product.images[0].url
                    : p.product.images[0].base64
                )}
                date={o.date.slice(0, o.date.lastIndexOf(","))}
                setAlertStatus={setAlertStatus}
                setAlertDisplay={setAlertDisplay}
                setAlertMessage={setAlertMessage}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

export default OrderHistory;
