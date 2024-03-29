import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Upcoming, History, NewReleases, AlarmAdd, Gavel } from '@mui/icons-material';
import { Divider } from '@mui/material';
import '../styles/sideBar.css';

function SideBar({
    openLogin,
    clickRunning,
    clickEnded,
    clickUpcoming,
    isMobile
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
                className={isMobile ? 'bottomSection' : 'section'}
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
                Upcoming{isMobile ? '' : ' ICOs'}
            </div>
            <div
                className={isMobile ? 'bottomSection' : 'section'}
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
                Running{isMobile ? '' : ' ICOs'}
            </div>
            <div
                className={isMobile ? 'bottomSection' : 'section'}
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
                Ended{isMobile ? '' : ' ICOs'}
            </div>
        </React.Fragment>
    );

    const _contractsPage = () => (
        <div
            className={isMobile ? 'bottomSection' : 'section'}
            style={getStyle('contracts')}
            onClick={() => {
                if (currentUser) {
                    navigate('/contracts');
                } else {
                    openLogin();
                }
            }}
        >
            <div className="icon"><Gavel /></div>
            Contracts
        </div>
    );

    const _alertPage = () => (
        <div
            className={isMobile ? 'bottomSection' : 'section'}
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
        <div className={isMobile ? 'bottomBar' : 'sideBar'}>
            {_icoCategories()}
            {!isMobile && _divider()}
            {_alertPage()}
            {_contractsPage()}
            {!isMobile && _publishButton()}
        </div>
    );
}

export default SideBar;