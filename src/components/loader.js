import React from 'react';
import ReactPlayer from 'react-player';
import loadingGif from '../assets/loading-gif.mp4';

function Loader() {
    return (
        <ReactPlayer
            playing
            height={313}
            width={313}
            url={loadingGif}
            muted={true}
            controls={false}
            loop={true}
        />
    );
}

export default Loader;
