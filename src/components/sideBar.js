import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Upcoming, History, NewReleases, AlarmAdd } from '@mui/icons-material';
import { Divider } from '@mui/material';
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

    const _icoCategories = () => (
        <React.Fragment>
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
        </React.Fragment>
    );

    const _alertPage = () => (
        <div
            className={'section'}
            style={getStyle('alert')}
            onClick={() => {
                navigate('/alert');
            }}
        >
            <div className="icon"><AlarmAdd /></div>
            Alert
        </div>
    );

    const _publishButton = () => (
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
    )

    const _divider = () => (
        <Divider style={{ width: '95%', margin: 5, background: 'rgb(255, 255, 255, 0.1)' }} variant="middle" />
    );

    return (
        <div className={'sideBar'}>
            {_icoCategories()}
            {_divider()}
            {_alertPage()}
            {_publishButton()}
        </div>
    );
}

export default SideBar;