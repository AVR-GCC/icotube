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

const classes = {
    root: {
        backgroundColor: '#212121',
        width: 500,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end"
    },
    icon: {
        margin: 10
    },
    iconHover: {
        margin: 10,
        "&:hover": {
            color: red[800]
        }
    },
    cardHeader: {
        textalign: "center",
        align: "center",
        backgroundColor: "white"
    },
    input: {
        display: "none"
    },
    title: {
        color: blue[800],
        fontWeight: "bold",
        fontFamily: "Montserrat",
        align: "center"
    },
    button: {
        color: blue[900],
        margin: 10
    },
    secondaryButton: {
        color: "gray",
        margin: 10
    },
    typography: {
        margin: 10,
        backgroundColor: "default"
    },

    searchRoot: {
        padding: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: 400
    },
    searchInput: {
        marginLeft: 8,
        flex: 1
    },
    searchIconButton: {
        padding: 10
    },
    searchDivider: {
        width: 1,
        height: 28,
        margin: 4
    }
};

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
                        className={classes.input}
                        id="contained-button-file"
                        multiple
                        type="file"
                        onChange={this.handleUploadClick}
                    />
                    <label htmlFor="contained-button-file">
                    <Fab component="span" className={classes.button}>
                        <AddPhotoAlternateIcon />
                    </Fab>
                    </label>
                    <Fab className={classes.button} onClick={this.handleSearchClick}>
                        <SearchIcon />
                    </Fab>
                    <Fab className={classes.button} onClick={this.handleGalleryClick}>
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
            <Paper className={classes.searchRoot} elevation={1}>
                <InputBase className={classes.searchInput} placeholder="Image URL" />
                <IconButton
                    className={classes.button}
                    aria-label="Search"
                    onClick={this.handleImageSearch}
                >
                    <SearchIcon />
                </IconButton>
                <Divider className={classes.searchDivider} />
                <IconButton
                    color="primary"
                    className={classes.secondaryButton}
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
                        className={classes.secondaryButton}
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
            <React.Fragment>
                <CardActionArea onClick={this.imageResetHandler}>
                <img
                    width="100%"
                    className={classes.media}
                    src={this.state.selectedFile}
                    alt="Choose"
                />
                </CardActionArea>
            </React.Fragment>
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
            <div className={classes.root}>
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
