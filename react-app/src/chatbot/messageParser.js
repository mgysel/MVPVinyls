class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  // Takes the user sent message and decide what to do with it
  parse(message) {
    const lowercase = message.toLowerCase();
    if (
      lowercase === "product" ||
      lowercase === "delivery" ||
      lowercase === "warranty"
    ) {
      return this.actionProvider.handleType(lowercase);
    }
    if (this.state.type === null) {
      return this.actionProvider.handleEmptyType();
    }
    return this.actionProvider.handleDefault(lowercase, this.state.type);
  }
}

export default MessageParser;
