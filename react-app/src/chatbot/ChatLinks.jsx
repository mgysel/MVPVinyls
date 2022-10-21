import React from "react";
import { UnorderedList } from "@chakra-ui/react";
import ChatProductInfo from "./ChatProductInfo";

const ChatLinks = (props) => {
  return (
    <UnorderedList m={0}>
      {props.data.map((product, idx) => (
        <ChatProductInfo
          key={idx}
          album={product.album.name}
          artist={product.artists[0].name}
          src={
            product.images[0].url
              ? product.images[0].url
              : product.images[0].base64
          }
          price={product.price}
          id={product._id}
        />
      ))}
    </UnorderedList>
  );
};

export default ChatLinks;
