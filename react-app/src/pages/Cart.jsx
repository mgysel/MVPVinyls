import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text, Button, Divider } from "@chakra-ui/react";
import CartItemCard from "../components/CartItemCard";
import { Link as RouterLink } from "react-router-dom";
import API from "../helpers/api";

const Cart = () => {
  const [totalQuantity, setTotal] = useState([]);
  const [productList, setProductList] = useState([]);
  const [total, setGrandTotal] = useState("");
  const [cart, setCart] = useState([]);
  const [update, setUpdate] = useState(false);

  // Gets a array of product objects in the user's cart
  useEffect(() => {
    API.getPath("user/profile")
      .then((json) => {
        const productPromises = json.data.user.cart.map((product) => {
          return API.getPath(`product/${product.product_id}`).then((json) => {
            return { product: json.data, quantity: product.quantity };
          });
        });
        Promise.all(productPromises).then((resolvedList) => {
          setProductList(resolvedList);

          // Calculates how many items in the cart
          let total = 0;
          resolvedList.forEach((p) => {
            total += p.quantity;
          });
          setTotal(total);

          // Calculates grand total in cart
          let grandTotal = 0;
          resolvedList.forEach((p) => {
            const subtotal = parseFloat(p.product.price * p.quantity).toFixed(
              2
            );
            grandTotal = parseFloat(grandTotal) + parseFloat(subtotal);
          });
          setGrandTotal(grandTotal);

          setCart(resolvedList);
        });
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, [update]);

  return (
    <Box w="100%" maxW="1366px" p="1rem">
      <Heading pb="25px">Shopping Cart</Heading>
      <Flex justify="space-between">
        <Flex direction="column" flexGrow="1">
          {productList.map((id, index) => (
            <CartItemCard
              key={index}
              image={
                id.product.images[0].url
                  ? id.product.images[0].url
                  : id.product.images[0].base64
              }
              artist={id.product.artists[0].name}
              albumName={id.product.album.name}
              price={id.product.price}
              quantity={id.quantity}
              subtotal={id.quantity * id.product.price}
              cart={cart}
              id={id.product._id}
              index={index}
              update={update}
              setUpdate={setUpdate}
            ></CartItemCard>
          ))}
        </Flex>
        {totalQuantity > 0 ? (
          <Flex direction="column" ml="50px">
            <Flex
              justify="space-between"
              direction="column"
              backgroundColor="white"
              boxShadow="md"
              p="20px 20px 30px 30px"
            >
              <Flex direction="column">
                <Text fontSize="2xl" fontWeight="semibold">
                  Order Summary
                </Text>
                {productList.map((id, idx) => (
                  <>
                    <Flex justify="space-between" key={idx}>
                      <Flex pt="10px">
                        <Heading as="h4" size="sm" mb="0.5rem" mr="0.5rem">
                          {idx + 1}.
                        </Heading>
                        <Box pb="10px">
                          <Heading as="h4" size="sm" mb="0.5rem">
                            {id.product.album.name}
                          </Heading>
                          <Text>{id.product.artists[0].name}</Text>
                        </Box>
                      </Flex>
                      <Box textAlign="right" pt="10px">
                        <Text>
                          <Text display="inline" fontWeight="semibold">
                            Quantity:
                          </Text>{" "}
                          {id.quantity}
                        </Text>
                        <Text>
                          <Text display="inline" fontWeight="semibold">
                            Subtotal:
                          </Text>{" "}
                          $
                          {parseFloat(id.quantity * id.product.price).toFixed(
                            2
                          )}
                        </Text>
                      </Box>
                    </Flex>
                    <Divider />
                  </>
                ))}
              </Flex>
              <Flex mt="1rem" justify="space-between">
                <Heading as="h4" size="sm" fontWeight="bold">
                  Total Items:
                </Heading>
                <Text fontSize="1em" fontWeight="bold">
                  {totalQuantity}PCS
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Heading as="h4" size="sm" fontWeight="bold">
                  Grand Total:
                </Heading>
                <Text fontSize="1em" fontWeight="bold">
                  ${parseFloat(total).toFixed(2)}
                </Text>
              </Flex>
            </Flex>
            <Button
              fontSize="lg"
              colorScheme="teal"
              m="80px 70px 20px 70px"
              p="30px"
              as={RouterLink}
              to="/checkout"
            >
              CHECKOUT
            </Button>
            <Button
              fontSize="lg"
              colorScheme="teal"
              m="0px 70px 70px 70px"
              p="30px"
              as={RouterLink}
              to="/homepage"
            >
              CONTINUE SHOPPING
            </Button>
          </Flex>
        ) : (
          <Flex direction="column" flexGrow="1" w="100%">
            <Flex
              flexGrow="1"
              justify="center"
              align="center"
              direction="column"
              backgroundColor="white"
              h="300px"
              boxShadow="md"
              p="20px 30px 30px 30px"
            >
              <Text fontSize="3xl">No products in cart!</Text>
            </Flex>
            <Button
              fontSize="lg"
              colorScheme="teal"
              m="50px 400px 0px 400px"
              p="30px"
              as={RouterLink}
              to="/homepage"
            >
              CONTINUE SHOPPING
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Cart;
