import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Input,
  Heading,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  Text,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import API from "../helpers/api";
import { SearchIcon } from "@chakra-ui/icons";
import AdminUserRow from "../components/AdminUserRow";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [update, setUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Get admin list of users
  useEffect(() => {
    API.getPath(`admin/permissions/search?q=${searchText}&page=${page}`)
      .then((json) => {
        setUsers(json.user_list);
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          console.warn(`Error: ${err}`);
          return;
        }
        err.json().then((json) => {
          console.warn(`Error: ${json.message}`);
        });
      });
  }, [searchText, update, page]);

  // On searchtext change or search button clicked reset to page 1
  useEffect(() => {
    setPage(1);
  }, [searchText, update]);

  // Does search on timeout
  let timeout = null;
  const updateUsers = (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setSearchText(e.target.value);
    }, 500);
  };

  // Call useEffect to do search
  const handleSearch = (e) => {
    e.preventDefault();
    setUpdate(!update);
  };

  // Go to previous page
  const handlePrevPage = () => {
    if (page > 1) {
      setPage((page) => page - 1);
    }
  };

  // Go to next page
  const handleNextPage = () => {
    API.getPath(
      `admin/permissions/search?q=${searchText}&page=${Number(page) + 1}`
    ).then((json) => {
      if (json.user_list.length !== 0) {
        setPage((page) => page + 1);
      }
    });
  };

  return (
    <>
      <Heading mb="1rem" as="h1">
        Users
      </Heading>
      <Flex justifyContent="space-between">
        <Flex>
          <form onSubmit={handleSearch}>
            <InputGroup w="35rem">
              <Input placeholder="Search users..." onChange={updateUsers} />
              <InputRightElement
                children={
                  <IconButton
                    aria-label="Search users"
                    variant="unstyled"
                    type="submit"
                  >
                    <SearchIcon />
                  </IconButton>
                }
              />
            </InputGroup>
          </form>
        </Flex>
        <Flex align="center">
          <Button colorScheme="teal" onClick={handlePrevPage}>
            Previous page
          </Button>
          <Text mx="2rem" fontWeight="semibold">
            Page {page}
          </Text>
          <Button colorScheme="teal" onClick={handleNextPage}>
            Next page
          </Button>
        </Flex>
      </Flex>
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
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>User Email</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((u, idx) => (
              <AdminUserRow
                key={idx}
                firstName={u.first_name}
                lastName={u.last_name}
                email={u.email}
                role={u.role}
                id={u._id}
                update={update}
                setUpdate={setUpdate}
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

export default AdminUsers;
