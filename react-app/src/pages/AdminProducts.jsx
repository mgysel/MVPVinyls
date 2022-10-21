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
  Text,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
  useDisclosure,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import AdminProductRow from "../components/AdminProductRow";
import AddProductModal from "../components/AddProductModal";
import API from "../helpers/api";
import { SearchIcon } from "@chakra-ui/icons";
import EditProductModal from "../components/EditProductModal";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("alphabetical");
  const [update, setUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  // Edit product modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editId, setEditId] = useState(-1);

  // Get list of products
  useEffect(() => {
    API.getPath(
      `product/search?q=${searchText}&order_by=${sort}&page=${page}`
    ).then((json) => {
      setProducts(json.data.product_list);
    });
  }, [update, sort, searchText, page]);

  // Automatic search for admin on search text change
  let timeout = null;
  const updateProducts = (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setSearchText(e.target.value);
    }, 500);
  };

  // Handle admin product search
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
      `product/search?q=${searchText}&order_by=${sort}&page=${Number(page) + 1}`
    ).then((json) => {
      if (json.data.product_list.length !== 0) {
        setPage((page) => page + 1);
      }
    });
  };

  return (
    <>
      <Heading as="h1" mb="1rem">
        Products
      </Heading>

      <EditProductModal
        isOpen={isOpen}
        onClose={onClose}
        id={editId}
        setUpdate={setUpdate}
        update={update}
        setAlertDisplay={setAlertDisplay}
        setAlertMessage={setAlertMessage}
        setAlertStatus={setAlertStatus}
      />
      <Flex justifyContent="space-between">
        <Flex>
          <AddProductModal
            update={update}
            setUpdate={setUpdate}
            setAlertDisplay={setAlertDisplay}
            setAlertMessage={setAlertMessage}
            setAlertStatus={setAlertStatus}
          />
          <form onSubmit={handleSearch}>
            <InputGroup ml="1rem" w="35rem">
              <Input placeholder="Search vinyls..." onChange={updateProducts} />
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
          </form>
        </Flex>
        <Flex alignItems="center">
          <Text fontWeight="semibold" fontSize="1.1em" mx="1rem">
            Sort
          </Text>
          <Select
            borderColor="teal"
            maxW="10rem"
            onChange={(e) => {
              setSort(e.target.value);
            }}
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="price">Price</option>
          </Select>
        </Flex>
      </Flex>
      <Flex justify="flex-end" align="center" mb="1rem">
        <Alert status={alertStatus} d={alertDisplay} mr="1rem">
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
        <Flex w="min-content" align="center">
          <Button colorScheme="teal" onClick={handlePrevPage}>
            Previous page
          </Button>
          <Text mx="2rem" fontWeight="semibold" w="max-content">
            Page {page}
          </Text>
          <Button colorScheme="teal" onClick={handleNextPage}>
            Next page
          </Button>
        </Flex>
      </Flex>
      <Box h="68vh" overflowY="scroll" mt="1rem">
        <Table>
          <Thead>
            <Tr>
              <Th>Album Cover</Th>
              <Th>Album Name</Th>
              <Th>Artist</Th>
              <Th>Quantity</Th>
              <Th>Price ($)</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((p, idx) => (
              <AdminProductRow
                key={idx}
                image={p.images[0].url ? p.images[0].url : p.images[0].base64}
                name={p.album.name}
                artist={p.artists[0].name}
                quantity={p.stock}
                price={p.price}
                id={p._id}
                onOpen={onOpen}
                setEditId={setEditId}
                update={update}
                setUpdate={setUpdate}
                setAlertDisplay={setAlertDisplay}
                setAlertMessage={setAlertMessage}
                setAlertStatus={setAlertStatus}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

export default AdminProducts;
