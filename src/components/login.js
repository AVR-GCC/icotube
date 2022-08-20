import React, { useEffect, useState, useContext } from 'react';
import '../styles/login.css';
import { LogoutRounded, Person } from '@mui/icons-material';
import { TextField, Button } from '@mui/material';
import {
  loginAPI,
  signupAPI,
  // testAuthAPI,
  getMeAPI
} from '../actions/searchAPI';
import { baseURL } from '../actions/server';
import Modal from './modal';
// refresh token
import { getToken, setToken } from '../utils';
import { AppContext } from '../App';

const AuthModal = ({
  onSignIn,
  closeModal
}) => {
  // window.addEventListener("message", ({ data }) => {
  //   console.log('message data', data);
  // });
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        document.getElementById("submit-button").click();
      }
    }
    window.addEventListener('keyup', onKeyDown);
    return () => window.removeEventListener('keyup', onKeyDown)
  }, []);

  const removeErrors = () => {
    if (emailError) setEmailError('');
    if (passwordError) setPasswordError('');
    if (confirmPasswordError) setConfirmPasswordError('');
    if (loginError) setLoginError('');
  };

  const loginUser = (res, isGoogle) => {
    if (res.data) {
      if (res.data.error) {
        setLoginError(res.data.error.message);
      } else {
        console.log('loginUser token', res.data.token);
        setToken(res.data.token);
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
      const res = signupAPI(email, password);
      loginUser(res);
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
  };

  // const loginWithGoogle = () => {
  //   removeErrors();
  //   window.open(`${baseURL}/auth/google`, '_self');
  // };

  const loginWithEmail = async () => {
    removeErrors();
    if (email && password) {
      const res = await loginAPI({
        email,
        password
      });
      loginUser(res);
      return;
    }
    if (!email) {
      setEmailError('Please enter your email');
    }
    if (!password) {
      setPasswordError('Please enter your password');
    }
  };

  const submit = signUp ? signUpWithEmail : loginWithEmail;

  const height = 300
    + (emailError ? 20 : 0)
    + (passwordError ? 20 : 0)
    + (confirmPasswordError ? 20 : 0)
    + (signUp ? 80 : 0)
    + (loginError ? 20 : 0);

  const _title = () => (
    <div className='title' style={{ marginTop: 35 }}>
      {signUp ? "Signup to ICO tube" : "Login to ICO tube"}
    </div>
  );

  const _inputs = () => (
    <React.Fragment>
      <TextField
        error={!!emailError}
        key="email-input"
        id="email-input"
        label="Email"
        required
        variant='outlined'
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
        variant='outlined'
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
          variant='outlined'
          margin='normal'
          fullWidth
          value={confirmPassword}
          onChange={(event) => {
              setConfirmPassword(event.target.value);
          }}
          helperText={confirmPasswordError}
        />
      ) : null}
    </React.Fragment>
  );

  const _loginButton = () => (
    <React.Fragment>
      <Button
        id="submit-button"
        variant="outlined"
        style={{ marginTop: 20, width: '100%' }}
        onClick={submit}
      >
        <span style={{ fontSize: 14 }}>{signUp ? "Signup with Email" : "Login with Email"}</span>
      </Button>
      {loginError ? (
        <div className='error'>{loginError}</div>
      ) : null}
    </React.Fragment>
  );

  // const _divider = () => <div style={{ width: '100%', margin: 10 }}><Divider>or</Divider></div>;

  // const _googleLogin = () => (
  //   <div
  //     className='googleLogin'
  //     style={{ marginTop: '100px' }}
  //     onClick={loginWithGoogle}
  //     // buttonText={signUp ? "Signup with Google" : "Login with Google"}
  //     // onSuccess={onGoogleSuccess}
  //     // onFailure={onFailure}
  //     // cookiePolicy={'single_host_origin'}
  //     // isSignedIn={true}
  //   >
  //     {signUp ? "Signup with Google" : "Login with Google"}
  //   </div>
  // );

  const _signInLogin = () => (
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
  );

  return (
    <Modal
      clickOutside={() => closeModal()}
      height={height}
      width={280}
    >
      <div className='loginModal'>
        {_title()}
        {_inputs()}
        {_loginButton()}
        {/* {_divider()} */}
        {/* {_googleLogin()} */}
        {_signInLogin()}
      </div>
    </Modal>
  );
}

// const testAuth = () => {
//   testAuthAPI(() => {},  (res) => {
//     console.log('testAuth res', res);
//   })
// }

const Login = ({
  openModal = false,
  onSignIn,
  onSignOut
}) => {
  const [modalOpen, setModalOpen] = useState(openModal);
  const appContext = useContext(AppContext);
  const currentUser = appContext?.user;

  useEffect(() => {
    setModalOpen(!modalOpen);
  }, [openModal]);

  useEffect(() => {
    const token = getToken();
    const getMe = async () => {
      const result = await getMeAPI(token);
      if (result?.data?.success) {
        onSignIn({ ...result.data.user });
      } else {
        setToken(null);
      }
    }
    if (!currentUser && token) {
      getMe();
    }
  }, [currentUser, onSignIn]);

  const logout = () => {
    setToken(null);
    window.open(`${baseURL}/auth/logout`, '_self');
  };

  const onFailure = (res) => {
    console.log(`${currentUser ? 'Login' : 'Logout'} failed: res::`, res);
  };

  const _logoutButtons = () => (
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
        onClick={logout}
        className='logoutButton'
      />
    </div>
  );

  const _loginButton = () => (
    <Button variant="outlined" onClick={() => setModalOpen(true)}>Login</Button>
  )

  return (
    <div>
      {modalOpen ? (
        <AuthModal
          onSignIn={onSignIn}
          onFailure={onFailure}
          closeModal={() => setModalOpen(false)}
        />
      ) : null}
      {/* <div
        onClick={testAuth}
      >
        Test Auth
      </div> */}
      {currentUser ? _logoutButtons() : _loginButton()}
    </div>
  );
}

export default Login;