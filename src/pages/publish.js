import React, { useEffect, useState, useRef } from 'react';
import  '../styles/publish.css';
import CoinbaseCommerceButton from '../components/coinbase-commerce-button';
import { useParams } from 'react-router-dom';
// import 'react-coinbase-commerce/dist/coinbase-commerce-button.css';
import { submitPostAPI, getPostAPI } from '../actions/searchAPI';
import { fields } from '../constants/postFields';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import {
    Checkbox,
    ListItemText,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Button,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { defined } from '../utils';
import ImageUpload from '../components/imageUpload';
import { identity } from 'lodash';

function Publish({ currentUser }) {
    // const [loading, setLoading] = useState(false);
    const [postSubmitted, setPostSubmitted] = useState(false);
    const [notificationText, setNotificationText] = useState('');
    const [post, setPost] = useState({});
    const [postType, setPostType] = useState('ICO');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [routeError, setRouteError] = useState(false);

    const [notificationTextTopPx, setNotificationTextTopPx] = useState(55);
    const [notificationTextleftPercent, setNotificationTextleftPercent] = useState(0);
    const notificationTextRef = useRef(null);
    const publishMainContainerRef = useRef(null);
    const inputRefs = useRef({});

    const { postId } = useParams();

    useEffect(() => {
        const getPost = async (id) => {
            const myPost = await getPostAPI(id);
            setPost(myPost);
        }
        if (postId) {
            getPost(postId)
        }
    }, [postId]);

    useEffect(() => {
        const pmcWidth = publishMainContainerRef?.current?.clientWidth;
        const ntWidth = notificationTextRef?.current?.clientWidth;
        const sizeRatio = ntWidth / (pmcWidth ? pmcWidth : 1);
        const srCompliment = 1 - sizeRatio;
        const leftPercentRaw = 100 * srCompliment / 2;
        const leftPercent = leftPercentRaw * (pmcWidth / (pmcWidth + 240));
        if (leftPercent !== notificationTextleftPercent) {
            setNotificationTextleftPercent(leftPercent);
        }
    }, [
        notificationText,
        notificationTextleftPercent
    ]);

    // const toggleSubmitted = () => {
    //     setPostSubmitted(!postSubmitted);
    // }

    const handleSubmit = async () => {
        const errorsObj = {};
        let shouldSubmit = true;
        for (let field of fields[postType]) {
            if (field.required && !defined(post[field.name]) && !defined(field.default)) {
                errorsObj[field.name] = 'This field is required to submit';
                shouldSubmit = false;
            }
        }
        if (shouldSubmit) {
            setLoading(true);
            setRouteError(false);
            setNotificationText('Submitting post...');
            const res = await submitPostAPI({ ...post });
            setLoading(false);
            const autoPublish = res?.data?.autoPublish;
            if (autoPublish) {
                setNotificationText(`Post: ${post.title} - published!`);
            } else if (res?.data?.success) {
                setNotificationText(`Post: ${post.title} - submitted. to activate please make a payment using the button bellow`);
                setPostSubmitted(true);
            } else if (!res?.data?.success) {
                setRouteError(true);
                setNotificationText(`Error: ${res?.data?.error?.message}`);
            }
        } else {
            setErrors(errorsObj);
        }
    }

    const handleChangeType = (_, arg2) => {
        if (arg2) setPostType(arg2);
    }

    const getHandleChange = (fieldName, transformer = identity) => rawVal => {
        const val = transformer(rawVal);
        if (val !== post[fieldName]) {
            setPost({ ...post, [fieldName]: val });
            if (errors[fieldName] && val) {
                const newErrors = { ...errors };
                delete newErrors[fieldName];
                setErrors(newErrors);
            }
        }
    }

    const _field = (field) => {
        const inputId = `${field.name}_input`;
        const inputLabelId = `${field.name}_input_label`;
        const showText = field.label || field.name || '';
        const value = post[field.name] || field.default || '';
        switch (field.type) {
            case 'string':
                return (
                    <TextField
                        error={!!errors[field.name]}
                        key={inputId}
                        id={inputId}
                        label={showText}
                        required={field.required}
                        multiline={field.multiline}
                        variant='outlined'
                        margin='normal'
                        fullWidth
                        value={value}
                        InputLabelProps={{ shrink: !!value }}
                        onChange={getHandleChange(field.name, event => event.target.value)}
                        helperText={errors[field.name]}
                    />
                );
            case 'enum':
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ flex: 1, margin: 5, marginLeft: 0 }}>
                            <FormControl
                                variant='outlined'
                                margin='normal'
                                fullWidth
                            >
                                <InputLabel id={inputLabelId}>{showText}</InputLabel>
                                <Select
                                    multiple={field.multiple}
                                    labelId={inputLabelId}
                                    id={inputId}
                                    value={value || (field.multiple ? [] : '')}
                                    label={showText}
                                    onChange={getHandleChange(field.name, event => event.target.value)}
                                    renderValue={field.multiple ? (selected) => selected.join(', ') : identity}
                                >
                                    <MenuItem key={`${inputId}_none_option`} value=''>
                                        <em>None</em>
                                    </MenuItem>
                                    {field.enum.map((op) =>
                                        <MenuItem key={`${op}_option`} value={op}>
                                            {!!field.multiple && <Checkbox checked={(value || []).indexOf(op) > -1} />}
                                            <ListItemText primary={op} />
                                        </MenuItem>
                                    )}
                                </Select>
                                {/* <FormHelperText>Disabled</FormHelperText> */}
                            </FormControl>
                        </div>
                        <div style={{ flex: 1, margin: 5, marginRight: 0 }}>
                            {value === 'Other' && (
                                <TextField
                                    inputRef={ref => {
                                        if (!inputRefs.current[`${field.name}Other`] && ref) {
                                            setTimeout(() => ref.focus(), 100);
                                            inputRefs.current[`${field.name}Other`] = ref
                                        }
                                    }}
                                    error={!!errors[`${field.name}Other`]}
                                    key={`${inputId}Other`}
                                    id={`${inputId}Other`}
                                    label={'Other'}
                                    required={field.required}
                                    multiline={field.multiline}
                                    variant='outlined'
                                    margin='normal'
                                    fullWidth
                                    value={post[`${field.name}Other`]}
                                    onChange={getHandleChange(`${field.name}Other`, event => event.target.value)}
                                    helperText={errors[`${field.name}Other`]}
                                />
                            )}
                        </div>
                    </div>
                );
            case 'date':
                return (
                    <div style={{ margin: 8 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                margin='normal'
                                label={showText}
                                value={value}
                                onChange={getHandleChange(field.name)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </div>
                );
            case 'image':
                return (
                    <div className='imageUploadContainer'>
                        <div className='sectionTitleText'>{showText}</div>
                        <ImageUpload
                            height={200}
                            width={200}
                            onChange={getHandleChange(field.name)}
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    const _typeToggle = () => (
        <div className='toggleTypeContainer'>
            <ToggleButtonGroup
                color="primary"
                value={postType}
                exclusive
                onChange={handleChangeType}
            >
                <ToggleButton value="ICO">ICO</ToggleButton>
                <ToggleButton disabled value="Airdrop">Airdrop</ToggleButton>
                <ToggleButton disabled value="NFT">NFT</ToggleButton>
            </ToggleButtonGroup>
        </div>
    )

    const _main = () => {
        return (
            <div className='publishInputContainer'>
                {/* <TextField
                    label={'showText'}
                    variant='outlined'
                    margin='normal'
                    fullWidth
                    value={notificationText}
                    onChange={(event) => {
                        setNotificationText(event.target.value)
                    }}
                /> */}
                {fields[postType].map(field => (
                    <div
                        key={`${field.name}_input_container`}
                        style={{ width: '100%' }}
                    >
                        {_field(field)}
                    </div>
                ))}


                {/* <Button
                    variant='outlined'
                    onClick={toggleSubmitted}
                >
                    <span style={{ fontSize: 14 }}>Toggle Submit</span>
                </Button> */}

                <div className='publishButtonsContainer'>
                    <Button
                        variant='outlined'
                        style={{ marginTop: 20 }}
                        onClick={handleSubmit}
                        disabled={postSubmitted}
                    >
                        <span style={{ fontSize: 14 }}>Submit</span>
                    </Button>
                    <div className="paymentButton">
                        <CoinbaseCommerceButton
                            styled={true}
                            checkoutId={'2fd410af-6ba1-42a1-91d3-bb1dc7c42bc1'}
                            // onLoad={(arg) => {
                            //     console.log('onLoad:', arg);
                            // }}
                            // onChargeSuccess={(arg) => {
                            //     console.log('onChargeSuccess:', arg);
                            // }}
                            // onChargeFailure={(arg) => {
                            //     console.log('onChargeFailure:', arg);
                            // }}
                            // customMetadata={'custom-metadata-1248'}
                            onPaymentDetected={(arg) => {
                                setNotificationText(`Payment made! The post will appear when the payment is confirmed`);
                            }}
                            disabled={!postSubmitted}
                        />
                    </div>
                </div>
            </div>
        );
    };

    let noteColor = 'green';
    if (routeError) noteColor = 'red';
    if (loading) noteColor = '#afaf33';

    return (
        <div>
            <TopBar currentUser={currentUser} />
            <div className='topContainer'>
                <SideBar />
                <div
                    className='publishMainContainer'
                    ref={publishMainContainerRef}
                    onScroll={(event) => {
                        const st = event.target.scrollTop;
                        if (st > 50) {
                            if (notificationTextTopPx > 5) {
                                setNotificationTextTopPx(5);
                            }
                        } else {
                            setNotificationTextTopPx(55 - st);
                        }
                    }}
                >
                    <div className='publishTitle'>
                        Publish Crypto Project
                        {_typeToggle()}
                    </div>
                    <div
                        className='notificationText'
                        style={{
                            maxWidth: (publishMainContainerRef?.current?.clientWidth || 0) / 2,
                            top: notificationTextTopPx,
                            left: `calc(240px + ${notificationTextleftPercent}%)`,
                            color: noteColor
                        }}
                        ref={notificationTextRef}
                    >
                        {loading && <div className='loadingIndicator'><CircularProgress size={20} /></div>}
                        {notificationText}
                    </div>
                    {_main()}
                </div>
            </div>
        </div>
    );
}


export default Publish;