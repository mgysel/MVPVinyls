import React from "react";
import { Flex, Heading, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Landing = () => {
  return (
    <Flex
      w="100%"
      maxW="1366px"
      p="1rem"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
    >
      <Heading as="h1" my="1rem" fontSize="4.5em" mt="16%">
        Welcome to MVP Vinyls
      </Heading>
      <Flex justifyContent="space-between" w="100%" maxW="28rem" mt="3rem">
        <Button
          w="10rem"
          h="4rem"
          as={RouterLink}
          to="/login"
          colorScheme="teal"
          size="lg"
          fontSize="1.5em"
        >
          Login
        </Button>
        <Button
          w="10rem"
          h="4rem"
          as={RouterLink}
          to="/register"
          colorScheme="teal"
          size="lg"
          fontSize="1.5em"
        >
          Register
        </Button>
      </Flex>
    </Flex>
  );
};

export default Landing;
