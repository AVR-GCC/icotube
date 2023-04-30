import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { LogoutRounded, Person, AccountBox } from '@mui/icons-material';
import { Button, Divider } from '@mui/material';
import googleLogo from '../assets/google-logo-png-open-2000.png';
import linkedinLogo from '../assets/linkedin-logo-png-open-2000.png';
import {
  loginAPI,
  signupAPI,
  logoutAPI,
  resendConfirmationAPI,
  resetPasswordAPI,
  // testAuthAPI,
  // getMeAPI
} from '../actions/searchAPI';
import { baseURL } from '../actions/server';
import Modal from './modal';
import { AppContext } from '../App';
import { validateEmail } from '../utils';

const AuthModal = ({
  onSignIn,
  closeModal
}) => {
  // window.addEventListener("message", ({ data }) => {
  //   console.log('message data', data);
  // });
  const [showResend, setResendConfirmation] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const { setNotification } = useContext(AppContext);

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
    setNotification({ text: 'Confirmation email was sent', type: 'positive' });
    closeModal();
  }

  const loginUser = (res) => {
    if (res.data) {
      if (res.data.error) {
        setLoginError(res.data.error.message);
        setResendConfirmation(res.data.showResend);
        setNotification({ text: res.data?.error?.message || 'Incorrect email or password', type: 'negative' });
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
    if (email && validateEmail(email) && password && confirmPassword && confirmPassword === password) {
      const res = await signupAPI(email, password);
      if (res.data?.success) {
        confirmationEmailSent();
      } else if (res.data?.error?.message) {
        setNotification({ text: res.data?.error?.message, type: 'negative' });
      }
      return;
    }
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email');
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
    + 80 // linkedin login
    + 20; // forgot password

  const _title = () => (
    <div className='title'>
      {signUp ? "Signup to ICO tube" : "Login to ICO tube"}
    </div>
  );

  const _forgotPasswordTitle = () => (
    <div className='title'>
      Forget your password?
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
        value={forgotPassword ? '' : email}
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

  const _forgotPassword = () => (
    <div className='forgotPassword'>
      <div
        className='linkText'
        style={{ marginLeft: 15 }}
        onClick={() => {
          setForgotPassword(!forgotPassword);
          setSignUp(false);
          removeErrors();
        }}
      >
        Forget password?
      </div>
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

  const _renderForgotPasswordModal = () => (
    <Modal
      clickOutside={() => {
        setForgotPassword(false);
        removeErrors();
      }}
      height={250}
      width={300}
    >
      {_forgotPasswordTitle()}
      <div className='forgotPasswordText'>
        Input the email address you signed up with, click submit, and a new password will be sent to your email address
      </div>
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
      <Button
        id="submit-button"
        variant="outlined"
        style={{ width: '100%' }}
        onClick={() => {
          if (email && validateEmail(email)) {
            resetPasswordAPI(email);
          } else {
            setEmailError('Invalid email address');
          }
        }}
      >
        <span style={{ fontSize: 14 }}>Submit</span>
      </Button>
    </Modal>
  );

  const _renderModal = () => (
      <div className='loginModal'>
        {_title()}
        {_inputs()}
        {_forgotPassword()}
        {_loginButton()}
        {_divider()}
        {_googleLogin()}
        {_linkedInLogin()}
        {_signInLogin()}
      </div>
  );

  return (
    <Modal
      clickOutside={() => {
        if (forgotPassword) setForgotPassword(false);
        else closeModal();
      }}
      height={height}
      width={300}
    >
      {forgotPassword && _renderForgotPasswordModal()}
      {_renderModal()}
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
  const navigate = useNavigate();
  const location = useLocation();

  const appContext = useContext(AppContext);
  const {
    user,
    openMenu
  } = appContext;

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      setModalOpen(!modalOpen);
    }
  }, [toggleModal]);

  useEffect(() => {
    const login = new URLSearchParams(location.search).get('login');
    if (!mounted.current && !!login) {
      navigate(".", { replace: true, search: "" });
      if (!user) {
        setModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => mounted.current = false;
  }, []);

  const logout = async () => {
    await logoutAPI();
    onSignOut();
  };

  const onFailure = (res) => {
    console.log(`${user ? 'Login' : 'Logout'} failed: res::`, res);
  };

  const handleMenu = (e) => {
    openMenu(e, [
      {
        key: 1,
        icon: <LogoutRounded style={{ margin: 5 }} />,
        text: 'Logout',
        onClick: logout
      },
      {
        key: 2,
        icon: <AccountBox style={{ margin: 5 }} />,
        text: 'Change Avatar',
        onClick: () => {
          console.log('Change Avatar');
        }
      }
    ]);
  }

  const _userButtons = () => (
    <div>
      {user?.imageUrl ? (
        <img
          onClick={handleMenu}
          className='avatar'
          src={user?.imageUrl}
          alt='user'
        />
      ) : (
        <Person
          onClick={handleMenu}
          className='logoutButton'
        />
      )}
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
      {user ? _userButtons() : _loginButton()}
    </div>
  );
}

export default Login;