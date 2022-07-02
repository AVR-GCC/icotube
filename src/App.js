import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getConfigAPI } from './actions/searchAPI';
import './styles/app.css';
import Home from './pages/home';
import Publish from './pages/publish';
import Login from './components/login';
export const UserContext = createContext();

function App() {
  /*
    email: "ogoun.d@gmail.com"
    familyName: "Yehudai"
    givenName: "Bar"
    googleId: "106178580899644455244"
    imageUrl: "https://lh3.googleusercontent.com/a-/AOh14Gh8xeIktOiOMIcEvNBD67DXzBJCkn427UMPw4llMg=s96-c"
    name: "Bar Yehudai"
  */
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const tryGetConfig = async () => {
      const res = await getConfigAPI();
      setConfig(res.data);
      clearInterval(interval);
    };
    const interval = setInterval(tryGetConfig, 10000);
    tryGetConfig();
  }, []);

  // useEffect(() => { for google passport
  //   loginSuccessAPI().then(result => {
  //     console.log('login success reply', result);
  //     setUser(result?.data?.user);
  //   });
  // }, []);

  const signOut = () => {
    setUser(null);
  }

  return (
    <UserContext.Provider value={user}>
      <div className="App">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <div className={'loginContainer'}>
          <Login
            clientId={config?.clientId}
            onSignIn={newUser => setUser(newUser)}
            onSignOut={signOut}
          />
        </div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:postId" element={<Home />} />
            <Route path="/publish" element={<Publish />} />
          </Routes>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
}

export default App;
