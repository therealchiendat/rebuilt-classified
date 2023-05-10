import { useEffect, useState } from 'react';
import { Auth } from "aws-amplify";
import Router from "./Routes";
import Navbar from "./components/Navbar";
import { AppContext } from "./libs/contextLib";
import './App.css';
import {onError} from "./libs/errorLib";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isTransparent, setIsTransparent] = useState<boolean>(true);

  useEffect(() => {
    onLoad();
    function handleScroll() {
      const scrollY = window.scrollY
      if (scrollY > 10) {
        setIsTransparent(false);
      } else {
        setIsTransparent(true);
      }
    }
    window.addEventListener('scroll', handleScroll);
  }, [])

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    }
    catch(e) {
      if (e !== 'No current user') {
        onError(e);
      }
    }
    setIsAuthenticating(false);
  }

  return (
    !isAuthenticating &&
    <div className="App">
      <div className="container">
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
          <Navbar transparent={isTransparent} position="fixed-top" />
          <Router/>
        </AppContext.Provider>
      </div>
    </div>
  );
}

export default App;
