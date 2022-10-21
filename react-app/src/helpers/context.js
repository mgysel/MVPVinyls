import React from "react";

export const StoreContext = React.createContext(null);

// useContext for navbar
function StoreProvider({ children }) {
  const [loggedIn, setLoggedIn] = React.useState(
    localStorage.getItem("token") ? true : false
  );
  const [searchUpdate, setSearchUpdate] = React.useState(false);

  const store = {
    loggedIn: [loggedIn, setLoggedIn],
    searchUpdate: [searchUpdate, setSearchUpdate],
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export default StoreProvider;
