import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sideBar.css';

function SideBar(props) {
    const { currentUser } = props;
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
                className={currentUser ? 'publishLink' : 'publishLinkDisabled'}
                onClick={() => {
                    if (currentUser || true) {
                        navigateToPublish();
                    }
                }}
            >
                Publish
            </div>
        </div>
    );
}

export default SideBar;