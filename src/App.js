import React, { useState, useEffect, createContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/sideBar';
import TopBar from './components/topBar';
import { getConfigAPI, loginSuccessAPI } from './actions/searchAPI';
import './styles/app.css';
import Home from './pages/home';
import Publish from './pages/publish';
import Alert from './pages/alert';
import { retryUntilSuccess } from './utils';
import { noop } from 'lodash';
import Notifications from './components/notifications';
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
  const setNotification = useRef(noop);

  useEffect(() => {
    retryUntilSuccess(async () => {
      const res = await getConfigAPI();
      if (res.data) {
        setConfig(res.data);
      }
      return ({ data: { success: !!res.data } });
    });
  }, []);

  useEffect(() => { // check cookie to see if user connected
    loginSuccessAPI().then(result => {
      setUser(result?.data?.user);
    });
  }, []);

  const signOut = () => {
    setUser(null);
  }

  const openLogin = () => {
    setTogglenModal(!toggleModal);
  }

  const homeComponent = <Home openLogin={openLogin} isMobile={isMobile.current} />;
  const publishComponent = user ? <Publish /> : <Navigate to={'/'} />;

  return (
    <AppContext.Provider value={{ user, config, setNotification: setNotification.current }}>
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
            <Notifications
              getUpdate={(func) => {
                setNotification.current = func;
              }}
            />
            <TopBar
              isMobile={isMobile.current}
              currentUser={user}
              setUser={setUser}
              signOut={signOut}
              toggleModal={toggleModal}
            />
            <div className='topContainer'>
              <SideBar
                  isMobile={isMobile.current}
                  currentUser={user}
                  openLogin={openLogin}
              />
              <Routes>
                <Route path="/" element={homeComponent} />
                <Route path="/:category" element={homeComponent} />
                <Route path="/:category/:postId" element={homeComponent} />
                <Route path="/publish" element={publishComponent} />
                <Route path="/publish/:postId" element={publishComponent} />
                <Route path="/alert" element={<Alert />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
