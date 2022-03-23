import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sideBar.css';

function SideBar(props) {
    const navigate = useNavigate();
    const navigateToMain = () => {
        navigate('/');
    }

    const navigateToPublish = () => {
        navigate('/publish');
    }

    return (
        <div className={'sideBar'}>
            <div
                className={'logo'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                ICO Gallery
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                Upcoming ICOs
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                Ended ICOs
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                Upcoming Airdrops
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                Ended Airdrops
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                Subscribe
            </div>
            <div
                className={'publishLink'}
                onClick={() => {
                    navigateToPublish();
                }}
            >
                Publish
            </div>
        </div>
    );
}

export default SideBar;