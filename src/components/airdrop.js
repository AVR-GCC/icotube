import React, { useState, useContext } from 'react';
import  '../styles/contracts.css';
import  '../styles/publish.css';
import { ethers, getAddress, parseEther } from 'ethers';
import { Tooltip } from 'react-tooltip';
import {
    Button,
    TextField
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { AppContext } from '../App';
import { airdropABI } from '../constants/abis';
import { roundToTwoSubstantialDigits } from '../utils';


function Airdrop({ airdrop, connection }) {
    const [recipientsObj, setRecipientsObj] = useState({
        addresses: [],
        amounts: [],
        str: '',
        error: '',
        valid: false,
        total: 0n
    });

    const [sendTokensObj, setSendTokensObj] = useState({
        str: '',
        error: '',
        valid: false,
        number: 0
    });

    const { setNotification } = useContext(AppContext);

    const handleChangeTokenAmount = (event) => {
        const { value } = event.target;
        const number = parseFloat(value);
        if (isNaN(number)) {
            setSendTokensObj({ str: value, valid: false, error: value !== '' && 'Invalid amount', number });
        } else {
            setSendTokensObj({ str: value, valid: true, error: '', number });
        }
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
        const totalCostInEther = ethers.formatEther(totalCostInWei);
        const rounded = roundToTwoSubstantialDigits(parseFloat(totalCostInEther));
        const roundedString = rounded.toString();
        const sliced = roundedString[5] === '0' ? roundedString.slice(0, 5) : roundedString.slice(0, 6);
        return sliced;
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

    const _airdropBlockTopRow = () => (
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
        </div>
    );

    const _airdropBlockTransferTokensButtonSection = () => (
        <div className='buttonSection'>
            <Button
                variant='outlined'
                style={{ marginTop: 20 }}
                onClick={async () => {
                    const { number } = sendTokensObj;
                    console.log('sendTokens', number);
                    try {
                        console.log(await evaluateAirdropFunctionCost(airdrop, 'sendTokens', [number]));
                    } catch (e) {
                        console.log(e);
                        setNotification({ text: `Error deploying contract: ${e.reason}`, type: 'negative' });
                    }
                }}
                disabled={!connection.connected || !sendTokensObj.valid}
            >
                <span style={{ fontSize: 14 }}>Submit</span>
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

    const _airdropBlockTransferTokensSection = () => (
        <div className='sectionContainer'>
            <div className='sectionTitle'>
                <div className='label'>
                    Send Tokens:
                </div>
            </div>
            <TextField
                autoComplete='off'
                error={!!sendTokensObj.error}
                key={`${airdrop.name}_amount_input`}
                id={`${airdrop.name}_amount_input`}
                label={sendTokensObj.str ? '' : 'Amount'}
                variant='outlined'
                margin='normal'
                type='text'
                fullWidth
                InputLabelProps={{ shrink: false }}
                onChange={handleChangeTokenAmount}
                helperText={sendTokensObj.error}
            />
            {_airdropBlockTransferTokensButtonSection(airdrop)}
        </div>
    );

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
            {_airdropBlockDoDropButtonSection(airdrop)}
        </div>
    );

    const _airdropBlock = () => (
        <div key={airdrop.address} className='airdropContainer'>
            {_airdropBlockTopRow(airdrop)}
            <div className='sections'>
                {_airdropBlockTransferTokensSection(airdrop)}
                {_airdropBlockDoDropSection(airdrop)}
            </div>
        </div>
    );

    return _airdropBlock();
}

export default Airdrop;
