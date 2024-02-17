import React, { useEffect, useState, useContext } from 'react';
import  '../styles/contracts.css';
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
import { ContentCopyRounded, LaunchRounded } from '@mui/icons-material';
import { getTokenContractAPI, getAirdropContractAPI, storeAirdropContract, storeTokenContract } from '../actions/searchAPI';
import { AppContext } from '../App';
import Airdrop from '../components/airdrop';

const Contracts = ({ setSigner = noop }) => {
    const [connection, setConnection] = useState({ connected: false });
    const [postType, setPostType] = useState('Token');
    const [errors, setErrors] = useState({});
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const { setNotification, user } = useContext(AppContext);
    const [airdrops, setAirdrops] = useState(user && user.contracts && user.contracts.filter(contract => contract.type === 'standard'));
    const [tokens, setTokens] = useState(user && user.contracts && user.contracts.filter(contract => contract.type === 'token'));
    // console.log('user', user);

    const getHandleChangeValue = valueName => (e) => {
        if (values[valueName] === '' && !!errors[valueName]) {
            const newErrors = { ...errors };
            delete newErrors[valueName];
            setErrors(newErrors);
        }
        if (valueName === 'totalAmount' && e.target.value !== '' && isNaN(parseFloat(e.target.value))) {
            setErrors({ ...errors, [valueName]: 'Please enter a valid number' });
        }
        setValues({ ...values, [valueName]: e.target.value });
    }

    const handleConnect = async () => {
        if (window.ethereum) {
            setLoading(true);
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const network = await provider.getNetwork();
                const signer = await provider.getSigner();
                setSigner(signer);
                setNotification({ text: `Connected to MetaMask: ${signer.address}`, type: 'positive' });
                setConnection({
                    connected: true,
                    network,
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
        <div className='toggleTypeContainer'>
            <ToggleButtonGroup
                color="primary"
                value={postType}
                exclusive
                onChange={handleChangeType}
            >
                <ToggleButton value="Token">Token</ToggleButton>
                <ToggleButton value="Airdrop">Airdrop</ToggleButton>
            </ToggleButtonGroup>
        </div>
    );

    const _existingTokens = () => {
        if (!tokens.length) return null;
        return (
            <div>
                <div className='spacer' />
                <div className='spacer' />
                <div className='airdropTitle'>Existing Tokens:</div>
                <div className='tokensContainer scroll'>
                    {tokens.map(token => (
                        <div key={token.address} className='tokenContainer'>
                            <div className='infoText' style={{ padding: 0, width: 200 }}>{token.name}</div>
                            <div className='infoText' style={{ padding: 0, width: 400, cursor: 'text' }}>{token.address}</div>
                            <div
                                className='infoIcon'
                                onClick={() => {
                                    navigator.clipboard.writeText(token.address);
                                    setNotification({ text: 'Address copied to clipboard', type: 'positive' });
                                }}
                            >
                                <ContentCopyRounded />
                            </div>
                            <div
                                className='infoIcon'
                                onClick={() => {
                                    window.open(`https://sepolia.etherscan.io/token/${token.address}`, '_blank');
                                }}
                            >
                                <LaunchRounded />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const _tokenSection = () => (
        <div>
            {_existingTokens()}
            <div className='spacer' />
            <div className='spacer' />
            <div className='airdropTitle'>New Token:</div>
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
            <TextField
                autoComplete='off'
                error={!!errors.tokenSymbol}
                key="totalAmount_input"
                id="totalAmount_input"
                label="Total Amount"
                required
                variant='outlined'
                margin='normal'
                fullWidth
                value={values.totalAmount}
                InputLabelProps={{ shrink: !!values.totalAmount }}
                onChange={getHandleChangeValue('totalAmount')}
                helperText={errors.totalAmount}
            />
            <Button
                variant='outlined'
                style={{ marginTop: 20 }}
                onClick={async () => {
                    const res = await getTokenContractAPI(values.tokenName, values.tokenSymbol, values.totalAmount);
                    if (res.data.success) {
                        if (res.data.warning) {
                            setNotification({ text: res.data.warning, type: 'info' });
                        } else {
                            setNotification({ text: 'Compiled successfully', type: 'positive' });
                        }
                        const { signer, network } = connection;
                        const relevantContract = res.data.output.contracts[`${values.tokenName}.sol`][values.tokenName]; 
                        const abi = relevantContract.abi;
                        const bytecode = relevantContract.evm.bytecode.object;

                        const factory = new ethers.ContractFactory(abi, bytecode, signer)
                        try {
                            const contract = await factory.deploy();
                            storeTokenContract(contract.target, values.tokenName, values.tokenSymbol, network.chainId.toString());
                            setTokens([...tokens, {
                                address: contract.target,
                                name: `${values.tokenName} (${values.tokenSymbol})`,
                                type: 'token',
                                network: network.chainId.toString()
                            }]);
                            setValues({ ...values, tokenName: '', tokenSymbol: '', totalAmount: '' });
                            setNotification({ text: `Deployment successful! Contract Address: ${contract.target}`, type: 'positive' });
                        } catch (e) {
                            console.log(e);
                            setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
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

    const _newAirdropSection = () => (
        <div>
            {airdrops.length === 0 ? null : <div className='airdropTitle'>New Airdrop:</div>}
            <TextField
                autoComplete='off'
                error={!!errors.airdropName}
                key="airdropName_input"
                id="airdropName_input"
                label="Airdrop Name"
                required
                variant='outlined'
                margin='normal'
                fullWidth
                value={values.airdropName}
                InputLabelProps={{ shrink: !!values.airdropName }}
                onChange={getHandleChangeValue('airdropName')}
                helperText={errors.airdropName}
            />
            <TextField
                autoComplete='off'
                error={!!errors.tokenAddress}
                key="tokenAddress_input"
                id="tokenAddress_input"
                label="Token Address"
                required
                variant='outlined'
                margin='normal'
                fullWidth
                value={values.tokenAddress}
                InputLabelProps={{ shrink: !!values.tokenAddress }}
                onChange={getHandleChangeValue('tokenAddress')}
                helperText={errors.tokenAddress}
            />
            <Button
                variant='outlined'
                style={{ marginTop: 20 }}
                onClick={async () => {
                    const res = await getAirdropContractAPI(values.tokenAddress);
                    if (res.data.success) {
                        if (res.data.warning) {
                            setNotification({ text: res.data.warning, type: 'info' });
                        } else {
                            setNotification({ text: 'Compiled successfully', type: 'positive' });
                        }
                        const { signer, network } = connection;
                        const relevantContract = res.data.output.contracts['Airdrop.sol']['Airdrop']; 
                        const abi = relevantContract.abi;
                        const bytecode = relevantContract.evm.bytecode.object;

                        const factory = new ethers.ContractFactory(abi, bytecode, signer)
                        try {
                            const contract = await factory.deploy();
                            storeAirdropContract(contract.target, values.airdropName, values.tokenAddress, network.chainId.toString());
                            setAirdrops([...airdrops, {
                                address: contract.target,
                                name: values.airdropName,
                                type: 'standard',
                                network: network.chainId.toString()
                            }]);
                            setValues({ ...values, airdropName: '', tokenAddress: '' });
                            setNotification({ text: `Deployment successful! Contract Address: ${contract.target}`, type: 'positive' });
                        } catch (e) {
                            console.log(e);
                            setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
                        }
                    } else {
                        setNotification({ text: res.data.error, type: 'negative' });
                    }
                }}
                disabled={!connection.connected || loading || !values.tokenAddress || !values.airdropName}
            >
                <span style={{ fontSize: 14 }}>Submit</span>
            </Button>
        </div>
    );


    const _airdropSection = () => (
        <div className='airdropsSectionContainer'>
            {airdrops.length ? <Airdrop airdrops={airdrops} connection={connection} /> : null}
            {_newAirdropSection()}
        </div>
    );

    const _inputsSection= () => {
        if (postType === 'Airdrop') return _airdropSection();
        return _tokenSection()
    }

    return (
        <div className="mainContainer scroll">
            {connection.connected ? (
                <div className='pageContainer'>
                    <div className='infoText' style={{ display: 'flex', flexDirection: 'row' }}>
                        Connected with address <div className='address'>{connection.signer.address}</div>
                    </div>
                    {_typeToggle()}
                    {_inputsSection()}
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
                            Please install <a rel='noreferrer' className='linkText' href="https://metamask.io/download/" target="_blank">MetaMask</a>
                        </div>
                    )}
                    {loading && <div className='loadingIndicator' style={{ margin: 20 }}><CircularProgress size={20} /></div>}
                </div>
            )}
        </div>
    );
}

export default Contracts;