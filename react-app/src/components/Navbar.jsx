import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Flex,
  Heading,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  Button,
  AlertDialogCloseButton,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import styled from "styled-components";
import { FaUser, FaShoppingCart } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { StoreContext } from "../helpers/context";
import API from "../helpers/api";

const StyledForm = styled.form`
  width: 60rem;
  margin: 0rem 1rem;
  display: flex;
`;

const Navbar = () => {
  const [searchText, setSearchText] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchType, setSearchType] = useState("all");
  const context = useContext(StoreContext);
  const [loggedIn, setLoggedIn] = context.loggedIn;
  const setSearchUpdate = context.searchUpdate[1];
  let history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();

  // Determine if logged in user is admin or user
  useEffect(() => {
    if (loggedIn) {
      API.getPath("user/profile").then((json) => {
        if (json.data.user.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      });
    }
  }, [loggedIn]);

  // Handle search in navbar
  const handleSearch = (e) => {
    e.preventDefault();
    if (!loggedIn) {
      setSearchText("");
      setIsOpen(true);
      return;
    }
    if (searchType === "all") {
      history.push(`/search?q=${searchText}`);
    } else {
      history.push(`/search?q=${searchText}&type=${searchType}`);
    }
    setSearchText("");
    setSearchUpdate((searchUpdate) => !searchUpdate);
  };

  // Handle clicking shopping cart
  const handleShoppingCart = () => {
    if (!loggedIn) {
      setIsOpen(true);
      return;
    }
    history.push("/cart");
  };

  // Handle clicking logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("delivery_details");
    setLoggedIn(false);
    history.push("/");
  };

  // Alert redirect to login
  const alertLogin = () => {
    onClose();
    history.push("/login");
  };

  // Alert redirect to register
  const alertRegister = () => {
    onClose();
    history.push("/register");
  };

  return (
    <>
      <Flex h="3.5rem" justifyContent="center" bg="gray.700" color="white">
        <Flex
          w="100%"
          maxW="1366px"
          h="100%"
          alignItems="center"
          px="1rem"
          justifyContent="space-between"
        >
          <Heading
            as={RouterLink}
            to={loggedIn ? "/homepage" : "/"}
            minW="max-content"
          >
            MVP Vinyls
          </Heading>
          <StyledForm onSubmit={handleSearch}>
            <InputGroup>
              <Input
                placeholder="Search vinyls..."
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                value={searchText}
              />
              <InputRightElement
                children={
                  <IconButton
                    aria-label="Search vinyls"
                    variant="unstyled"
                    type="submit"
                  >
                    <SearchIcon />
                  </IconButton>
                }
              />
            </InputGroup>
            <Flex
              border="1px"
              borderColor="white"
              borderRadius="5px"
              alignItems="center"
              px="1rem"
              ml="1rem"
            >
              <RadioGroup onChange={setSearchType} value={searchType}>
                <Stack direction="row">
                  <Radio value="all">All</Radio>
                  <Radio value="artist">Artist</Radio>
                  <Radio value="album">Album</Radio>
                  <Radio value="song">Song</Radio>
                </Stack>
              </RadioGroup>
            </Flex>
          </StyledForm>
          <Flex>
            <Menu>
              <MenuButton as={IconButton} color="gray.700" icon={<FaUser />}>
                User
              </MenuButton>
              <MenuList color="black">
                {!loggedIn ? (
                  <>
                    <MenuItem as={RouterLink} to="/login">
                      Login
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/register">
                      Register
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem as={RouterLink} to="/profile/user">
                      View Profile
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem as={RouterLink} to="/admin/dashboard">
                        Admin Panel
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
            <IconButton
              color="gray.700"
              aria-label="View Shopping Cart"
              icon={<FaShoppingCart />}
              ml="1rem"
              onClick={handleShoppingCart}
            />
          </Flex>
        </Flex>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Not logged in
              </AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                Please log in or register to access the website
              </AlertDialogBody>
              <AlertDialogFooter justifyContent="space-between">
                <Button colorScheme="teal" ref={cancelRef} onClick={alertLogin}>
                  Login
                </Button>
                <Button colorScheme="teal" onClick={alertRegister}>
                  Register
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
    </>
  );
};

export default Navbar;
