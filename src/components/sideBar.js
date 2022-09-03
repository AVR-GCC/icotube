import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Upcoming, History, NewReleases } from '@mui/icons-material';
import '../styles/sideBar.css';

function SideBar({
    openLogin,
    clickRunning,
    clickEnded,
    clickUpcoming
}) {
    const appContext = useContext(AppContext);
    const currentUser = appContext?.user;
    const navigate = useNavigate();

    const category = window.location.pathname.split('/')[1];

    const navigateToPublish = () => {
        navigate('/publish');
    }

    const getStyle = section => section === category ? { backgroundColor: 'rgb(255, 255, 255, 0.2)' } : {};

    return (
        <div className={'sideBar'}>
            <div
                className={'section'}
                style={getStyle('')}
                onClick={() => {
                    if (clickUpcoming) {
                        clickUpcoming();
                    } else {
                        navigate('/');
                    }
                }}
            >
                <div className="icon"><Upcoming /></div>
                Upcoming ICOs
            </div>
            <div
                className={'section'}
                style={getStyle('running')}
                onClick={() => {
                    if (clickRunning) {
                        clickRunning();
                    } else {
                        navigate('/running');
                    }
                }}
            >
                <div className="icon"><NewReleases /></div>
                Running ICOs
            </div>
            <div
                className={'section'}
                style={getStyle('ended')}
                onClick={() => {
                    if (clickEnded) {
                        clickEnded();
                    } else {
                        navigate('/ended');
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