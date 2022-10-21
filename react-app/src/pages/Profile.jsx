import React from "react";
import {
  Flex,
  Box,
  Heading,
  UnorderedList,
  ListItem,
  Link,
} from "@chakra-ui/react";
import { Switch, Route } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import EditProfile from "./EditProfile";
import EditShipping from "./EditShipping";
import ChangePassword from "./ChangePassword";
import UserProfile from "./UserProfile";
import OrderHistory from "./OrderHistory";

const Profile = () => {
  return (
    <Flex w="100%" maxW="1366px" p="1rem">
      <Box py="1rem" h="max-content" mr="1rem">
        <Box>
          <Heading as="h2" size="lg">
            User Management
          </Heading>
          <UnorderedList listStyleType="None" mt="1rem">
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/profile/user">
                Profile
              </Link>
            </ListItem>
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/profile/order-history">
                Order history
              </Link>
            </ListItem>
          </UnorderedList>
        </Box>
        <Box mt="4rem">
          <Heading as="h2" size="lg">
            User Settings
          </Heading>
          <UnorderedList listStyleType="None" mt="1rem">
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/profile/edit-profile">
                Edit profile
              </Link>
            </ListItem>
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/profile/edit-shipping">
                Edit shipping address
              </Link>
            </ListItem>
            <ListItem my="1rem" fontSize="1.1em">
              <Link as={RouterLink} to="/profile/change-password">
                Change password
              </Link>
            </ListItem>
          </UnorderedList>
        </Box>
      </Box>
      <Box
        bg="white"
        flexGrow="1"
        ml="1rem"
        p="2rem"
        boxShadow="lg"
        borderRadius="5px"
        h="max-content"
        border="1px solid"
        borderColor="gray.200"
      >
        <Switch>
          <Route exact path="/profile/user">
            <UserProfile />
          </Route>
          <Route exact path="/profile/order-history">
            <OrderHistory />
          </Route>
          <Route exact path="/profile/edit-profile">
            <EditProfile />
          </Route>
          <Route exact path="/profile/edit-shipping">
            <EditShipping />
          </Route>
          <Route exact path="/profile/change-password">
            <ChangePassword />
          </Route>
        </Switch>
      </Box>
    </Flex>
  );
};

export default Profile;
