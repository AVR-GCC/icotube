import React, { useEffect, useState, useContext, useRef } from 'react';
import '../styles/login.css';
import { LogoutRounded, Person } from '@mui/icons-material';
import { Button, Divider } from '@mui/material';
import googleLogo from '../assets/google-logo-png-open-2000.png';
import linkedinLogo from '../assets/linkedin-logo-png-open-2000.png';
import {
  loginAPI,
  signupAPI,
  logoutAPI,
  resendConfirmationAPI,
  // testAuthAPI,
  // getMeAPI
} from '../actions/searchAPI';
import { baseURL } from '../actions/server';
import Modal from './modal';
import { AppContext } from '../App';

const AuthModal = ({
  onSignIn,
  closeModal
}) => {
  // window.addEventListener("message", ({ data }) => {
  //   console.log('message data', data);
  // });
  const [showResend, setResendConfirmation] = useState(false);
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
    if (showResend) setResendConfirmation(false);
  };

  const confirmationEmailSent = () => {
    alert('Confirmation email sent');
    closeModal();
  }

  const loginUser = (res) => {
    if (res.data) {
      if (res.data.error) {
        setLoginError(res.data.error.message);
        setResendConfirmation(res.data.showResend);
      } else {
        onSignIn({ ...res.data.user });
        closeModal();
      }
    } else {
      setLoginError('Incorrect email or password');
    }
  }

  const signUpWithEmail = async () => {
    removeErrors();
    if (email && password && confirmPassword && confirmPassword === password) {
      const res = await signupAPI(email, password);
      if (res.data?.success) {
        confirmationEmailSent()
      }
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

  const loginWithGoogle = () => {
    removeErrors();
    window.open(`${baseURL}/auth/google`, '_self');
  };

  const loginWithLinkedIn = () => {
    removeErrors();
    window.open(`${baseURL}/auth/linkedin`, '_self');
  };

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

  const height = 360
    + (signUp ? 80 : 0)
    + 80 // google login
    + 80; // linkedin login

  const _title = () => (
    <div className='title'>
      {signUp ? "Signup to ICO tube" : "Login to ICO tube"}
    </div>
  );

  const _inputs = () => (
    <React.Fragment>
      <input
        style={!emailError ? { marginBottom: 33 } : {}}
        type="text"
        key="email-input"
        id="email-input"
        className='myInput'
        placeholder='Email *'
        value={email}
        onChange={(event) => {
            setEmail(event.target.value);
        }}
      />
      {!!emailError && <div className='errorText'>{emailError}</div>}
      <input
        style={!passwordError ? { marginBottom: 33 } : {}}
        type="password"
        key="password-input"
        id="password-input"
        className='myInput'
        placeholder='Password *'
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      {!!passwordError && <div className='errorText'>{passwordError}</div>}
      {signUp ? (
        <>
          <input
            style={!confirmPasswordError ? { marginBottom: 33 } : {}}
            type="password"
            key="confirm-password-input"
            id="confirm-password-input"
            className='myInput'
            placeholder='Confirm Password *'
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
          {!!confirmPasswordError && <div className='errorText'>{confirmPasswordError}</div>}
        </>
      ) : null}
    </React.Fragment>
  );

  const _loginButton = () => (
    <React.Fragment>
      <Button
        id="submit-button"
        variant="outlined"
        style={{ marginTop: 20, width: '100%', marginBottom: loginError ? 0 : 23 }}
        onClick={submit}
      >
        <span style={{ fontSize: 14 }}>{signUp ? "Signup with Email" : "Login with Email"}</span>
      </Button>
      {loginError ? (
        <div className='errorText'>{loginError}</div>
      ) : null}
      {showResend ? (
        <div
          className='linkText'
          onClick={async () => {
            const res = await resendConfirmationAPI(email);
            if (res?.success) {
              confirmationEmailSent();
            }
          }}
        >
          resend
        </div>
      ) : null}
    </React.Fragment>
  );

  const _divider = () => <div style={{ width: '100%', margin: 10 }}><Divider>or</Divider></div>;

  const _googleLogin = () => (
    <div
      className='googleLogin'
      onClick={loginWithGoogle}
    >
      <img className='googleIcon' alt="google-logo" src={googleLogo} />
      {signUp ? "Signup with Google" : "Login with Google"}
    </div>
  );

  const _linkedInLogin = () => (
    <div
      className='googleLogin'
      onClick={loginWithLinkedIn}
    >
      <img className='googleIcon' alt="linkedin-logo" src={linkedinLogo} />
      {signUp ? "Signup with LinkedIn" : "Login with LinkedIn"}
    </div>
  );

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
      <div className='spacer' />
    </div>
  );

  return (
    <Modal
      clickOutside={closeModal}
      height={height}
      width={300}
    >
      <div className='loginModal'>
        {_title()}
        {_inputs()}
        {_loginButton()}
        {_divider()}
        {_googleLogin()}
        {_linkedInLogin()}
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
  toggleModal = true,
  onSignIn,
  onSignOut
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const appContext = useContext(AppContext);
  const currentUser = appContext?.user;

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      setModalOpen(!modalOpen);
    }
  }, [toggleModal]);

  useEffect(() => {
    mounted.current = true;
    return () => mounted.current = false;
  }, []);

  const logout = async () => {
    await logoutAPI();
    onSignOut();
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