

import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Layout from "./components/Layout";
import "./styles/style.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <>
      {!loggedIn ? (
        <Login onSuccess={() => setLoggedIn(true)} />
      ) : (
        <Layout onLogout={() => setLoggedIn(false)} />
      )}
    </>
  );
}

export default App;

