import React, { useState, useContext, useEffect, useRef } from 'react';
import  '../styles/contracts.css';
import  '../styles/publish.css';
import { getAddress, parseEther, formatEther, Contract } from 'ethers';
import { Tooltip } from 'react-tooltip';
import {
    Button,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ListItemText,
    TextField
} from '@mui/material';
import { InfoOutlined, UndoOutlined, Download, Delete } from '@mui/icons-material';
import { AppContext } from '../App';
import { airdropABI, tokenABI } from '../constants/abis';
import { roundToTwoSubstantialDigits } from '../utils';
import { deleteUserContract } from '../actions/searchAPI';

const baseValidObject = {
    leftValid: {
        tokens: false,
        ethers: false
    },
    rightValid: { tokens: false },
    canDrop: false,
    canDisplayDiff: false
};

function Airdrop({ airdrops, connection, defaultAirdrop, setAirdrops, setLoading }) {
    const [airdrop, setAirdrop] = useState(airdrops[defaultAirdrop || 0]);

    const [recipientsObj, setRecipientsObj] = useState({
        addresses: [],
        amounts: [],
        str: '',
        error: '',
        valid: false,
        total: 0n
    });

    // const [airdropCost, setAirdropCost] = useState(0);

    const [transferXObj, setTransferXObj] = useState({
        str: '',
        error: '',
        number: 0
    });

    const [balancesObject, setBalancesObject] = useState({
        loading: true,
        userBalances: {},
        airdropBalances: {}
    });

    const [buttonsValid, setButtonsValid] = useState({ ...baseValidObject });

    const [isEtherMode, setIsEtherMode] = useState(false);

    const { setNotification } = useContext(AppContext);

    const transferInputRef = useRef(null);

    const setValidArrows = (numberStr, userBalances, airdropBalances) => {
        const rightValid = { tokens: false };
        const leftValid = { tokens: false, ethers: false };
        if (!numberStr) {
            leftValid.tokens = 0 < airdropBalances.tokens;
            leftValid.ethers = 0 < airdropBalances.ethers;
            setButtonsValid({ ...buttonsValid, leftValid, rightValid });
            return;
        }
        try {
            getAddress(numberStr);
            leftValid.tokens = 0 <= airdropBalances.tokens;
            leftValid.ethers = 0 <= airdropBalances.ethers;
            setButtonsValid({ ...buttonsValid, leftValid, rightValid });
            return;
        } catch (e) {}

        try {
            if (!isNaN(parseFloat(numberStr))) {
                const wei = parseEther(numberStr);
                rightValid.tokens = wei <= userBalances.tokens;
            }
        } catch (e) {}
        setButtonsValid({ ...buttonsValid, leftValid, rightValid });
    }

    const getBalances = async () => {
        setBalancesObject({ ...balancesObject, loading: true });
        const { provider, signer } = connection;
        const tokenContract = new Contract(airdrop.tokenAddress, tokenABI, provider);
        const userBalances = {
            tokens: await tokenContract.balanceOf(signer.address),
            ethers: await provider.getBalance(signer.address)
        };
        const airdropBalances = {
            tokens: await tokenContract.balanceOf(airdrop.address),
            ethers: await provider.getBalance(airdrop.address)
        };
        setBalancesObject({ userBalances, airdropBalances, loading: false });
        setValidArrows(transferInputRef?.current?.value || '', userBalances, airdropBalances);
    }

    useEffect(() => {
        getBalances();
    }, [airdrop]);

    useEffect(() => {
        if (defaultAirdrop !== -1) setAirdrop(airdrops[defaultAirdrop]);
    }, [defaultAirdrop]);

    useEffect(() => {
        let canDrop = false;
        let canDisplayDiff = false;
        const useBalance = isEtherMode ? balancesObject?.userBalances?.['ethers'] : balancesObject?.airdropBalances['tokens'];
        if (typeof useBalance === 'bigint' && typeof recipientsObj.total === 'bigint' && recipientsObj.valid) {
            canDisplayDiff = true;
            const userBalance = parseFloat(formatEther(useBalance.toString()));
            const total = parseFloat(formatEther(recipientsObj.total.toString()));
            const diff = total - userBalance;
            if (diff <= 0) {
                canDrop = true;
            }
        }
        if (canDrop !== buttonsValid.canDrop || canDisplayDiff !== buttonsValid.canDisplayDiff) {
            setButtonsValid({ ...buttonsValid, canDrop, canDisplayDiff });
        }
    }, [balancesObject, recipientsObj, isEtherMode]);

    const weiToDisplay = (wei) => {
        const bigIntEther = formatEther(wei);
        const floatEther = parseFloat(bigIntEther);
        const rounded = roundToTwoSubstantialDigits(floatEther);
        const roundedString = rounded.toString();
        const sliced = roundedString[5] === '0' ? roundedString.slice(0, 5) : roundedString.slice(0, 6);
        return sliced;
    }

    const handleChangeTokenAmount = (event) => {
        transferInputRef.current = event.target;
        const { value } = event.target;
        const number = parseFloat(value);
        const error = isNaN(number) ? 'Invalid amount' : '';
        setTransferXObj({ str: value, error, number });
        setValidArrows(value, balancesObject.userBalances, balancesObject.airdropBalances);
    }

    const handleChangeRecipientString = (event) => {
        const { value } = event.target;
        const { addresses, amounts, error, total } = parseRecipientsString(value);
        setRecipientsObj({ addresses, amounts, str: value, valid: !error, error, total });
    }

    const parseRecipientsString = (recipientsString) => {
        const addresses = [];
        const amounts = [];
        const lines = recipientsString.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const [address, amount] = line.split(',');
            if (!address || !amount) {
                return {
                    addresses: [],
                    amounts: [],
                    error: 'Invalid recipients string at line ' + (i + 1)
                };
            }

            try {
                const gottenAddress = getAddress(address);
                addresses.push(gottenAddress);
            } catch (e) {
                return {
                    addresses: [],
                    amounts: [],
                    error: 'Invalid address at line ' + (i + 1)
                };
            }

            try {
                const gottenAmount = parseEther(amount);
                amounts.push(gottenAmount);
            } catch (e) {
                return {
                    addresses: [],
                    amounts: [],
                    error: 'Invalid amount at line ' + (i + 1)
                };
            }
        }
        // evaluateAirdropFunctionCost(airdrop, 'dropTokens', [addresses, amounts]).then(setAirdropCost);
        return { addresses, amounts, total: amounts.reduce((a, b) => a + b, 0n), error: '' };
    }

    // const evaluateAirdropFunctionCost = async (airdrop, func, args) => {
    //     const { provider, signer } = connection;
    //     const airdropContract = new Contract(airdrop.address, airdropABI, provider);
    //     const tx = {
    //         to: airdrop.address,
    //         from: signer.address,
    //         data: airdropContract.interface.encodeFunctionData(func, args)
    //     };

    //     const estimate = await provider.estimateGas(tx);
    //     const estimatedCost = await provider.getFeeData();
    //     const totalCostInWei = estimatedCost.maxFeePerGas * estimate;
    //     return weiToDisplay(totalCostInWei);
    // }

    const _infoIcon = (id, content) => (
        <div>
            <div data-tooltip-id={id} className='infoIcon'><InfoOutlined /></div>
            <Tooltip
                className='tooltip'
                id={id}
                place="left"
                variant="info"
                content={content}
            />
        </div>
    );

    const _recipientInfo = () => _infoIcon('recepient-info-tip', <div>
        Input a list of the recipients of the airdrop,<br />
        each line should have one address and the amount<br />
        that address is to receive separated by a comma.<br />
    </div>);

    const _transferInfo = () => _infoIcon('transfer-info-tip', <div>
        Before doing any airdrop, input the recipients list in the input box on the right,<br />
        Solve any errors and see the total drop amount.<br />
        <br />
        Tokens:<br />
        To airdrop tokens confirm the "tokens" toggle is selected,<br />
        send the tokens to be droped to the contract: input the token amount<br />
        and press the arrow on the right to send the tokens to the contract.
        Once the contract has more than the total drop amount clock "Drop"<br />
        <br />
        Ethereum:<br />
        To airdrop Ethereum confirm the "ethers" toggle is selected and click "Drop"<br />
        the Ethereum will be sent in the drop transaction itself.<br />
        <br />
        To withdraw Ethereum or tokens from the contract input the recipient address,<br />
        or leave empty to send to yourself, and press the arrow on the left<br />
        to send all the Ethereum or tokens from the contract to the recipient address.
    </div>);

    const _title = () => airdrops.length === 1 ? <div className='airdropTitle'>{airdrop.name}</div> : (
        <div className='airdropSelectHolder'>
            <FormControl
                variant='outlined'
                margin='normal'
                fullWidth
            >
                <InputLabel id='airdrop-select-label'>Airdrop Select</InputLabel>
                <Select
                    labelId='airdrop-select-label'
                    id='airdrop-select'
                    value={airdrop.name}
                    label='Airdrop Select'
                    onChange={arg => {
                        const newAirdrop = airdrops.find(op => op.name === arg.target.value);
                        setAirdrop(newAirdrop);
                    }}
                >
                    {airdrops.map((op) =>
                        <MenuItem key={`${op.name}_option`} value={op.name}>
                            <ListItemText primary={op.name} />
                        </MenuItem>
                    )}
                </Select>
                {/* <FormHelperText>Disabled</FormHelperText> */}
            </FormControl>
        </div>
    );

    const _airdropBlockTopRow = () => (
        <div className='topRow'>
            {_title()}
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
            <div
                className='infoIcon'
                onClick={async() => {
                    const oldAirdrops = airdrops;
                    const oldAirdrop = airdrop;
                    const newAirdrops = airdrops.filter(t => t.address !== airdrop.address);
                    setAirdrops(newAirdrops);
                    setAirdrop(newAirdrops[0]);
                    const res = await deleteUserContract(airdrop.address);
                    if (!res.data.success) {
                        setNotification({ text: res.data.error.message, type: 'negative' });
                        setAirdrops(oldAirdrops);
                        setAirdrop(oldAirdrop);
                    }
                }}
            >
                <Delete />
            </div>
        </div>
    );

    const _airdropBlockTransferXButtonSection = (left) => (
        <div className='buttonSection'>
            <Button
                variant='outlined'
                style={{ height: 100, width: 40 }}
                onClick={async () => {
                    const { provider, signer } = connection;
                    try {
                        let transferRespone;
                        if (left) {
                            const disconnectedAirdropContract = new Contract(airdrop.address, airdropABI, provider);
                            const airdropContract = disconnectedAirdropContract.connect(signer);
                            setButtonsValid({ ...baseValidObject });
                            setLoading(true);
                            transferRespone = await airdropContract[isEtherMode ? 'withdrawEther' : 'withdrawTokens'](signer.address);
                        } else if (!isEtherMode) {
                            const value = parseEther(transferXObj.str);
                            const disconnectedTokenContract = new Contract(airdrop.tokenAddress, tokenABI, provider);
                            const tokenContract = disconnectedTokenContract.connect(signer);
                            setButtonsValid({ ...baseValidObject });
                            setLoading(true);
                            transferRespone = await tokenContract.transfer(airdrop.address, value);
                        }
                        setTransferXObj({ str: '', error: '', number: 0 });
                        transferInputRef.current.value = '';
                        setNotification({ text: <div>Transaction sent:<br />{transferRespone.hash}<br />waiting for confirmation...</div>, type: 'positive' });
                        const transferReciept = await transferRespone.wait();
                        setLoading(false);
                        setNotification({ text: `Transaction confirmed in block ${transferReciept.blockNumber}`, type: 'positive' });
                        getBalances();
                    } catch (e) {
                        setLoading(false);
                        console.log(e);
                        setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
                        getBalances();
                    }
                }}
                disabled={!connection.connected || !buttonsValid?.[left ? 'leftValid' : 'rightValid']?.[isEtherMode ? 'ethers' : 'tokens']}
            >
                {left ?
                    <div style={{ transform: 'scale(1.7, 3.5)', marginTop: 22 }}><Download /></div>
                    : <div style={{ transform: 'rotate(82deg) scale(3, 2.2)', marginRight: 15 }}><UndoOutlined /></div>}
            </Button>
        </div>
    );

    const _airdropBlockDoDropButtonSection = () => (
        <div className='buttonSection'>
            <Button
                variant='outlined'
                style={{ marginTop: 20 }}
                onClick={async () => {
                    const { addresses, amounts } = recipientsObj;
                    const { provider, signer } = connection;
                    // console.log('recipients', addresses, amounts);
                    try {
                        const airdropContractDisconnected = new Contract(airdrop.address, airdropABI, provider);
                        const airdropContract = airdropContractDisconnected.connect(signer);
                        const functionName = isEtherMode ? 'dropEther' : 'dropTokens';
                        const args = [addresses, amounts];
                        if (isEtherMode) {
                            args.push({ value: recipientsObj.total });
                        }
                        setButtonsValid({ ...baseValidObject });
                        setLoading(true);
                        const transferRespone = await airdropContract[functionName](...args);
                        setNotification({ text: <div>Transaction sent:<br />{transferRespone.hash}<br />waiting for confirmation...</div>, type: 'positive' });
                        const transferReciept = await transferRespone.wait();
                        setLoading(false);
                        setNotification({ text: `Transaction confirmed in block ${transferReciept.blockNumber}`, type: 'positive' });
                        getBalances();
                    } catch (e) {
                        setLoading(false);
                        console.log(e);
                        setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
                        getBalances();
                    }
                }}
                disabled={!connection.connected || !buttonsValid.canDrop}
            >
                <span style={{ fontSize: 14 }}>Drop</span>
            </Button>
        </div>
    );

    const _airdropBlockTransferXSectionTitle = () => (
            <div className='sectionTitle'>
                <div style={{ width: 100 }}/>
                <div className='label'>
                    Transfer
                    <div className='spacer' />
                    <div className='toggleTypeContainerSmall' style={{ marginTop: 0 }}>
                        <ToggleButtonGroup
                            color="primary"
                            value={isEtherMode ? 'ethers' : 'tokens'}
                            exclusive
                            onChange={event => setIsEtherMode(event.target.value === 'ethers')}
                        >
                            <ToggleButton value="tokens">tokens</ToggleButton>
                            <ToggleButton value="ethers">ethers</ToggleButton>
                        </ToggleButtonGroup>
                    </div>:
                </div>
                {_transferInfo()}
            </div>
    );

    const _airdropBlockTransferXSection = () => {
        let topLabel = <div className='loadingIndicator' style={{ margin: 20 }}><CircularProgress size={20} /></div>;
        let bottomLabel = <div className='loadingIndicator' style={{ margin: 20 }}><CircularProgress size={20} /></div>;
        if (!balancesObject.loading) {
            const { userBalances, airdropBalances } = balancesObject;
            const useMode = isEtherMode ? 'ethers' : 'tokens';
            bottomLabel = (
                <div className='balanceLabel'>
                    {weiToDisplay(userBalances[useMode])}
                </div>
            );
            topLabel = (
                <div className='balanceLabel'>
                    {weiToDisplay(airdropBalances[useMode])}
                </div>
            );
        }
        return (
            <div className='sectionContainer'>
                {_airdropBlockTransferXSectionTitle()}
                <div className='spacer' />
                <div className='spacer' />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {_airdropBlockTransferXButtonSection(true)}
                    <div className='tranferSectionMiddle'>
                        <div className='label'>
                            Airdrop (<div style={{ cursor: 'text' }}>{airdrop.address}</div>) amount
                        </div>
                        <div className='spacer' />
                        <div className='spacer' />
                        <div className='balanceLabelHolder'>{topLabel}</div>
                        <TextField
                            autoComplete='off'
                            error={!!transferXObj.error}
                            key={`${airdrop.name}_amount_input`}
                            id={`${airdrop.name}_amount_input`}
                            label={transferXObj.str ? '' : 'Amount / Address'}
                            variant='outlined'
                            margin='normal'
                            type='text'
                            fullWidth
                            InputLabelProps={{ shrink: false }}
                            onChange={handleChangeTokenAmount}
                            helperText={transferXObj.error}
                        />
                        <div className='balanceLabelHolder'>{bottomLabel}</div>
                        <div className='spacer' />
                        <div className='spacer' />
                        <div className='label'>
                            Wallet (<div style={{ cursor: 'text' }}>{connection.signer.address}</div>) amount
                        </div>
                    </div>
                    {_airdropBlockTransferXButtonSection(false)}
                </div>
            </div>
        );
    }

    const _airdropBlockDoDropNumbers = () => {
        let style = {};
        let missing = '-';
        let total = '-';
        if (recipientsObj.valid) {
            total = parseFloat(formatEther(recipientsObj.total.toString()));
        }
        if (buttonsValid.canDisplayDiff) {
            const useBalance = isEtherMode ? balancesObject?.userBalances?.['ethers'] : balancesObject?.airdropBalances['tokens'];
            const userBalance = parseFloat(formatEther(useBalance.toString()));
            const diff = total - userBalance;
            if (diff > 0) {
                style = { color: '#d32f2f' };
                missing = roundToTwoSubstantialDigits(diff);
            }
        }
        return (
            <div className='dropNumbers'>
                <div className='dropNumbersSide'>
                    <div className='label dropNumbersLabel'>
                        total drop value:
                    </div>
                    <div className='balanceLabel' style={style}>
                        {missing}
                    </div>
                </div>
                <div className='dropNumbersSide' style={{ marginTop: -20 }}>
                    <div className='balanceLabel'>
                        {total}
                    </div>
                    <div className='label dropNumbersLabel'>
                        missing
                    </div>
                </div>
            </div>
        );
    }

    const _airdropBlockDoDropSection = () => (
        <div className='sectionContainer recipients'>
            <div className='sectionTitle'>
                <div className='label'>
                    Recipients:
                </div>
                {_recipientInfo()}
            </div>
            <TextField
                autoComplete='off'
                error={!!recipientsObj.error}
                key={`${airdrop.name}_input`}
                id={`${airdrop.name}_input`}
                label={recipientsObj.str ? '' :
                    <div>0x1234123412341234123123412341234123412341,100<br />
                    0x5678567856785678567856785678567856785678,200<br />
                    0x9ABC9ABC9ABC9ABC9ABC9ABC9ABC9ABC9ABC,300<br />.....</div>}
                multiline
                rows={4}
                variant='outlined'
                margin='normal'
                type='text'
                onWheel={event => event.target.blur()}
                fullWidth
                value={recipientsObj.str}
                InputLabelProps={{ shrink: false }}
                onChange={handleChangeRecipientString}
                helperText={recipientsObj.error}
            />
            {!recipientsObj.error && <div style={{ height: 23 }} />}
            {_airdropBlockDoDropNumbers()}
            {_airdropBlockDoDropButtonSection()}
        </div>
    );

    const _airdropBlock = () => (
        <div key={airdrop.address} className='airdropContainer'>
            {_airdropBlockTopRow()}
            <div className='sections'>
                {_airdropBlockTransferXSection()}
                {_airdropBlockDoDropSection()}
            </div>
        </div>
    );

    return _airdropBlock();
}

export default Airdrop;
