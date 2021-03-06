import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import ChatProvider from "./Context/ChatProvider";
import { BrowserRouter } from "react-router-dom";
import theme from "./theme";


ReactDOM.render(
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter>
      <ChatProvider>
        <App />
      </ChatProvider>
    </BrowserRouter>
  </ChakraProvider>,
  document.getElementById("root")
);
