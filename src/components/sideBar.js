import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sideBar.css';

function SideBar(props) {
    const { currentUser } = props;
    console.log('SideBar currentUser', currentUser);
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
                title={currentUser ? 'Publish a new post' : 'Please log in to publish'}
                className={currentUser ? 'publishLink' : 'publishLinkDisabled'}
                onClick={() => {
                    if (currentUser) {
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