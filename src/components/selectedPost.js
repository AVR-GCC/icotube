import React, { useState, useRef, useEffect, useContext } from 'react';
import '../styles/selectedPost.css';
import {
    FullscreenRounded,
    ReplyRounded,
    ArrowBackIosNewRounded,
    ArrowForwardIosRounded,
    Close
} from '@mui/icons-material';
import { deletePostAPI } from '../actions/searchAPI';
import { Button, Divider } from '@mui/material';
import ReactPlayer from 'react-player';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { fields } from '../constants/postFields';

const fieldsToNotShow = [
    'email',
    'videoUrl'
];

function SelectedPost({
    post,
    rightClick,
    leftClick,
    XClick,
    removePost
}) {
    const [playerSize, setPlayerSize] = useState({ height: 360, width: 640 });
    const playerPartRef = useRef();
    const appContext = useContext(AppContext);
    const currentUser = appContext?.user;
    const allowEdit = currentUser && !!post && (
        currentUser.email === post.email
        || appContext?.config?.freePostWhitelist?.includes(currentUser.email)
    );
    const navigate = useNavigate();

    useEffect(() => {
        if (playerPartRef.current) {
            const goodRatio = 64 / 36;
            const thisRatio = playerPartRef.current.offsetWidth / playerPartRef.current.offsetHeight;
            let height = 360;
            let width = 640;
            if (thisRatio > goodRatio) {
                height = playerPartRef.current.offsetHeight;
                width = goodRatio * height;
            } else {
                width = playerPartRef.current.offsetWidth;
                height = width / goodRatio;
            }
            setPlayerSize({ width, height });
        }
    }, []);

    const arrowStyle = {
        fontSize: 50,
        cursor: 'pointer'
    }

    const _topIcons = () => (
        <React.Fragment>
            {allowEdit ? (
                <div className='ownerButtons'>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            navigate(`/publish/${post._id}`);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        color="error"
                        variant="outlined"
                        style={{ marginLeft: 20 }}
                        onClick={async () => {
                            const res = await deletePostAPI(post._id);
                            if (res?.success) {
                                removePost(post._id);
                            } else {
                                console.log('ress', res);
                                alert(res?.data?.error?.message);
                            }
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ) : null}
            <div className='hide'>
                <div className='social'>
                    <div className='socialButton'><FullscreenRounded /></div>
                    <div className='socialButton'><ReplyRounded /></div>
                </div>
            </div>
        </React.Fragment>
    );

    const _XButton = () => <div className='XButton' onClick={XClick}><Close /></div>;

    const _postTopBar = () => (
        <div className='postTopBar'>
            {_topIcons()}
            {_XButton()}
        </div>
    );

    const _leftArrow = () => (
        <div className='arrowPart'>
            {!!leftClick && (
                <ArrowBackIosNewRounded
                    style={arrowStyle}
                    onClick={leftClick}
                />
            )}
        </div>
    );

    const _rightArrow = () => (
        <div className='arrowPart'>
            {!!rightClick && (
                <ArrowForwardIosRounded
                    style={arrowStyle}
                    onClick={rightClick}
                />
            )}
        </div>
    );

    const _player = () => (
        post.videoUrl ? (
            <div
                className='playerPart'
                ref={playerPartRef}
            >
                <ReactPlayer
                    url={post.videoUrl}
                    muted={false}
                    controls={true}
                    height={playerSize.height}
                    width={playerSize.width}
                />
            </div>
        ) : (
            <div
                className='playerPart'
                ref={playerPartRef}
            >
                <img
                    style={{ height: playerSize.height, width: playerSize.width }}
                    src={post.logo}
                    alt={post.title}
                />
            </div>
        )
    );

    const _videoSection = () => (
        <div className='videoSection'>
            {_leftArrow()}
            {!!post && _player()}
            {_rightArrow()}
        </div>
    );

    const _showField = (field, post) => {
        const value = post[field.name];
        if (field.type === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (field.type === 'date') {
            return new Date(value).toLocaleDateString();
        }
        if (field.type === 'image') {
            return (
                <img
                    width={50}
                    height={50}
                    src={value}
                    style={{ marginLeft: 20 }}
                    alt="Logo"
                />
            );
        }
        if (field.multiple) {
            return value.join(', ');
        }
        return value;
    }

    const _infoSection = () => (
        <div className='infoSection'>
            {!!post && (
                <div className='infoBox'>
                    <div className='titleText'>{post.title}</div>
                    <div className='infoText'>{post.shortDescription}</div>
                    <div
                        className='linkText'
                        onClick={() => window.open(post.homepage)}
                    >
                        {post.homepage}
                    </div>
                    <Divider style={{ marginBottom: 20 }} variant="middle" />
                    {fields.ICO.map(field => !fieldsToNotShow.includes(field.name) && !!post[field.name] && (
                        <div className='showFieldContainer' key={`${field.name}_show`}>
                            <div
                                className='infoText'
                                style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    minWidth: 'fit-content'
                                }}
                            >
                                {field.label}:&nbsp;&nbsp;&nbsp;
                            </div>
                            <div className='infoText'>{_showField(field, post)}</div>
                        </div>
                    ))}
                    <div className='spacer' />
                    <div className='spacer' />
                    <div className='spacer' />
                    <div className='spacer' />
                </div>
            )}
        </div>
    );

    const _bottomPart = () => (
        <div className='bottomPart'>
            {_videoSection()}
            {_infoSection()}
        </div>
    );

    return (
        <div className='selectedPost'>
            {_postTopBar()}
            {_bottomPart()}
        </div>
    );
}

export default SelectedPost;