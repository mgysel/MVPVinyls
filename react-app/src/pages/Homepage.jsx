import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Heading,
  Flex,
  Wrap,
  WrapItem,
  Button,
  Text,
  IconButton,
  Icon,
  Box,
} from "@chakra-ui/react";
import API from "../helpers/api";
import VinylCard from "../components/VinylCard";
import { FaSpotify } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { Chatbot } from "react-chatbot-kit";
import config from "../chatbot/config";
import ActionProvider from "../chatbot/actionProvider";
import MessageParser from "../chatbot/messageParser";
import "../Chatbot.css";

const Homepage = () => {
  const [name, setName] = useState("");
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [orderRecommendations, setOrderRecommendations] = useState([]);
  const [spotifySuggested, setSpotifySuggested] = useState([]);
  const [orderSuggested, setOrderSuggested] = useState([]);
  const [URL, setURL] = useState("");
  const [clicked, setClicked] = useState(false);
  const [chatDisplay, setChatDisplay] = useState("none");

  let location = useLocation();
  let q = new URLSearchParams(location.search);

  useEffect(() => {
    API.getPath("user/profile")
      .then((json) => {
        setName(json.data.user.first_name);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });

    // Gets recommendations based on their past order
    // If no past orders, suggestions get displayed
    API.getPath("/product/recommend_orders")
      .then((json) => {
        setOrderRecommendations(json.data.recommended);
        setOrderSuggested(json.data.suggested);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });

    // Gets recommendations based on user's top spotify genres after logging into spotify
    API.getPath(`product/recommend_top_spotify?${q.toString()}`)
      .then((json) => {
        if (json.status === "success") {
          setSpotifyRecommendations(json.data.recommended);
          setSpotifySuggested(json.data.suggested);
        } else if (json.status === "request") {
          setURL(json.data);
        }
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
    if (clicked) {
      window.location.assign(URL);
    }
    //eslint-disable-next-line
  }, [clicked]);

  // Handle visibility of chatbot
  const handleChat = () => {
    if (chatDisplay === "none") {
      setChatDisplay("block");
    } else {
      setChatDisplay("none");
    }
  };

  return (
    <Flex w="100%" maxW="1366px" p="1rem" direction="column">
      {orderRecommendations.length === 0 ? (
        <Flex direction="column" justify="space-between">
          <Heading align="center" my="1rem">
            Welcome to MVP Vinyls, {name}!
          </Heading>
          {spotifySuggested.length === 0 ? (
            <Flex direction="column" align="center">
              <Text fontWeight="600" pt="10px" fontSize="lg">
                Want product recommendations?
              </Text>
              <Button
                onClick={() => setClicked(true)}
                mb="35px"
                leftIcon={<FaSpotify />}
                bg="#1ed760"
                w="300px"
                colorScheme="green"
                variant="solid"
              >
                Continue with Spotify
              </Button>
            </Flex>
          ) : (
            <>
              {spotifyRecommendations.length === 0 ? (
                <></>
              ) : (
                <>
                  <Text fontWeight="600" pb="10px" fontSize="2xl">
                    Based off your Top Spotify Genres
                  </Text>
                  <Wrap spacing="0.9rem">
                    {spotifyRecommendations.map((id, index) => (
                      <WrapItem key={index}>
                        <VinylCard
                          albumName={id.album.name}
                          image={
                            id.images[0].url
                              ? id.images[0].url
                              : id.images[0].base64
                          }
                          artist={id.artists[0].name}
                          id={id._id}
                          price={id.price}
                          size="14.9rem"
                        />
                      </WrapItem>
                    ))}
                  </Wrap>
                </>
              )}
            </>
          )}
          <Text fontWeight="600" pb="10px" pt="20px" fontSize="2xl">
            Based off your past purchases
          </Text>
          <Flex
            justify="space-between"
            direction="column"
            backgroundColor="white"
            boxShadow="md"
            p="20px 20px 30px 30px"
          >
            <Text align="center">No past orders!</Text>
            <Text align="center">
              Shop suggestions below for recommendations.{" "}
            </Text>
          </Flex>
          <Text fontWeight="600" pt="30px" fontSize="2xl">
            Suggestions
          </Text>
          <Wrap spacing="0.9rem">
            {orderSuggested.map((id, index) => (
              <WrapItem key={index}>
                <VinylCard
                  albumName={id.album.name}
                  image={
                    id.images[0].url ? id.images[0].url : id.images[0].base64
                  }
                  artist={id.artists[0].name}
                  id={id._id}
                  price={id.price}
                  size="14.9rem"
                />
              </WrapItem>
            ))}
          </Wrap>
        </Flex>
      ) : (
        <>
          <Heading align="center" my="1rem">
            Recommended for you, {name}!
          </Heading>
          <Text fontWeight="600" pb="10px" fontSize="2xl">
            Based off your past purchases
          </Text>
          <Wrap spacing="0.9rem">
            {orderRecommendations.map((id, index) => (
              <WrapItem key={index}>
                <VinylCard
                  albumName={id.album.name}
                  image={
                    id.images[0].url ? id.images[0].url : id.images[0].base64
                  }
                  artist={id.artists[0].name}
                  id={id._id}
                  price={id.price}
                  size="14.9rem"
                />
              </WrapItem>
            ))}
          </Wrap>
          {spotifySuggested.length === 0 ? (
            <>
              {spotifyRecommendations.length === 0 ? (
                <>
                  <Flex direction="column" align="center" pt="50px">
                    <Text fontWeight="600" pb="10px" fontSize="lg">
                      Want more product recommendations?
                    </Text>
                    <Button
                      onClick={() => setClicked(true)}
                      mb="35px"
                      leftIcon={<FaSpotify />}
                      bg="#1ed760"
                      w="300px"
                      colorScheme="green"
                      variant="solid"
                    >
                      Continue with Spotify
                    </Button>
                  </Flex>
                </>
              ) : (
                <>
                  <Text fontWeight="600" pb="10px" pt="20px" fontSize="2xl">
                    Based off your Top Spotify Genres
                  </Text>
                  <Wrap spacing="0.9rem">
                    {spotifyRecommendations.map((id, index) => (
                      <WrapItem key={index}>
                        <VinylCard
                          albumName={id.album.name}
                          image={
                            id.images[0].url
                              ? id.images[0].url
                              : id.images[0].base64
                          }
                          artist={id.artists[0].name}
                          id={id._id}
                          price={id.price}
                          size="14.9rem"
                        />
                      </WrapItem>
                    ))}
                  </Wrap>
                </>
              )}
            </>
          ) : (
            <>
              {spotifyRecommendations.length === 0 ? (
                <>
                  <Text fontWeight="600" pt="30px" pb="10px" fontSize="2xl">
                    Suggestions
                  </Text>
                  <Wrap spacing="0.9rem">
                    {spotifySuggested.map((id, index) => (
                      <WrapItem key={index}>
                        <VinylCard
                          albumName={id.album.name}
                          image={
                            id.images[0].url
                              ? id.images[0].url
                              : id.images[0].base64
                          }
                          artist={id.artists[0].name}
                          id={id._id}
                          price={id.price}
                          size="14.9rem"
                        />
                      </WrapItem>
                    ))}
                  </Wrap>
                </>
              ) : (
                <>
                  <Text fontWeight="600" pb="10px" pt="20px" fontSize="2xl">
                    Based off your Top Spotify Genres
                  </Text>
                  <Wrap spacing="0.9rem">
                    {spotifyRecommendations.map((id, index) => (
                      <WrapItem key={index}>
                        <VinylCard
                          albumName={id.album.name}
                          image={
                            id.images[0].url
                              ? id.images[0].url
                              : id.images[0].base64
                          }
                          artist={id.artists[0].name}
                          id={id._id}
                          price={id.price}
                          size="14.9rem"
                        />
                      </WrapItem>
                    ))}
                  </Wrap>
                  <Text fontWeight="600" pb="10px" pt="20px" fontSize="2xl">
                    Suggestions
                  </Text>
                  <Wrap spacing="0.9rem">
                    {spotifySuggested.map((id, index) => (
                      <WrapItem key={index}>
                        <VinylCard
                          albumName={id.album.name}
                          image={
                            id.images[0].url
                              ? id.images[0].url
                              : id.images[0].base64
                          }
                          artist={id.artists[0].name}
                          id={id._id}
                          price={id.price}
                          size="14.9rem"
                        />
                      </WrapItem>
                    ))}
                  </Wrap>
                </>
              )}
            </>
          )}
        </>
      )}
      <Box>
        <Flex align="flex-end" position="fixed" bottom="3%" right="8%">
          <Box display={chatDisplay}>
            <Chatbot
              config={config}
              actionProvider={ActionProvider}
              messageParser={MessageParser}
            />
          </Box>
          <IconButton
            colorScheme="teal"
            aria-label="Chatbot open-close"
            size="lg"
            isRound="true"
            boxSize="4rem"
            bottom="1rem"
            ml="2rem"
            icon={<Icon as={BsChatDotsFill} boxSize="2rem" />}
            onClick={handleChat}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default Homepage;