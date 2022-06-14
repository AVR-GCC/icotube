import React, { useState } from "react";

import {
    Card,
    CardActionArea,
    CardContent,
    Fab,
    Grid,
    Paper,
    InputBase,
    Divider,
    IconButton,
} from '@mui/material';

import {
    Close,
    Search,
    AddPhotoAlternate,
    Collections
} from '@mui/icons-material';

import  '../styles/imageUpload.css';

const ImageUpload = (props) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleUploadClick = event => {
        var file = event.target.files[0];
        const reader = new FileReader();
        var url = reader.readAsDataURL(file);

        reader.onloadend = () => setSelectedFile(reader.result);
        console.log('image url', url);

        setSelectedFile(event.target.files[0]);
    };

    const renderInitialState = () => (
        <div className="card">
            <input
                accept="image/*"
                className="input"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleUploadClick}
            />
            <label htmlFor="contained-button-file">
            <Fab component="span" className="button">
                <AddPhotoAlternate />
            </Fab>
            </label>
            <Fab className="button" onClick={() => {}}>
                <Search />
            </Fab>
            <Fab className="button" onClick={() => {}}>
                <Collections />
            </Fab>
        </div>
    );

    const renderSearchState = () => (
        <Paper className="search-root" elevation={1}>
            <InputBase className="search-input" placeholder="Image URL" />
            <IconButton
                className="button"
                aria-label="Search"
                onClick={() => {}}
            >
                <Search />
            </IconButton>
            <Divider className="search-divider" />
            <IconButton
                color="primary"
                className="secondary-button"
                aria-label="Close"
                onClick={() => {}}
            >
                <Close />
            </IconButton>
        </Paper>
    );

    const handleAvatarClick = (value) => {
        var filename = value.url.substring(value.url.lastIndexOf("/") + 1);
        console.log(filename);
        setSelectedFile(value.url);
    }

    const renderUploadedState = () => {
        const { width = 30, height = 30 } = props;
        return (
            <CardActionArea onClick={() => {}}>
                <img
                    width={width}
                    height={height}
                    className="media"
                    src={selectedFile}
                    alt="Choose"
                />
            </CardActionArea>
        );
    }

    const imageResetHandler = event => {
        console.log("Click!");
        setSelectedFile(null);
    };

    return (
        <div className="root">
            {!!selectedFile && renderUploadedState()}
            {renderInitialState()}
        </div>
    );
}

export default ImageUpload;
