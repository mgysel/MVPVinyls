import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
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

const EditProductModal = (props) => {
  const [albumName, setAlbumName] = useState("");
  const [artist, setArtist] = useState("");
  const [stock, setStock] = useState(0);
  const [genres, setGenres] = useState("");
  const [songs, setSongs] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);
  const [ogImage, setOgImage] = useState("");
  const [alertStatus, setAlertStatus] = useState("error");
  const [alertDisplay, setAlertDisplay] = useState("none");
  const [alertMessage, setAlertMessage] = useState("");

  // Get details and fill in form with product details
  useEffect(() => {
    if (props.id === -1) {
      return;
    }
    API.getPath(`product/${props.id}`).then((json) => {
      setAlbumName(json.data.album.name);
      setArtist(json.data.artists[0].name);
      setStock(json.data.stock);
      setPrice(json.data.price);
      setGenres(json.data.genres.toString());
      setSongs(
        json.data.songs
          .map((songObj) => {
            return songObj.name;
          })
          .toString()
      );
      setOgImage(
        json.data.images[0].url
          ? json.data.images[0].url
          : json.data.images[0].base64
      );
    });
  }, [props.id]);

  // Put edit product
  const editProduct = (toChangeImage) => {
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
      images: toChangeImage,
      stock: stock,
      price: price,
      genres: genres.split(",").map((g) => {
        return g.trim();
      }),
    };
    API.putPath(`admin/products/edit/${props.id}`, payload)
      .then((json) => {
        props.setAlertDisplay("flex");
        props.setAlertStatus("success");
        props.setAlertMessage(json.message);
        props.setUpdate(!props.update);
        setImage(null);
        props.onClose();
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
  };

  // Handle edit
  // Either convert new image to base64 or use original image
  const handleEditProduct = (e) => {
    e.preventDefault();
    if (image !== null) {
      try {
        fileToDataUrl(image).then((base64) => {
          editProduct(base64);
        });
      } catch (err) {
        setAlertDisplay("flex");
        setAlertStatus("error");
        setAlertMessage(err.toString());
      }
    } else {
      editProduct(ogImage);
    }
  };

  return (
    <>
      <Modal
        isOpen={props.isOpen}
        onClose={props.onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleEditProduct}>
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
                  value={stock}
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
                  value={price}
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
                  value={genres}
                />
              </FormControl>
              <FormControl my="1rem" id="add-songs">
                <FormLabel>Songs</FormLabel>
                <Textarea
                  placeholder="Comma separated songs"
                  onChange={(e) => {
                    setSongs(e.target.value);
                  }}
                  value={songs}
                />
              </FormControl>
              <FormControl my="1rem" id="add-image">
                <FormLabel>Change Image</FormLabel>
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
                Edit Product
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProductModal;
