import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/topBar.css';
import logoPNG from '../assets/icogalleryicon-topbarbg.jpg'
import Login from './login';

function TopBar(props) {
    const { setUser, signOut, toggleModal } = props;
    const navigate = useNavigate();
    const navigateToMain = () => {
        navigate('/');
    }

    // const navigateToPublish = () => {
    //     navigate('/publish');
    // }

    return (
        <div className={'topBar'}>
            <div
                className={'logo'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                <img style={{ height: 30, width: 70 }} src={logoPNG} alt="logo" />
            </div>
            <Login
                onSignIn={setUser}
                onSignOut={signOut}
                toggleModal={toggleModal}
            />
        </div>
    );
}

export default TopBar;