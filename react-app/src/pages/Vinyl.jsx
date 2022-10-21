import React, { useEffect, useState } from "react";
import {
  Flex,
  Box,
  ListItem,
  UnorderedList,
  Image,
  Text,
  Heading,
  Circle,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  AlertIcon,
  Button,
  Tabs,
  TabPanel,
  TabPanels,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { FaShoppingCart } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import API from "../helpers/api";
import VinylCard from "../components/VinylCard";

const Vinyl = () => {
  const [id, setID] = useState([]);
  const [artist, setArtist] = useState([]);
  const [album, setAlbum] = useState([]);
  const [image, setImage] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [albumImage, setAlbumImage] = useState("");
  const [product, setProduct] = useState([]);
  const [SKU, setSKU] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [genres, setGenres] = useState([]);
  const [songs, setSongs] = useState([]);
  let { sku } = useParams();
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setAlertDisplay("none");

    // Get data of products that are similar to the current product being displayed
    API.getPath(`product/${sku}/recommend`)
      .then((json) => {
        // Set array of similar product ids 
        let recIDs = [];
        recIDs = json.data.map((product) => product._id);
        setID(recIDs);

        // Set array of similar product artist names
        let recArtists = [];
        recArtists = json.data.map((product) =>
          product.artists.map((res) => res.name)
        );
        setArtist(recArtists);

        // Set array of similar product album names
        let recAlbum = [];
        recAlbum = json.data.map((product) => product.album.name);
        setAlbum(recAlbum);

        // Set array of similar product images
        let recImage = [];
        recImage = json.data.map((product) =>
          product.images.map((res) => (res.url ? res.url : res.base64))
        );
        let imageArray = [];
        for (let i = 0; i < recImage.length; i++) {
          imageArray.push(recImage[i][0]);
        }
        setImage(imageArray);
      })
      .catch((err) => {
        return err;
      });

    // Get data of product to be displayed
    API.getPath(`product/${sku}`).then((json) => {
      setProduct(json.data);
      setAlbumName(json.data.album.name);

      setArtistName(json.data.artists[0].name);

      setAlbumImage(
        json.data.images[0].url
          ? json.data.images[0].url
          : json.data.images[0].base64
      );

      setSKU(json.data._id);

      setPrice(json.data.price);

      setStock(json.data.stock);

      let songArray = [];
      songArray = json.data.songs.map((product) => product.name);
      setSongs(songArray);

      let genreArray = [];
      genreArray = json.data.genres.map((product) => product);
      setGenres(genreArray);
    });
  }, [sku]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    const details = {
      product: product,
      quantity: quantity,
    };

    API.postAuthPath(`user/cart/add`, details)
      .then((json) => {
        setAlertDisplay("flex");
        setAlertStatus("success");
        setAlertMessage("Added to cart.");
      })
      .catch((err) => {
        err.json().then((json) => {
          setAlertDisplay("flex");
          setAlertStatus("error");
          setAlertMessage(json.message);
        });
      });
  };

  const handleQuantity = (e) => {
    setQuantity(e);
  };

  return (
    <Flex w="100%" maxW="1366px" my="20px" direction="column">
      <Flex direction="row">
        <Text as={RouterLink} to="/homepage" fontSize="lg" mr="5px">
          Home /
        </Text>
        <Text
          as={RouterLink}
          to={`/search?q=${artistName}`}
          fontSize="lg"
          mr="5px"
        >
          {artistName} /
        </Text>
        <Text fontWeight="bold" fontSize="lg" mb="25px" mr="5px">
          {albumName}
        </Text>
      </Flex>
      <Flex bg="white" boxShadow="md" flexGrow="1">
        <Image
          w="500px"
          h="500px"
          src={albumImage}
          alt="Vinyl Image"
          boxShadow="md"
        />
        <Flex pt="80px" direction="column" flexGrow="1" pl="80px" pr="80px">
          <Flex borderBottom="1px" justify="space-between" pb="30px">
            <Flex direction="column">
              <Heading size="3xl">{artistName}</Heading>
              <Text pb="10px" fontSize="5xl" mr="5px">
                {albumName}
              </Text>
            </Flex>
            <Text fontSize="60px" mr="5px">
              ${parseFloat(price).toFixed(2)}
            </Text>
          </Flex>
          {stock > 0 ? (
            <Flex pt="50px">
              <Circle mt="3px" mr="15px" size="20px" bg="green"></Circle>
              <Text fontSize="lg">In Stock</Text>
            </Flex>
          ) : (
            <Flex pt="40px">
              <Circle mt="3px" mr="15px" size="20px" bg="red"></Circle>
              <Text fontSize="lg">Out of Stock</Text>
            </Flex>
          )}
          <Flex direction="row" mt="20px">
            <NumberInput
              onChange={handleQuantity}
              defaultValue={quantity}
              min={1}
              w="110px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              leftIcon={<FaShoppingCart />}
              colorScheme="teal"
              variant="solid"
              ml="10px"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
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
        </Flex>
      </Flex>
      <Tabs
        mt="30px"
        mb="40px"
        variant="enclosed-colored"
        colorScheme="teal.500"
      >
        <TabList>
          <Tab bg="white" _selected={{ color: "white", bg: "teal.500" }}>
            Description
          </Tab>
          <Tab bg="white" _selected={{ color: "white", bg: "teal.400" }}>
            Specification
          </Tab>
        </TabList>
        <TabPanels bg="white">
          <TabPanel>
            <Text fontWeight="bold" as="u">
              Tracklist
            </Text>
            {songs.map((id, index) => (
              <UnorderedList key={index}>
                <ListItem>{id}</ListItem>
              </UnorderedList>
            ))}
          </TabPanel>
          <TabPanel>
            <Flex>
              <Box>
                <Text fontWeight="bold">Artist:</Text>
                <Text fontWeight="bold">Album:</Text>
                <Text fontWeight="bold">SKU:</Text>
                <Text fontWeight="bold">Genre(s): </Text>
              </Box>
              <Box pl="100px">
                <Text>{artistName}</Text>
                <Text>{albumName}</Text>
                <Text>{SKU}</Text>
                <Box>
                  {genres.map((id, index) => (
                    <UnorderedList key={index}>
                      <ListItem>{id}</ListItem>
                    </UnorderedList>
                  ))}
                </Box>
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Heading borderTop="1px" borderTopColor="gray.700" pt="20px" mb="20px">
        Similar Products
      </Heading>
      <Flex pt="10px" bg="white" justify="space-around">
        {id.map((id, index) => (
          <VinylCard
            key={index}
            id={`${id}`}
            image={image[index]}
            artist={artist[index]}
            albumName={album[index]}
            onClick={() => {
              setQuantity(1);
              setAlertDisplay("none");
            }}
            size="15rem"
          ></VinylCard>
        ))}
      </Flex>
    </Flex>
  );
};

export default Vinyl;
