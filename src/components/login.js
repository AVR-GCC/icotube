import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { LogoutRounded } from '@mui/icons-material';
import { CircularProgress, TextField, Divider } from '@mui/material';
import { loginAPI, signupAPI } from '../actions/searchAPI';
import Modal from './modal';
// refresh token
import { refreshTokenSetup } from '../utils';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const removeErrors = () => {
    if (emailError) setEmailError('');
    if (passwordError) setPasswordError('');
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const onSuccess = (res) => {
    console.log('Login Success: currentUser:', res);
    onSignIn(res.profileObj);
    refreshTokenSetup(res);
    closeModal();
  };

  const signUpWithEmail = () => {
    if (email && password && confirmPassword && confirmPassword === password) {
      signupAPI(email, password, () => {},
        (res) => {
          console.log('res', res);
          // onSignIn(res);
        }
      );
      return;
    }
    if (!email) {
      setEmailError('Please enter your email');
    }
    if (!password) {
      setPasswordError('Please enter your password');
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords don't match");
    }
  }

  const loginWithEmail = () => {
    if (email && password) {
      loginAPI(email, password, null, () => {},
        (res) => {
          console.log('res', res);
          // onSignIn(res);
        }
      );
      return;
    }
    if (!email) {
      setEmailError('Please enter your email');
    }
    if (!password) {
      setPasswordError('Please enter your password');
    }
  }

  const height = 360 + (emailError ? 20 : 0) + (passwordError ? 20 : 0) + (confirmPasswordError ? 20 : 0) + (signUp ? 80 : 0);

  return (
    <Modal
      clickOutside={() => closeModal()}
      height={height}
      width={280}
    >
      <div className='loginModal'>
        <div className='title' style={{ marginTop: 35 }}>
          {signUp ? "Signup to ICO tube" : "Login to ICO tube"}
        </div>
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
        {signUp ? (
          <TextField
            type="password"
            error={!!confirmPasswordError}
            key="confirm-password-input"
            id="confirm-password-input"
            label="Confirm Password"
            required
            variant='filled'
            margin='normal'
            fullWidth
            value={confirmPassword}
            onChange={(event) => {
                setConfirmPassword(event.target.value);
            }}
            helperText={confirmPasswordError}
          />
        ) : null}
        <div
            className="sButton"
            style={{ marginTop: 20, width: '100%' }}
            onClick={signUp ? signUpWithEmail : loginWithEmail}
        >
            <span style={{ fontSize: 14 }}>{signUp ? "Signup with Email" : "Login with Email"}</span>
        </div>
        <div style={{ width: '100%', margin: 10 }}><Divider>or</Divider></div>
        <GoogleLogin
          clientId={clientId}
          buttonText={signUp ? "Signup with Google" : "Login with Google"}
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          style={{ marginTop: '100px' }}
          isSignedIn={true}
        />
        <div className='moveToSignup'>
          {signUp ? "Already have an account?" : "Don't have an account?"}
          <div
            className='linkText'
            style={{ marginLeft: 15 }}
            onClick={() => {
              setSignUp(!signUp);
              removeErrors();
            }}
          >
            {signUp ? "Login" : "Join"}
          </div>
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