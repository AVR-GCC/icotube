import React, { useState } from 'react';
import  '../styles/publish.css';
import CoinbaseCommerceButton from '../components/coinbase-commerce-button';
// import 'react-coinbase-commerce/dist/coinbase-commerce-button.css';
import { submitPostAPI } from '../actions/searchAPI';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import { TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { defined } from '../utils';

function Publish({ currentUser }) {

    // const [loading, setLoading] = useState(false);
    const [postSubmitted, setPostSubmitted] = useState(false);
    const [notificationText, setNotificationText] = useState('');
    const [post, setPost] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const fields = [
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
            name: 'type',
            label: 'Type',
            type: 'enum',
            enum: [
                'Platform',
                'Blockchain Service'
            ],
            required: true,
            default: 'Platform'
        },
        {
            name: 'description',
            label: 'Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'isWhitelist',
            label: 'Whitelist',
            type: 'boolean',
            default: ''
        },
        {
            name: 'fundraisingGoal',
            label: 'Fundraising Goal',
            type: 'number'
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
            name: 'icoOrAirdrop',
            label: 'Event Type',
            type: 'enum',
            enum: ['ICO', 'Airdrop'],
            default: 'ICO'
        },
        {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            default: Date.now
        },
        {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            default: Date.now
        },
    ];

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
                        variant='filled'
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
                        variant='filled'
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
            default:
                return null;
        }
    }

    const _main = () => {
        return (
            <div className='publishInputContainer'>
                {fields.map(field => (
                    <div
                        key={`${field.name}_input_container`}
                        style={{ width: '100%' }}
                    >
                        {_field(field)}
                    </div>
                ))}

                <div
                    className="sButton"
                    style={{ marginTop: 20 }}
                    onClick={handleSubmit}
                >
                    <span style={{ fontSize: 14 }}>Submit</span>
                </div>
                {postSubmitted ? (
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
                        />
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <div>
            <TopBar currentUser={currentUser} />
            <div className='topContainer'>
                <SideBar />
                <div className='publishMainContainer'>
                    <div className='publishTitle'>
                        Publish Funding Campaign
                    </div>
                    <div
                        className='notificationText'
                        style={{ color: loading ? '#afaf33' : 'green' }}
                    >
                        <div className='loadingIndicator'>{loading && <CircularProgress size={20} />}</div>
                        {notificationText}
                    </div>
                    {_main()}
                </div>
            </div>
        </div>
    );
}


export default Publish;