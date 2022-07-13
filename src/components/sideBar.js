import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Upcoming, History, NewReleases } from '@mui/icons-material';
import '../styles/sideBar.css';

function SideBar() {
    const appContext = useContext(AppContext);
    const currentUser = appContext?.user;
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
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                <div className="icon"><Upcoming /></div>
                Upcoming ICOs
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                <div className="icon"><NewReleases /></div>
                Running ICOs
            </div>
            <div
                className={'section'}
                onClick={() => {
                    navigateToMain();
                }}
            >
                <div className="icon"><History /></div>
                Ended ICOs
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