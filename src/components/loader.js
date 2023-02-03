import React from 'react';
// import ReactPlayer from 'react-player';
import loadingGif from '../assets/icotubeloadinggif.gif';

function Loader() {
    return (
        // <ReactPlayer
        //     playing
        //     height={313}
        //     width={313}
        //     url={loadingGif}
        //     muted={true}
        //     controls={false}
        //     loop={true}
        // />
        <img height={200} width={400} src={loadingGif} alt="loading..." />
    );
}

export default Loader;
