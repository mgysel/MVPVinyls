import React, { useEffect, useState, useContext } from "react";
import {
  Flex,
  Box,
  Heading,
  Button,
  Wrap,
  WrapItem,
  UnorderedList,
  ListItem,
  Text,
  Select,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import VinylCard from "../components/VinylCard";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../helpers/context";
import API from "../helpers/api";

const Search = () => {
  let location = useLocation();
  let q = new URLSearchParams(location.search);
  const [vinyls, setVinyls] = useState([]);
  const [nextPage, setNextPage] = useState(false);
  const [sort, setSort] = useState("alphabetical");
  const [genreList, setGenreList] = useState([]);
  const [genreFilter, setGenreFilter] = useState([]);
  const [numProducts, setNumProducts] = useState("");
  const [page, setPage] = useState(1);

  // States for updating search products
  const context = useContext(StoreContext);
  const searchUpdate = context.searchUpdate[0];
  const [noChangeUpdate, setNoChangeUpdate] = useState(false);

  // Non navbar GET, don't set genre list
  useEffect(() => {
    // Getting vinyls
    const searchQuery = q.toString();
    const genreString = genreFilter.toString();
    API.getPath(
      `product/search?${searchQuery}&page=${page}&genre=${genreString}&order_by=${sort}`
    ).then((json) => {
      setVinyls(json.data.product_list);
      setNumProducts(json.data.total_items);
    });

    API.getPath(
      `product/search?${searchQuery}&page=${
        Number(page) + 1
      }&genre=${genreString}&order_by=${sort}`
    ).then((json) => {
      if (json.data.product_list.length !== 0) {
        setNextPage(true);
      } else {
        setNextPage(false);
      }
    });
    //eslint-disable-next-line
  }, [noChangeUpdate]);

  // On navbar search, reset all and set new genre list
  useEffect(() => {
    setPage(1);
    setGenreFilter([]);
    setSort("alphabetical");
    const searchQuery = q.toString();
    API.getPath(
      `product/search?${searchQuery}&page=${page}&genre=&order_by=${sort}`
    ).then((json) => {
      setGenreList(json.data.genre_list);
    });
    setNoChangeUpdate((noChangeUpdate) => !noChangeUpdate);
    //eslint-disable-next-line
  }, [searchUpdate]);

  // On page change scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchUpdate, noChangeUpdate]);

  // Clicking previous page button
  const handlePrev = () => {
    if (page > 1) {
      setPage((page) => Number(page) - 1);
      setNoChangeUpdate((noChangeUpdate) => !noChangeUpdate);
    }
  };

  // Clicking next page button
  const handleNext = () => {
    if (nextPage === true) {
      setPage((page) => Number(page) + 1);
      setNoChangeUpdate((noChangeUpdate) => !noChangeUpdate);
    }
  };

  // Adding a genre to filter list
  const handleGenreAdd = (idx) => {
    setGenreFilter((genreFilter) => [...genreFilter, genreList[idx]]);

    const copy = [...genreList];
    copy.splice(idx, 1);
    setGenreList(copy);
    setPage(1);
    setNoChangeUpdate((noChangeUpdate) => !noChangeUpdate);
  };

  // Removing a genre from filter list
  const handleGenreRemove = (e, idx) => {
    e.preventDefault();
    setGenreList((genreList) => [...genreList, genreFilter[idx]]);

    const copy = [...genreFilter];
    copy.splice(idx, 1);
    setGenreFilter(copy);
    setPage(1);
    setNoChangeUpdate((noChangeUpdate) => !noChangeUpdate);
  };

  // Handle sort
  const handleSort = (e) => {
    setSort(e.target.value);
    setPage(1);
    setNoChangeUpdate((noChangeUpdate) => !noChangeUpdate);
  };

  return (
    <Flex w="100%" maxW="1366px" mb="2rem">
      <Box maxW="14rem" w="100%" p="1rem" mt="1rem" mr="1rem">
        <Box>
          {genreFilter.length !== 0 && (
            <Heading as="h2" size="md">
              Filters
            </Heading>
          )}
          <UnorderedList listStyleType="None" m="0">
            {genreFilter.map((genre, idx) => (
              <ListItem key={idx} my="0.5rem">
                <Flex
                  p="0.3rem"
                  bg="blue.300"
                  borderRadius="5px"
                  alignItems="center"
                  justifyContent="space-between"
                  _hover={{
                    cursor: "pointer",
                    backgroundColor: "blue.400",
                  }}
                  onClick={(e) => handleGenreRemove(e, idx)}
                >
                  <Text color="white" fontWeight="semibold">
                    {genre}
                  </Text>
                  <CloseIcon color="white" />
                </Flex>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
        <Heading as="h2" size="md">
          Top Genres
        </Heading>
        <UnorderedList listStyleType="None" m="0">
          {genreList.map((genre, idx) => (
            <ListItem key={idx} my="0.8rem">
              <Text
                _hover={{
                  cursor: "pointer",
                  backgroundColor: "gray.200",
                }}
                onClick={() => {
                  handleGenreAdd(idx);
                }}
                fontWeight="semibold"
                p="0.3rem"
                borderRadius="5px"
              >
                {genre}
              </Text>
            </ListItem>
          ))}
        </UnorderedList>
      </Box>
      <Box flexGrow="1">
        <Flex
          alignItems="center"
          justifyContent="space-between"
          my="1rem"
          pr="1rem"
        >
          <Heading as="h1" maxW="75%">
            Exploring {q.get("q")}
          </Heading>
          <Flex alignItems="center">
            <Text fontWeight="semibold" fontSize="1.1em" mx="1rem">
              Sort
            </Text>
            <Select
              borderColor="teal"
              maxW="10rem"
              onChange={handleSort}
              value={sort}
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="price">Price</option>
            </Select>
          </Flex>
        </Flex>
        <Wrap spacing="0.9rem">
          {vinyls.length !== 0 ? (
            vinyls.map((v, idx) => (
              <WrapItem key={idx}>
                <VinylCard
                  albumName={v.album.name}
                  image={v.images[0].url ? v.images[0].url : v.images[0].base64}
                  artist={v.artists[0].name}
                  id={v._id}
                  price={v.price}
                  size="15rem"
                />
              </WrapItem>
            ))
          ) : (
            <Heading as="h3" size="sm">
              No items match your search!
            </Heading>
          )}
        </Wrap>
        <Flex h="max-content" justifyContent="center" mt="2rem">
          <Flex
            justifyContent="space-between"
            maxW="35rem"
            w="100%"
            align="center"
          >
            <Box mx="1rem">
              <Button size="lg" colorScheme="teal" onClick={handlePrev}>
                Previous
              </Button>
            </Box>
            <Text fontWeight="semibold">
              Showing {12 * (page - 1) + vinyls.length} of {numProducts}{" "}
              products
            </Text>
            <Box mx="1rem">
              <Button size="lg" colorScheme="teal" onClick={handleNext}>
                Next Page
              </Button>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Search;
