import React from 'react';

import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { LogoutRounded } from '@mui/icons-material';
// refresh token
import { refreshTokenSetup } from '../utils';

const clientId = '491980368334-a8a41j6pgefthdu1mc5h9o2ct7dopplp.apps.googleusercontent.com';

function Login({ currentUser, onSignIn, onSignOut }) {
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

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure
  });

  return (
    <div>
      {currentUser ? (
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