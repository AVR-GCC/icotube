import React, { useEffect, useState } from 'react';
import  '../styles/publish.css';
import CoinbaseCommerceButton from '../components/coinbase-commerce-button';
// import 'react-coinbase-commerce/dist/coinbase-commerce-button.css';
import { submitPostAPI } from '../actions/searchAPI';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import {
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

const fields = {
    ICO: [
        {
            name: 'name',
            label: 'Submitter Name',
            type: 'string'
        },
        {
            name: 'email',
            label: 'Submitter Email',
            type: 'string',
            required: true
        },
        {
            name: 'title',
            label: 'Project Name',
            type: 'string'
        },
        {
            name: 'type',
            label: 'Project Category',
            type: 'enum',
            enum: [
                'Platform',
                'Blockchain Service'
            ],
            default: 'Platform'
        },
        {
            name: 'short-description',
            label: 'Short Description',
            type: 'string',
            default: ''
        },
        {
            name: 'description',
            label: 'Long Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            default: Date.now()
        },
        {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            default: Date.now()
        },
        {
            name: 'ticker',
            label: 'Ticker',
            type: 'string'
        },
        {
            name: 'tokenType',
            label: 'Token Type',
            type: 'string',
            default: 'ERC20'
        },
        {
            name: 'amountPerUser',
            label: 'Price/Amount Per User',
            type: 'number',
            default: 'ERC20'
        },
        {
            name: 'soft-cap',
            label: 'Soft Cap',
            type: 'number'
        },
        {
            name: 'cap',
            label: 'Hard Cap',
            type: 'number'
        },
        {
            name: 'totalTokens',
            label: 'Total Tokens',
            type: 'number'
        },
        {
            name: 'availableTokens',
            label: 'Available Tokens',
            type: 'number'
        },
        {
            name: 'minParticipation',
            label: 'Minimum Participation',
            type: 'number'
        },
        {
            name: 'maxParticipation',
            label: 'Maximum Participation',
            type: 'number'
        },
        {
            name: 'accepts',
            label: 'Accepts',
            type: 'enum',
            enum: [
                'BTC',
                'Ethereum',
                'USDT'
            ],
        },
        {
            name: 'isWhitelist',
            label: 'Whitelist',
            type: 'boolean',
            default: false
        },
        {
            name: 'restrictedCountries',
            label: 'Restricted Countries',
            type: 'boolean',
        },
        {
            name: 'officialChat',
            label: 'Official Chat',
            type: 'string',
        },
        {
            name: 'github',
            label: 'Github',
            type: 'string',
        },
        {
            name: 'bitcoinTalk',
            label: 'Bitcoin Talk',
            type: 'string',
        },
        {
            name: 'logo',
            label: 'Logo',
            type: 'image',
        },
        {
            name: 'homepage',
            label: 'Homepage',
            type: 'string',
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string'
        },
    ],
    Airdrop: [
        {
            name: 'email',
            label: 'Contact Email',
            type: 'string',
            required: true
        },
        {
            name: 'title',
            label: 'Title',
            type: 'string',
            required: true
        },
        {
            name: 'description',
            label: 'Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'ticker',
            label: 'Ticker',
            type: 'string',
            required: true
        },
        {
            name: 'tokenType',
            label: 'Token Type',
            type: 'string',
            default: 'ERC20'
        },
        {
            name: 'homepage',
            label: 'Homepage',
            type: 'string',
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string',
            required: true
        },
        {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            default: Date.now()
        },
        {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            default: Date.now()
        },
    ],
    NFT: [
        {
            name: 'email',
            label: 'Contact Email',
            type: 'string',
            required: true
        },
        {
            name: 'title',
            label: 'Title',
            type: 'string',
            required: true
        },
        {
            name: 'description',
            label: 'Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'ticker',
            label: 'Ticker',
            type: 'string',
            required: true
        },
        {
            name: 'homepage',
            label: 'Homepage',
            type: 'string',
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string',
            required: true
        },
    ]
}

function Publish({ currentUser }) {
    // const [loading, setLoading] = useState(false);
    const [postSubmitted, setPostSubmitted] = useState(false);
    const [notificationText, setNotificationText] = useState('');
    const [post, setPost] = useState({});
    const [postType, setPostType] = React.useState('ICO');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [notificationTextTopPx, setNotificationTextTopPx] = useState(55);
    const [notificationTextleftPercent, setNotificationTextleftPercent] = useState(0);
    const [notificationTextRef, setNotificationTextRef] = useState(null);
    const [publishMainContainerRef, setPublishMainContainerRef] = useState(null);

    useEffect(() => {
        const pmcWidth = publishMainContainerRef?.clientWidth;
        const ntWidth = notificationTextRef?.clientWidth;
        const sizeRatio = ntWidth / (pmcWidth ? pmcWidth : 1);
        const srCompliment = 1 - sizeRatio;
        const leftPercentRaw = 100 * srCompliment / 2;
        const leftPercent = leftPercentRaw * (pmcWidth / (pmcWidth + 240));
        if (leftPercent !== notificationTextleftPercent) {
            setNotificationTextleftPercent(leftPercent);
        }
    }, [
        publishMainContainerRef,
        notificationTextRef,
        notificationText,
        notificationTextleftPercent
    ]);

    // const toggleSubmitted = () => {
    //     setPostSubmitted(!postSubmitted);
    // }

    const handleSubmit = () => {
        const errorsObj = {};
        let shouldSubmit = true;
        for (let field of fields) {
            if (field.required && !defined(post[field.name]) && !defined(field.default)) {
                errorsObj[field.name] = 'This field is required to submit';
                shouldSubmit = false;
            }
        }
        if (shouldSubmit) {
            submitPostAPI({
                    ...post
                }, () => {
                    setLoading(true);
                    setNotificationText('Submitting post...');
                }, (res) => {
                    setLoading(false);
                    const autoPublish = res?.data?.autoPublish;
                    if (autoPublish) {
                        setNotificationText(`Post: ${post.title} - published!`);
                    } else {
                        setNotificationText(`Post: ${post.title} - submitted. to activate please make a payment using the button bellow`);
                        setPostSubmitted(true);
                    }
                }
            );
        } else {
            setErrors(errorsObj);
        }
    }

    const handleChangeType = (_, arg2) => {
        if (arg2) setPostType(arg2);
    }

    const handleChange = (val, fieldName) => {
        setPost({ ...post, [fieldName]: val });
        if (errors[fieldName] && val) {
            const newErrors = { ...errors };
            delete newErrors[fieldName];
            setErrors(newErrors);
        }
    }

    const _field = (field) => {
        const inputId = `${field.name}_input`;
        const inputLabelId = `${field.name}_input_label`;
        const showText = field.label || field.name;
        const value = post[field.name] || field.default;
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
                        onChange={(event) => {
                            handleChange(event.target.value, field.name);
                        }}
                        helperText={errors[field.name]}
                    />
                );
            case 'enum':
                return (
                    <FormControl
                        // sx={{ m: 1, minWidth: 120 }}
                        variant='outlined'
                        margin='normal'
                        fullWidth
                    >
                        <InputLabel id={inputLabelId}>{showText}</InputLabel>
                        <Select
                            labelId={inputLabelId}
                            id={inputId}
                            value={value}
                            label={showText}
                            onChange={(event) => {
                                handleChange(event.target.value, field.name);
                            }}
                        >
                            <MenuItem key={`${inputId}_none_option`} value=''>
                                <em>None</em>
                            </MenuItem>
                            {field.enum.map((op) =>
                                <MenuItem key={`${op}_option`} value={op}>{op}</MenuItem>
                            )}
                        </Select>
                        {/* <FormHelperText>Disabled</FormHelperText> */}
                    </FormControl>
                );
            case 'date':
                return (
                    <div style={{ margin: 8 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                margin='normal'
                                label={showText}
                                value={value}
                                onChange={(newValue) => {
                                    handleChange(newValue, field.name);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </div>
                );
            case 'image':
                return (
                    <div className='imageUploadContainer'>
                        <div className='sectionTitleText'>{showText}</div>
                        <ImageUpload height={200} width={200} />
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

    return (
        <div>
            <TopBar currentUser={currentUser} />
            <div className='topContainer'>
                <SideBar />
                <div
                    className='publishMainContainer'
                    ref={ref => {
                        if (ref) setPublishMainContainerRef(ref);
                    }}
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
                        Publish Funding Campaign
                        {_typeToggle()}
                    </div>
                    <div
                        className='notificationText'
                        style={{
                            maxWidth: (publishMainContainerRef?.clientWidth || 0) / 2,
                            top: notificationTextTopPx,
                            left: `calc(240px + ${notificationTextleftPercent}%)`,
                            color: loading ? '#afaf33' : 'green'
                        }}
                        ref={ref => {
                            if (ref) setNotificationTextRef(ref);
                        }}
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