import React from "react";
import { Box, Image, Text, LinkBox, LinkOverlay } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const VinylCard = (props) => {
  return (
    <LinkBox
      m="0.5rem"
      _hover={{
        textDecoration: "underline",
      }}
    >
      <Box w={props.size}>
        <Image
          mb="0.3rem"
          src={props.image}
          alt="Vinyl Image"
          boxShadow="md"
          boxSize={props.size}
        />
        <LinkOverlay as={RouterLink} to={`/vinyl/${props.id}`}>
          <Box>
            <Text isTruncated fontWeight="semibold">
              {props.albumName}
            </Text>
            <Text fontSize="0.9em">{props.artist}</Text>
          </Box>
          {props.price && (
            <Text fontWeight="bold">${parseFloat(props.price).toFixed(2)}</Text>
          )}
        </LinkOverlay>
      </Box>
    </LinkBox>
  );
};

export default VinylCard;
