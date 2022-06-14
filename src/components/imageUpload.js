// imports the React Javascript Library
import React from "react";
//Card
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";

import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";

import red from "@mui/material/colors/red";
import blue from "@mui/material/colors/blue";
import SearchIcon from "@mui/icons-material/Search";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CollectionsIcon from "@mui/icons-material/Collections";

// Search
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import  '../styles/imageUpload.css';

class ImageUploadCard extends React.Component {
    state = {
        mainState: "initial", // initial, search, gallery, uploaded
        imageUploaded: 0,
        selectedFile: null
    };

    handleUploadClick = event => {
        console.log();
        var file = event.target.files[0];
        const reader = new FileReader();
        var url = reader.readAsDataURL(file);

        reader.onloadend = function(e) {
            this.setState({
                selectedFile: [reader.result]
            });
        }.bind(this);
        console.log(url); // Would see a path?

        this.setState({
            mainState: "uploaded",
            selectedFile: event.target.files[0],
            imageUploaded: 1
        });
    };

    handleSearchClick = event => {
        this.setState({
            mainState: "search"
        });
    };

    handleGalleryClick = event => {
        this.setState({
            mainState: "gallery"
        });
    };

    renderInitialState() {
        return (
            <CardContent>
                <Grid container justify="center" alignItems="center">
                    <input
                        accept="image/*"
                        className="input"
                        id="contained-button-file"
                        multiple
                        type="file"
                        onChange={this.handleUploadClick}
                    />
                    <label htmlFor="contained-button-file">
                    <Fab component="span" className="button">
                        <AddPhotoAlternateIcon />
                    </Fab>
                    </label>
                    <Fab className="button" onClick={this.handleSearchClick}>
                        <SearchIcon />
                    </Fab>
                    <Fab className="button" onClick={this.handleGalleryClick}>
                        <CollectionsIcon />
                    </Fab>
                </Grid>
            </CardContent>
        );
    }

    handleSearchURL = event => {
        var file = event.target.files[0];
        var reader = new FileReader();
        var url = reader.readAsDataURL(file);

        reader.onloadend = function(e) {
            this.setState({
                selectedFile: [reader.result]
            });
        }.bind(this);
        console.log(url); // Would see a path?

        this.setState({
            selectedFile: event.target.files[0],
            imageUploaded: 1
        });
    };

    handleImageSearch(url) {
        var filename = url.substring(url.lastIndexOf("/") + 1);
        console.log(filename);
        this.setState({
            mainState: "uploaded",
            imageUploaded: true,
            selectedFile: url,
            fileReader: undefined,
            filename: filename
        });
    }

    handleSeachClose = event => {
        this.setState({
            mainState: "initial"
        });
    };

    renderSearchState() {
        return (
            <Paper className="search-root" elevation={1}>
                <InputBase className="search-input" placeholder="Image URL" />
                <IconButton
                    className="button"
                    aria-label="Search"
                    onClick={this.handleImageSearch}
                >
                    <SearchIcon />
                </IconButton>
                <Divider className="search-divider" />
                <IconButton
                    color="primary"
                    className="secondary-button"
                    aria-label="Close"
                    onClick={this.handleSeachClose}
                >
                    <CloseIcon />
                </IconButton>
            </Paper>
        );
    }

    handleAvatarClick(value) {
        var filename = value.url.substring(value.url.lastIndexOf("/") + 1);
        console.log(filename);
        this.setState({
            mainState: "uploaded",
            imageUploaded: true,
            selectedFile: value.url,
            fileReader: undefined,
            filename: filename
        });
    }

    renderGalleryState() {
        const listItems = this.props.imageGallery.map(url => (
            <div
                onClick={value => this.handleAvatarClick({ url })}
                style={{
                    padding: "5px 5px 5px 5px",
                    cursor: "pointer"
                }}
            >
                <Avatar src={url} />
            </div>
        ));

        return (
            <React.Fragment>
                <Grid>
                    {listItems}
                    <IconButton
                        color="primary"
                        className="secondary-button"
                        aria-label="Close"
                        onClick={this.handleSeachClose}
                    >
                        <ReplayIcon />
                    </IconButton>
                </Grid>
            </React.Fragment>
        );
    }

    renderUploadedState() {
        return (
            <CardActionArea onClick={this.imageResetHandler}>
                <img
                    width="100%"
                    className="media"
                    src={this.state.selectedFile}
                    alt="Choose"
                />
            </CardActionArea>
        );
    }

    imageResetHandler = event => {
        console.log("Click!");
        this.setState({
            mainState: "initial",
            selectedFile: null,
            imageUploaded: 0
        });
    };

    render() {
        return (
            <div className="root">
                <Card className={this.props.cardName}>
                    {this.state.mainState === "initial" && this.renderInitialState()}
                    {this.state.mainState === "search" && this.renderSearchState()}
                    {this.state.mainState === "uploaded" && this.renderUploadedState()}
                </Card>
            </div>
        );
    }
}

export default ImageUploadCard;
