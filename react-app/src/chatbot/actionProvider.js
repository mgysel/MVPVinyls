import API from "../helpers/api";

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  // Handle chantbot help type change
  handleType = (message) => {
    let response = [
      this.createChatBotMessage(
        `Now helping you with: ${
          message.charAt(0).toUpperCase() + message.slice(1)
        }`
      ),
    ];
    if (message === "product") {
      response.push(
        this.createChatBotMessage(
          "Please enter a query related to the product you are looking for:"
        )
      );
    } else if (message === "warranty") {
      response.push(
        this.createChatBotMessage(
          "Please enter the product name of the warranty details you are looking for:"
        )
      );
    } else if (message === "delivery") {
      response.push(this.createChatBotMessage("Please enter your Order ID:"));
    }
    this.setStateType(message);
    this.addMessageToBotState(response);
  };

  // If a query type has not been selected yet
  handleEmptyType = () => {
    const response = [
      this.createChatBotMessage("Please select a help option first:"),
      this.createChatBotMessage("Product, Delivery, Warranty"),
    ];
    this.addMessageToBotState(response);
  };

  // Handles a message sent by the user
  handleDefault = (message, type) => {
    const payload = {
      type: type,
      message: message,
    };
    API.postAuthPath("chatbot/query", payload)
      .then((json) => {
        if (type === "product") {
          this.handleProduct(json);
        } else if (type === "delivery") {
          this.handleDelivery(json);
        } else if (type === "warranty") {
          this.handleWarranty(json);
        } else {
          const response = this.createChatBotMessage(
            "Unexpected query type. Try refreshing page"
          );
          this.addMessageToBotState(response);
        }
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          console.warn(`Error: ${err}`);
          return;
        }
        err.json().then((json) => {
          let response = this.createChatBotMessage(json.message);
          this.addMessageToBotState(response);
        });
      });
  };

  // Logic for product help type
  handleProduct = (json) => {
    this.removeProductMessages();
    let response = this.createChatBotMessage(
      `Here are some products I found for you!`,
      { widget: "ChatLinks" }
    );
    if (json.data.products.length === 0) {
      response = this.createChatBotMessage(
        "No items match your product query. Try again?"
      );
    }
    this.addDataToState(json.data.products);
    this.addMessageToBotState(response);
  };

  // Logic for delivery help type
  handleDelivery = (json) => {
    this.removeProductMessages();
    const response = this.createChatBotMessage(json.data.reply, {
      widget: "ChatRedirect",
    });
    this.addDataToState({
      type: "order",
      id: json.data.order._id,
    });
    this.addMessageToBotState(response);
  };

  // Logic for warranty help type
  handleWarranty = (json) => {
    this.removeProductMessages();
    const response = this.createChatBotMessage(json.data.reply, {
      widget: "ChatRedirect",
    });
    if (json.data.product._id) {
      this.addDataToState({
        type: "product",
        id: json.data.product._id,
      });
    } else if (json.data.order._id) {
      this.addDataToState({
        type: "order",
        id: json.data.order._id,
      });
    }
    this.addMessageToBotState(response);
  };

  // Remove all previous messages in the chat
  removeProductMessages = () => {
    this.setState((state) => ({
      ...state,
      messages: [],
    }));
  };

  // Sets the messages array for display
  addMessageToBotState = (messages) => {
    // Have the ability to display multiple messages at once
    if (Array.isArray(messages)) {
      this.setState((state) => ({
        ...state,
        messages: [...state.messages, ...messages],
      }));
    } else {
      this.setState((state) => ({
        ...state,
        messages: [...state.messages, messages],
      }));
    }
  };

  // Adds data to chatbot state
  addDataToState = (data) => {
    this.setState((state) => ({
      ...state,
      data: data,
    }));
  };

  // Sets the help option type in state
  setStateType = (type) => {
    this.setState((state) => ({
      ...state,
      type: type,
    }));
  };
}

export default ActionProvider;
