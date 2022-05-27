import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getConfigAPI, loginSuccessAPI } from './actions/searchAPI';
import './styles/app.css';
import Home from './pages/home';
import Publish from './pages/publish';
import Login from './components/login';

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
    getConfigAPI(() => {}, (res) => {
      setConfig(res.data);
    })
  }, []);

  // useEffect(() => { for google passport
  //   loginSuccessAPI().then(result => {
  //     console.log('login success reply', result);
  //     setUser(result?.data?.user);
  //   });
  // }, []);

  return (
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
          currentUser={user}
          clientId={config?.clientId}
          onSignIn={newUser => setUser(newUser)}
          onSignOut={() => setUser(null)}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home currentUser={user} />} />
          <Route path="/:postId" element={<Home currentUser={user} />} />
          <Route path="/publish" element={<Publish currentUser={user} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
