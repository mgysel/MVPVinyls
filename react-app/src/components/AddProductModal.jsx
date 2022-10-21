import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Alert,
  AlertTitle,
  AlertIcon,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import fileToDataUrl from "../helpers/fileToDataUrl";
import API from "../helpers/api";

const AddProductModal = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [albumName, setAlbumName] = useState("");
  const [artist, setArtist] = useState("");
  const [stock, setStock] = useState(0);
  const [genres, setGenres] = useState("");
  const [songs, setSongs] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Add product post
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (image === null) {
      setAlertDisplay("flex");
      setAlertStatus("error");
      setAlertMessage("Please enter all fields");
      return;
    }
    fileToDataUrl(image).then((base64) => {
      const payload = {
        artists: [
          {
            name: artist,
          },
        ],
        songs: songs.split(",").map((s) => {
          return s.trim();
        }),
        album: {
          name: albumName,
        },
        images: base64,
        stock: stock,
        price: price,
        genres: genres.split(",").map((g) => {
          return g.trim();
        }),
      };
      API.postAuthPath("admin/products/add", payload)
        .then((json) => {
          props.setAlertDisplay("flex");
          props.setAlertStatus("success");
          props.setAlertMessage(json.message);
          props.setUpdate(!props.update);
          onClose();
        })
        .catch((err) => {
          if (err instanceof TypeError) {
            setAlertDisplay("flex");
            setAlertStatus("error");
            setAlertMessage("Didn't receive response from backend");
            return;
          }
          err.json().then((json) => {
            setAlertDisplay("flex");
            setAlertStatus("error");
            setAlertMessage(json.message);
          });
        });
    });
  };

  return (
    <>
      <Button mb="1rem" onClick={onOpen} colorScheme="teal">
        Add Product
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a new product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleAddProduct}>
              <FormControl my="1rem" id="add-album-name">
                <FormLabel>Album Name</FormLabel>
                <Input
                  type="text"
                  value={albumName}
                  onChange={(e) => {
                    setAlbumName(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl my="1rem" id="add-artist">
                <FormLabel>Artist</FormLabel>
                <Input
                  type="text"
                  value={artist}
                  onChange={(e) => {
                    setArtist(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl my="1rem" id="add-quantity">
                <FormLabel>Quantity</FormLabel>
                <NumberInput
                  min={1}
                  onChange={(valueString) => setStock(valueString)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl my="1rem" id="add-price">
                <FormLabel>Price</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  onChange={(valueString) => setPrice(valueString)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl my="1rem" id="add-genres">
                <FormLabel>Genres</FormLabel>
                <Textarea
                  placeholder="Comma separated genres"
                  onChange={(e) => {
                    setGenres(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl my="1rem" id="add-songs">
                <FormLabel>Songs</FormLabel>
                <Textarea
                  placeholder="Comma separated songs"
                  onChange={(e) => {
                    setSongs(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl my="1rem" id="add-image">
                <FormLabel>Image</FormLabel>
                <Input
                  type="file"
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                  }}
                />
              </FormControl>
              <Alert status={alertStatus} mt="1rem" d={alertDisplay}>
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
              <Button my="1rem" colorScheme="teal" type="submit">
                Add Product
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddProductModal;
