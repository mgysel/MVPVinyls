import { createChatBotMessage } from "react-chatbot-kit";
import ChatLinks from "./ChatLinks";
import ChatRedirect from "./ChatRedirect";
import CustomChatMessage from "./CustomChatMessage";

// Chatbot initial config
const config = {
  botName: "MVP Vinyls Chatbot",
  initialMessages: [
    createChatBotMessage(
      "Hi I'm the MVP Vinyls Chatbot! How can I help you today?"
    ),
    createChatBotMessage("To select a help option please type in the chat:"),
    createChatBotMessage(`Product, Delivery, Warranty`),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "teal",
    },
    chatButton: {
      backgroundColor: "teal",
    },
  },
  customComponents: {
    botChatMessage: (props) => <CustomChatMessage {...props} />,
  },
  widgets: [
    {
      widgetName: "ChatLinks",
      widgetFunc: (props) => <ChatLinks {...props} />,
      mapStateToProps: ["data"],
      props: {},
    },
    {
      widgetName: "ChatRedirect",
      widgetFunc: (props) => <ChatRedirect {...props} />,
      mapStateToProps: ["data"],
      props: {},
    },
  ],
  state: {
    type: null,
  },
};

export default config;
