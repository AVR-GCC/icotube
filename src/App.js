import React, { useState, useEffect, createContext, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SideBar from './components/sideBar';
import TopBar from './components/topBar';
import { getConfigAPI } from './actions/searchAPI';
import './styles/app.css';
import Home from './pages/home';
import Publish from './pages/publish';
import { retryUntilSuccess } from './utils';
export const AppContext = createContext();

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
  const [toggleModal, setTogglenModal] = useState(false);
  const isMobile = useRef(window.matchMedia("only screen and (max-width: 760px)").matches);

  useEffect(() => {
    retryUntilSuccess(async () => {
      const res = await getConfigAPI();
      if (res.data) {
        setConfig(res.data);
      }
      return ({ success: !!res.data });
    });
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

  const openLogin = () => {
    setTogglenModal(!toggleModal);
  }

  return (
    <AppContext.Provider value={{ user, config }}>
      <div className="App">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <div>
          <BrowserRouter>
            <TopBar
              currentUser={user}
              setUser={setUser}
              signOut={signOut}
              toggleModal={toggleModal}
            />
            <div className='topContainer'>
              {!isMobile.current && (
                  <SideBar
                      currentUser={user}
                      openLogin={openLogin}
                  />
              )}
              <Routes>
                <Route path="/" element={<Home openLogin={openLogin} />} />
                <Route path="/:postId" element={<Home openLogin={openLogin} />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/publish/:postId" element={<Publish />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
