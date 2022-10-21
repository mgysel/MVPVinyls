import "./App.css";
import { Flex } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Navigation from "./pages/Navigation";
import StoreProvider from "./helpers/context";

function App() {
  return (
    <div className="App">
      <StoreProvider>
        <Navbar />
        <Flex
          bg="gray.50"
          flexGrow="1"
          justifyContent="center"
          color="gray.800"
        >
          <Navigation />
        </Flex>
      </StoreProvider>
    </div>
  );
}

export default App;
