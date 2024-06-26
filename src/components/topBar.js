import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/topBar.css';
import logoPNG from '../assets/icogalleryicon-topbarbg.jpg'
import Login from './login';

const pageNames = {
    home: '0xplorer',
    airdrop: 'Airdrops',
    bounty: 'Bounties',
    exchange: 'Exchanges',
    gamefi: 'GameFi',
    icos: 'ICOs',
    staking: 'Staking',
    alert: 'Register for Alerts',
    publish: 'Publish Crypto Project',
    contracts: 'Deploy a Contract'
}

function TopBar(props) {
    const { setUser, signOut, toggleModal, isMobile, title } = props;
    const navigate = useNavigate();
    const navigateToMain = () => {
        navigate('/');
    }

    const page = window?.location?.pathname?.slice(1) || 'home';
    const logoStyle = isMobile ? { transform: 'scale(0.5)', transformOrigin: 0, width: 70 } : {};
    const titleStyle = isMobile ? { fontSize: 14 } : {};

    return (
        <div className={'topBar'}>
            <div
                className={'logo'}
                onClick={navigateToMain}
                style={logoStyle}
            >
                <img style={{ height: 30, width: 70 }} src={logoPNG} alt="logo" />
                <div className='logoText'>ICOTube</div>
            </div>
            {title || <div className='topBarTitle' style={titleStyle}>{pageNames[page]}</div>}
            <Login
                onSignIn={setUser}
                onSignOut={signOut}
                toggleModal={toggleModal}
            />
        </div>
    );
}

export default TopBar;