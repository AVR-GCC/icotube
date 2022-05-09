import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { LogoutRounded, Person } from '@mui/icons-material';
import { CircularProgress, TextField, Divider } from '@mui/material';
import { loginAPI, signupAPI, testAuthAPI, logoutAPI } from '../actions/searchAPI';
import Modal from './modal';
// refresh token
import { refreshTokenSetup } from '../utils';

const AuthModal = ({
  clientId,
  onSignIn,
  onFailure,
  closeModal
}) => {
  window.addEventListener("message", ({ data }) => {
    console.log('message data', data);
  });
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const removeErrors = () => {
    if (emailError) setEmailError('');
    if (passwordError) setPasswordError('');
    if (confirmPasswordError) setConfirmPasswordError('');
    if (loginError) setLoginError('');
  };

  const onGoogleSuccess = (res) => {
    console.log('Login Success Google -', res);

    loginAPI({
      googleToken: res.tokenObj.id_token,
      imageUrl: res.profileObj.imageUrl,
      after: (res) => loginUser(res, true)
    });
    onSignIn(res.profileObj);
    refreshTokenSetup(res);
    closeModal();
  };

  const loginUser = (res, isGoogle) => {
    if (res.data) {
      if (res.data.error) {
        setLoginError(res.data.error.message);
      } else {
        console.log('res', res);
        onSignIn({ ...res.data.user, isGoogle });
        closeModal();
      }
    } else {
      setLoginError('Incorrect email or password');
    }
  }

  const signUpWithEmail = () => {
    removeErrors();
    if (email && password && confirmPassword && confirmPassword === password) {
      signupAPI(email, password, () => {}, loginUser);
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
    removeErrors();
    if (email && password) {
      loginAPI({
        email,
        password,
        after: loginUser
      });
      return;
    }
    if (!email) {
      setEmailError('Please enter your email');
    }
    if (!password) {
      setPasswordError('Please enter your password');
    }
  }

  const height = 360
    + (emailError ? 20 : 0)
    + (passwordError ? 20 : 0)
    + (confirmPasswordError ? 20 : 0)
    + (signUp ? 80 : 0)
    + (loginError ? 20 : 0);

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
        {loginError ? (
            <div className='error'>{loginError}</div>
        ) : null}
        <div style={{ width: '100%', margin: 10 }}><Divider>or</Divider></div>
        <GoogleLogin
          clientId={clientId}
          buttonText={signUp ? "Signup with Google" : "Login with Google"}
          onSuccess={onGoogleSuccess}
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

const testAuth = () => {
  testAuthAPI(() => {},  (res) => {
    console.log('testAuth res', res);
  })
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
      {currentUser?.imageUrl ? (
        <img
          className='avatar'
          src={currentUser?.imageUrl}
          alt='user'
        />
      ) : (
        <Person className='logoutButton' />
      )}
      <LogoutRounded
        onClick={currentUser.isGoogle ? signOut : onLogoutSuccess}
        className='logoutButton'
      />
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
    console.log('Logout Success: user -', res);
    logoutAPI();
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