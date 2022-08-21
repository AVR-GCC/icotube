import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Upcoming, History, NewReleases } from '@mui/icons-material';
import '../styles/sideBar.css';

function SideBar({
    openLogin,
    clickRunning,
    clickEnded
}) {
    const appContext = useContext(AppContext);
    const currentUser = appContext?.user;
    const navigate = useNavigate();

    const navigateToPublish = () => {
        navigate('/publish');
    }

    return (
        <div className={'sideBar'}>
            <div
                className={'section'}
                onClick={() => {
                    navigate('/');
                }}
            >
                <div className="icon"><Upcoming /></div>
                Upcoming ICOs
            </div>
            <div
                className={'section'}
                onClick={() => {
                    if (clickRunning) {
                        clickRunning();
                    } else {
                        navigate('/?scrollTo=running');
                    }
                }}
            >
                <div className="icon"><NewReleases /></div>
                Running ICOs
            </div>
            <div
                className={'section'}
                onClick={() => {
                    if (clickEnded) {
                        clickEnded();
                    } else {
                        navigate('/?scrollTo=ended');
                    }
                }}
            >
                <div className="icon"><History /></div>
                Ended ICOs
            </div>
            <div
                title={currentUser ? 'Publish a new post' : 'Please log in to publish'}
                className={'publishLink'}
                onClick={() => {
                    if (currentUser) {
                        navigateToPublish();
                    } else {
                        openLogin();
                    }
                }}
            >
                Publish
            </div>
        </div>
    );
}

export default SideBar;