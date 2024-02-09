import React, { useState, useContext, useEffect } from 'react';
import  '../styles/contracts.css';
import  '../styles/publish.css';
import { ethers, getAddress, parseEther } from 'ethers';
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
import { InfoOutlined, UndoOutlined } from '@mui/icons-material';
import { AppContext } from '../App';
import { airdropABI, tokenABI } from '../constants/abis';
import { roundToTwoSubstantialDigits } from '../utils';


function Airdrop({ airdrops, connection }) {
    const [airdrop, setAirdrop] = useState(airdrops[0]);

    const [recipientsObj, setRecipientsObj] = useState({
        addresses: [],
        amounts: [],
        str: '',
        error: '',
        valid: false,
        total: 0n
    });

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

    const [arrowsValid, setArrowsValid] = useState({
        leftValid: {
            tokens: false,
            ethers: false
        },
        rightValid: {
            tokens: false,
            ethers: false
        }
    });

    const [isEtherMode, setIsEtherMode] = useState(false);

    const { setNotification } = useContext(AppContext);

    const setValidArrows = (number, userBalances, airdropBalances) => {
        if (!number || isNaN(number)) {
            setArrowsValid({
                leftValid: {
                    tokens: false,
                    ethers: false
                },
                rightValid: {
                    tokens: false,
                    ethers: false
                }
            });
            return;
        }
        const wei = ethers.parseEther(number.toString());
        const rightValid = {
            tokens: wei <= userBalances.tokens,
            ethers: wei <= userBalances.ethers
        };
        const leftValid = {
            tokens: wei <= airdropBalances.tokens,
            ethers: wei <= airdropBalances.ethers
        };
        setArrowsValid({ leftValid, rightValid });
    }

    const getBalances = async () => {
        setBalancesObject({ ...balancesObject, loading: true });
        const { provider, signer } = connection;
        const tokenContract = new ethers.Contract(airdrop.tokenAddress, tokenABI, provider);
        const userBalances = {
            tokens: await tokenContract.balanceOf(signer.address),
            ethers: await provider.getBalance(signer.address)
        };
        const airdropBalances = {
            tokens: await tokenContract.balanceOf(airdrop.address),
            ethers: await provider.getBalance(airdrop.address)
        };
        setBalancesObject({ userBalances, airdropBalances, loading: false });
        setValidArrows(transferXObj.number, userBalances, airdropBalances);
    }

    useEffect(() => {
        getBalances();
    }, [airdrop]);

    const weiToDisplay = (wei) => {
        const bigIntEther = ethers.formatEther(wei);
        const floatEther = parseFloat(bigIntEther);
        const rounded = roundToTwoSubstantialDigits(floatEther);
        const roundedString = rounded.toString();
        const sliced = roundedString[5] === '0' ? roundedString.slice(0, 5) : roundedString.slice(0, 6);
        return sliced;
    }

    const handleChangeTokenAmount = (event) => {
        const { value } = event.target;
        const number = parseFloat(value);
        const error = isNaN(number) ? 'Invalid amount' : '';
        setTransferXObj({ str: value, error, number });
        setValidArrows(number, balancesObject.userBalances, balancesObject.airdropBalances);
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
        return { addresses, amounts, total: amounts.reduce((a, b) => a + b, 0n), error: '' };
    }

    const evaluateAirdropFunctionCost = async (airdrop, func, args) => {
        const { provider, signer } = connection;
        const airdropContract = new ethers.Contract(airdrop.address, airdropABI, provider);
        const tx = {
            to: airdrop.address,
            from: signer.address,
            data: airdropContract.interface.encodeFunctionData(func, args)
        };

        const estimate = await provider.estimateGas(tx);
        const estimatedCost = await provider.getFeeData();
        const totalCostInWei = estimatedCost.maxFeePerGas * estimate;
        return weiToDisplay(totalCostInWei);
    }

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
        </div>
    );

    const _airdropBlockTransferXButtonSection = (left) => (
        <div className='buttonSection'>
            <Button
                variant='outlined'
                style={{ height: 100, width: 40 }}
                onClick={async () => {
                    const { number } = transferXObj;
                    console.log('sendTokens', number);
                    try {
                        console.log(await evaluateAirdropFunctionCost(airdrop, 'sendTokens', [number]));
                    } catch (e) {
                        console.log(e);
                        setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
                    }
                }}
                disabled={!connection.connected || !arrowsValid?.[left ? 'leftValid' : 'rightValid']?.[isEtherMode ? 'ethers' : 'tokens']}
            >
                <div style={{ transform: `rotate(${left ? 262 : 82}deg) scale(3, 2.2)`, [left ? 'marginLeft' : 'marginRight']: 15 }}><UndoOutlined /></div>
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
                    console.log('recipients', addresses, amounts);
                    try {
                        console.log(await evaluateAirdropFunctionCost(airdrop, 'dropTokens', [addresses, amounts]));
                    } catch (e) {
                        console.log(e);
                        setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
                    }
                }}
                disabled={!connection.connected || !recipientsObj.valid}
            >
                <span style={{ fontSize: 14 }}>Submit</span>
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
                            label={transferXObj.str ? '' : 'Amount'}
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
                rows={7}
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
            {_airdropBlockDoDropButtonSection(airdrop)}
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
