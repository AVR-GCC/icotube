import React, { useEffect, useState, useContext } from 'react';
import  '../styles/airdrop.css';
import  '../styles/publish.css';
import { noop } from 'lodash';
import { ethers } from 'ethers';
import {
    Button,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress
} from '@mui/material';
import { getTokenContractAPI } from '../actions/searchAPI';
import { AppContext } from '../App';

const Airdrop = ({ setSigner = noop }) => {
    const [connection, setConnection] = useState({ connected: false });
    const [postType, setPostType] = useState('Token');
    const [errors, setErrors] = useState({});
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const { setNotification } = useContext(AppContext);

    const getHandleChangeValue = valueName => (e) => {
        if (values[valueName] === '' && !!errors[valueName]) {
            const newErrors = { ...errors };
            delete newErrors[valueName];
            setErrors(newErrors);
        }
        setValues({ ...values, [valueName]: e.target.value });
    }

    const handleConnect = async () => {
        if (window.ethereum) {
            setLoading(true);
            try {
                // Connect to the MetaMask EIP-1193 object. This is a standard
                // protocol that allows Ethers access to make all read-only
                // requests through MetaMask.
                const provider = new ethers.BrowserProvider(window.ethereum)

                // It also provides an opportunity to request access to write
                // operations, which will be performed by the private key
                // that MetaMask manages for the user.
                console.log('provider', provider);
                const signer = await provider.getSigner();
                setSigner(signer);
                console.log('signer', signer);
                const bal = await provider.getBalance(signer.address)
                console.log('bal', bal);
                setNotification({ text: `Connected to MetaMask: ${signer.address}`, type: 'positive' });
                setConnection({
                    connected: true,
                    provider,
                    signer
                });
            } catch (e) {
                setNotification({ text: `Error Connecting to MetaMask: ${e.reason}`, type: 'negative' });
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({method: 'eth_accounts'}).then(accounts => {
                if (accounts.length) {
                    handleConnect();
                }
            });
        }
    }, []);

    const handleChangeType = (_, arg2) => {
        if (arg2) setPostType(arg2);
    };

    const _typeToggle = () => (
        <div style={{ width: '100%' }}>
            <ToggleButtonGroup
                color="primary"
                value={postType}
                exclusive
                onChange={handleChangeType}
            >
                <ToggleButton value="Token">Token</ToggleButton>
                {/* <ToggleButton value="Airdrop">Airdrop</ToggleButton> */}
            </ToggleButtonGroup>
        </div>
    );

    const _tokenSection = () => (
        <div>
            <TextField
                autoComplete='off'
                error={!!errors.tokenName}
                key="tokenName_input"
                id="tokenName_input"
                label="Token Name"
                required
                variant='outlined'
                margin='normal'
                fullWidth
                value={values.tokenName}
                InputLabelProps={{ shrink: !!values.tokenName }}
                onChange={getHandleChangeValue('tokenName')}
                helperText={errors.tokenName}
            />
            <TextField
                autoComplete='off'
                error={!!errors.tokenSymbol}
                key="tokenSymbol_input"
                id="tokenSymbol_input"
                label="Token Symbol"
                required
                variant='outlined'
                margin='normal'
                fullWidth
                value={values.tokenSymbol}
                InputLabelProps={{ shrink: !!values.tokenSymbol }}
                onChange={getHandleChangeValue('tokenSymbol')}
                helperText={errors.tokenSymbol}
            />
            <Button
                variant='outlined'
                style={{ marginTop: 20 }}
                onClick={async () => {
                    const res = await getTokenContractAPI(values.tokenName, values.tokenSymbol);
                    if (res.data.success) {
                        if (res.data.warning) {
                            setNotification({ text: res.data.warning, type: 'info' });
                        } else {
                            setNotification({ text: 'Compiled successfully', type: 'positive' });
                        }
                    } else {
                        setNotification({ text: res.data.error, type: 'negative' });
                    }
                }}
                disabled={!connection.connected || loading || !values.tokenName || !values.tokenSymbol}
            >
                <span style={{ fontSize: 14 }}>Submit</span>
            </Button>
        </div>
    );

    return (
        <div className="mainContainer">
            {connection.connected ? (
                <div>
                    <div className='infoText'>
                        Connected with address {connection.signer.address}
                    </div>
                    {_typeToggle()}
                    {_tokenSection()}
                </div>
            ) : (
                <div className='pageContainer'>
                    <div className='infoText'>
                        To publish an Airdrop or calculate the prices of doing so, you need to install and connect to MetaMask
                    </div>
                    {!!window.ethereum ? (
                        <div>
                            <Button
                                variant='outlined'
                                style={{ marginTop: 20 }}
                                onClick={handleConnect}
                                disabled={!window.ethereum }
                            >
                                <span style={{ fontSize: 14 }}>Connect</span>
                            </Button>
                        </div>
                    ) : (
                        <div className='infoText' style={{ flexDirection: 'row' }}>
                            Please install <a className='linkText' href="https://metamask.io/download/" target="_blank">MetaMask</a>
                        </div>
                    )}
                    {loading && <div className='loadingIndicator' style={{ margin: 20 }}><CircularProgress size={20} /></div>}
                </div>
            )}
        </div>
    );
}

export default Airdrop;