import React from 'react';

import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { LogoutRounded } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
// refresh token
import { refreshTokenSetup } from '../utils';

function Logout({
  clientId,
  currentUser,
  onLogoutSuccess,
  onFailure
}) {
  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure
  });
  return (
    <div>
      <img
        className='avatar'
        src={currentUser?.imageUrl}
        alt='user'
        // style={{
        //   backgroundImage: `url("${currentUser?.imageUrl}")`
        // }}
      />
      <LogoutRounded onClick={signOut} className='logoutButton' />
    </div>
  );
}

function Login({
  clientId,
  currentUser,
  onSignIn,
  onSignOut
}) {
  const onSuccess = (res) => {
    console.log('Login Success: currentUser:', res.profileObj);
    onSignIn(res.profileObj);
    refreshTokenSetup(res);
  };

  const onLogoutSuccess = (res) => {
    console.log('Logout Success: currentUser:', res);
    onSignOut();
  };

  const onFailure = (res) => {
    console.log(`${currentUser ? 'Login' : 'Logout'} failed: res:`, res);
  };

  if (!clientId) {
    return <CircularProgress size={20} />;
  }

  return (
    <div>
      {currentUser ? (
        <Logout
          clientId={clientId}
          currentUser={currentUser}
          onLogoutSuccess={onLogoutSuccess}
          onFailure={onFailure}
        />
      ) : (
        <GoogleLogin
          clientId={clientId}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          style={{ marginTop: '100px' }}
          isSignedIn={true}
        />
      )}
    </div>
  );
}

export default Login;