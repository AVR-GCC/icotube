import React, { useEffect, useState, useContext } from 'react';
import  '../styles/airdrop.css';
import  '../styles/publish.css';
import { noop } from 'lodash';
import { ethers } from 'ethers';
import { Tooltip } from 'react-tooltip';
import {
    Button,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { getTokenContractAPI, getAirdropContractAPI, storeAirdropContract } from '../actions/searchAPI';
import { AppContext } from '../App';

const Airdrop = ({ setSigner = noop }) => {
    const [connection, setConnection] = useState({ connected: false });
    const [postType, setPostType] = useState('Token');
    const [errors, setErrors] = useState({});
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const { setNotification, user } = useContext(AppContext);
    const airdrops = user && user.contracts && user.contracts.filter(contract => contract.type === 'standard');
    console.log('user', user);

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
                <ToggleButton value="Airdrop">Airdrop</ToggleButton>
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
                        const { signer } = connection;
                        const relevantContract = res.data.output.contracts[`${values.tokenName}.sol`][values.tokenName]; 
                        const abi = relevantContract.abi;
                        const bytecode = relevantContract.evm.bytecode.object;

                        const factory = new ethers.ContractFactory(abi, bytecode, signer)
                        try {
                            const contract = await factory.deploy();
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
                        const { signer } = connection;
                        const relevantContract = res.data.output.contracts['Airdrop.sol']['Airdrop']; 
                        const abi = relevantContract.abi;
                        const bytecode = relevantContract.evm.bytecode.object;

                        const factory = new ethers.ContractFactory(abi, bytecode, signer)
                        try {
                            const contract = await factory.deploy();
                            storeAirdropContract(contract.target, values.airdropName, values.tokenAddress);
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

    const _recipientInfo = () => (
        <div>
            <div data-tooltip-id='info-tip' className='infoIcon'><InfoOutlined /></div>
            <Tooltip
                id="info-tip"
                place="right"
                variant="info"
                content={<div>Input a list of the recipients of the airdrop,<br />
                each line should have one address and the amount<br />
                that address is to receive separated by a comma.<br />
                </div>}
            />
        </div>
    );

    const _airdropBlockTopRow = (airdrop) => (
        <div className='topRow'>
            <div className='airdropTitle'>
                {airdrop.name}
            </div>
            <div className='addressesPortion'>
                <div className='addressesPortionPart'>
                    <div className='addressLabel'>Airdrop Address:</div>
                    <div className='address'>{airdrop.address}</div>
                </div>
                <div className='addressesPortionPart'>
                    <div className='addressLabel'>Token Address:</div>
                    <div className='address'>{airdrop.tokenAddress}</div>
                </div>
            </div>
            {_recipientInfo()}
        </div>
    );

    const _airdropBlockInputSection = (airdrop) => (
        <>
            <div className='label'>Recipients:</div>
            <TextField
                autoComplete='off'
                error={!!errors[`${airdrop.name}Recipients`]}
                key={`${airdrop.name}_input`}
                id={`${airdrop.name}_input`}
                label={values[`${airdrop.name}Recipients`] ? '' :
                    <div>0x1234123412341234123123412341234123412341,100<br />
                    0x5678567856785678567856785678567856785678,200<br />
                    0x9ABC9ABC9ABC9ABC9ABC9ABC9ABC9ABC9ABC,300<br />.....</div>}
                multiline
                variant='outlined'
                margin='normal'
                type='text'
                onWheel={event => event.target.blur()}
                fullWidth
                value={values[`${airdrop.name}Recipients`]}
                InputLabelProps={{ shrink: false }}
                onChange={getHandleChangeValue(`${airdrop.name}Recipients`)}
                helperText={errors[`${airdrop.name}Recipients`]}
                sx={{ overflowY: 'auto', height: '150px' }}
            />
        </>
    );

    const _airdropBlock = (airdrop) => (
        <div key={airdrop.address} className='airdropContainer'>
            {_airdropBlockTopRow(airdrop)}
            {_airdropBlockInputSection(airdrop)}
        </div>
    );

    const _airdropSection = () => (
        <div>
            <div className='existingAirdropsContainer'>
                {airdrops.map(_airdropBlock)}
            </div>
            {_newAirdropSection()}
        </div>
    );

    const _inputsSection= () => {
        if (postType === 'Airdrop') return _airdropSection();
        return _tokenSection()
    }

    return (
        <div className="mainContainer">
            {connection.connected ? (
                <div>
                    <div className='infoText'>
                        Connected with address {connection.signer.address}
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

export default Airdrop;