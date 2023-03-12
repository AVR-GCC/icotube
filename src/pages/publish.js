import React, { useEffect, useState, useRef } from 'react';
import  '../styles/publish.css';
import { useNavigate } from 'react-router-dom';
import CoinbaseCommerceButton from '../components/coinbase-commerce-button';
import { useParams } from 'react-router-dom';
// import 'react-coinbase-commerce/dist/coinbase-commerce-button.css';
import { submitPostAPI, getPostAPI } from '../actions/searchAPI';
import { fields } from '../constants/postFields';
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
    ToggleButtonGroup,
    Switch
} from '@mui/material';

// import { LocalizationProvider, DatePicker } from '@mui/lab';
// import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { HighlightOff } from '@mui/icons-material';

import { defined } from '../utils';
import ImageUpload from '../components/imageUpload';
import { identity, isEmpty } from 'lodash';

function Publish() {
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
    const mounted = useRef(false);
    const notificationTextRef = useRef(null);
    const publishMainContainerRef = useRef(null);
    const inputRefs = useRef({});
    const navigate = useNavigate();
    const navigateToPost = (postId) => {
        let category = 'upcoming';
        const today = new Date();
        if (today > new Date(post.startDate)) {
            if (!post.endDate || today <= new Date(post.endDate)) {
                category = 'running';
            } else {
                category = 'ended';
            }
        }
        navigate(`/${category}/${postId}`);
    }

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
        const leftPercent = leftPercentRaw * (pmcWidth / (pmcWidth + 241 * 2));
        if (leftPercent !== notificationTextleftPercent) {
            setNotificationTextleftPercent(leftPercent);
        }
    }, [notificationText]);

    useEffect(() => {
        mounted.current = true;
        return () => mounted.current = false;
    }, []);

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
        if (shouldSubmit && isEmpty(post.logo) && isEmpty(post.videoUrl)) {
            const str = 'Either a logo or a video url is required to submit'
            errorsObj.logo = str;
            errorsObj.videoUrl = str;
            shouldSubmit = false;
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
                navigateToPost(res?.data?.post?._id);
            } else if (res?.data?.success) {
                setNotificationText(`Post: ${post.title} - submitted. to activate please make a payment using the button bellow`);
                setPostSubmitted(true);
            } else if (!res?.data?.success) {
                setRouteError(true);
                setNotificationText(`Error: ${res?.data?.error?.message}`);
            }
        } else {
            setRouteError(true);
            setNotificationText(`Error: one or more of the requirments are missing`);
            setErrors(errorsObj);
        }
    }

    const handleChangeType = (_, arg2) => {
        if (arg2) setPostType(arg2);
    }

    const getHandleChange = (fieldName, transformer = identity) => rawVal => {
        if (postSubmitted) setPostSubmitted(false);
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
                        autoComplete='off'
                        error={!!errors[field.name]}
                        key={inputId}
                        id={inputId}
                        label={field.placeholder && !value ? field.placeholder : showText}
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
            case 'number':
                return (
                    <TextField
                        autoComplete='off'
                        error={!!errors[field.name]}
                        key={inputId}
                        id={inputId}
                        label={showText}
                        required={field.required}
                        multiline={field.multiline}
                        variant='outlined'
                        margin='normal'
                        type='number'
                        onWheel={event => event.target.blur()}
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
                        <div style={{ flex: 1, marginTop: 16, marginRight: 10, marginBottom: value === 'Other' ? 0 : 8 }}>
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
                        <div style={{ flex: 1 }}>
                            {value === 'Other' && (
                                <TextField
                                    autoComplete='off'
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
                    <div className='dateFieldHolder'>
                        <div style={{ margin: '15px 15px 15px 0' }}>
                            {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    margin='normal'
                                    label={showText}
                                    value={value}
                                    onChange={getHandleChange(field.name)}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider> */}
                            <div
                                className='sectionTitleText'
                                style={{
                                    pointerEvents: 'none',
                                    position: 'relative',
                                    top: 46,
                                    zIndex: 2,
                                    marginTop: -50
                                }}
                            >
                                {showText}
                            </div>
                            <div className={value ? '' : 'hideDate'}>
                                <DatePicker
                                    onChange={getHandleChange(field.name)}
                                    selected={value ? new Date(value) : new Date()}
                                />
                            </div>
                        </div>
                        {field.optional && (
                            <HighlightOff
                                className='XIcon'
                                onClick={() => getHandleChange(field.name)(null)}
                            />
                        )}
                    </div>
                );
            case 'image':
                return (
                    <>
                        <div className='imageUploadContainer' style={{ border: `1px solid ${!!errors[field.name] ? '#d32f2f' : 'transparent'}`}}>
                            <div className='sectionTitleText'>{showText}</div>
                            <ImageUpload
                                height={200}
                                width={200}
                                value={value}
                                onChange={getHandleChange(field.name)}
                            />
                        </div>
                        {!!errors[field.name] && <div className='errorText'>{errors[field.name]}</div>}
                    </>
                );
            case 'boolean':
                return (
                    <div className='switchContainer'>
                        <div className='sectionTitleText' style={{ marginBottom: 10 }}>{showText}</div>
                        <Switch checked={!!value} onChange={getHandleChange(field.name, event => event.target.checked)} />
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

    console.log('postSubmitted', postSubmitted);

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
                            checkoutId={'c236387b-5a7f-4a33-a5e3-c784b379c3cb'}
                            onLoad={(arg) => {
                                console.log('onLoad:', arg);
                            }}
                            // onChargeSuccess={(arg) => {
                            //     console.log('onChargeSuccess:', arg);
                            // }}
                            // onChargeFailure={(arg) => {
                            //     console.log('onChargeFailure:', arg);
                            // }}
                            // customMetadata={'custom-metadata-1248'}
                            onPaymentDetected={(arg) => {
                                setNotificationText(`Payment made! The post will appear when the payment is confirmed`);
                                setTimeout(navigateToPost, 3000);
                            }}
                            disabled={!postSubmitted}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const _publisherNotes = () => (
        <div className='publishNotes'>
            <div className='infoText'>
                Notes for publishers:
            </div>
            <div className='infoText'>
                *   Name field is mandatory.
            </div>
            <div className='infoText'>
                *   Email field is mandatory, the person registered with this email will be the one who can edit this post.
            </div>
            <div className='infoText'>
                *   Either the video url or the logo url is mandatory, video is the best but at least have a logo that we can show.
            </div>
            <div className='infoText'>
                *   Please provide as much information as possible about your crypto project.
            </div>
        </div>
    )
;
    let noteColor = 'green';
    if (routeError) noteColor = 'red';
    if (loading) noteColor = '#afaf33';

    return (
        <div
            className='publishMainContainer'
            ref={publishMainContainerRef}
            onScroll={(event) => {
                const st = event.target.scrollTop;
                if (st > 20) {
                    if (notificationTextTopPx > 5) {
                        setNotificationTextTopPx(5);
                    }
                } else {
                    setNotificationTextTopPx(25 - st);
                }
            }}
        >
            <div className='typeToggle'>
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
            {_publisherNotes()}
            {_main()}
        </div>
    );
}


export default Publish;