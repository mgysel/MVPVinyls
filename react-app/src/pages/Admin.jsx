import React from "react";
import {
  Flex,
  Box,
  UnorderedList,
  ListItem,
  Link,
  Heading,
} from "@chakra-ui/react";
import { Switch, Route } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";

const Admin = () => {
  return (
    <Flex w="100%" maxW="1366px" p="1rem">
      <Box pt="1rem" h="max-content" mr="1rem">
        <Box w="max-content">
          <Heading as="h2" size="lg">
            Admin Panel
          </Heading>
          <UnorderedList listStyleType="None" mt="1rem">
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/admin/dashboard">
                Dashboard
              </Link>
            </ListItem>
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/admin/products">
                Products
              </Link>
            </ListItem>
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/admin/users">
                Users
              </Link>
            </ListItem>
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/admin/orders">
                Orders
              </Link>
            </ListItem>
          </UnorderedList>
        </Box>
      </Box>
      <Box
        bg="white"
        flexGrow="1"
        p="1rem"
        borderRadius="5px"
        boxShadow="lg"
        ml="0.5rem"
        border="1px solid"
        borderColor="gray.200"
      >
        <Switch>
          <Route exact path="/admin/dashboard">
            <AdminDashboard />
          </Route>
          <Route exact path="/admin/products">
            <AdminProducts />
          </Route>
          <Route exact path="/admin/users">
            <AdminUsers />
          </Route>
          <Route exact path="/admin/orders">
            <AdminOrders />
          </Route>
        </Switch>
      </Box>
    </Flex>
  );
};

export default Admin;
