import React from 'react';
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
                ICO Tube
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                UPCOMING ICO
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                RUNNING ICO
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                ENDED ICO
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