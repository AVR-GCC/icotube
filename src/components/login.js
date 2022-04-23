import React, { useState } from 'react';
import '../styles/login.css';
import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { LogoutRounded } from '@mui/icons-material';
import { CircularProgress, TextField, Divider } from '@mui/material';
// refresh token
import { refreshTokenSetup } from '../utils';
import Modal from './modal';

const AuthModal = ({
  clientId,
  onSignIn,
  onFailure,
  closeModal
}) => {
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const onSuccess = (res) => {
    console.log('Login Success: currentUser:', res);
    onSignIn(res.profileObj);
    refreshTokenSetup(res);
    closeModal();
  };

  const loginWithEmail = () => {
    console.log('log in with email');
  }

  return (
    <Modal
      clickOutside={closeModal}
      height={360}
      width={260}
    >
      <div className='loginModal'>
        <div className='title' style={{ marginTop: 35 }}>Log in to ICO tube</div>
        <TextField
            error={!!emailError}
            key="email-input"
            id="email-input"
            label="Email"
            required
            variant='filled'
            margin='normal'
            fullWidth
            value={email}
            onChange={(event) => {
                setEmail(event.target.value);
            }}
            helperText={emailError}
        />
        <TextField
            type="password"
            error={!!passwordError}
            key="password-input"
            id="password-input"
            label="Password"
            required
            variant='filled'
            margin='normal'
            fullWidth
            value={password}
            onChange={(event) => {
                setPassword(event.target.value);
            }}
            helperText={passwordError}
        />
        <div
            className="sButton"
            style={{ marginTop: 20, width: '100%' }}
            onClick={loginWithEmail}
        >
            <span style={{ fontSize: 14 }}>Log in with email</span>
        </div>
        <div style={{ width: '100%', margin: 10 }}><Divider>or</Divider></div>
        <GoogleLogin
          clientId={clientId}
          buttonText="Login with Google"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          style={{ marginTop: '100px' }}
          isSignedIn={true}
        />
        <div className='moveToSignup'>
          Don't have an account? <div
            className='linkText'
            style={{ marginLeft: 15 }}
          >Join</div>
        </div>
      </div>
    </Modal>
  );
}

const Logout = ({
  clientId,
  currentUser,
  onLogoutSuccess,
  onFailure
}) => {
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

const Login = ({
  clientId,
  currentUser,
  onSignIn,
  onSignOut
}) => {
  const [modalOpen, setModalOpen] = useState(false);

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
      {modalOpen ? (
        <AuthModal
          clientId={clientId}
          onSignIn={onSignIn}
          onFailure={onFailure}
          closeModal={() => setModalOpen(false)}
        />
      ) : null}
      {currentUser ? (
        <Logout
          clientId={clientId}
          currentUser={currentUser}
          onLogoutSuccess={onLogoutSuccess}
          onFailure={onFailure}
        />
      ) : (
        <div className="sButton" onClick={() => setModalOpen(true)}>
          Login
        </div>
      )}
    </div>
  );
}

export default Login;