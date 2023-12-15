import React, { useEffect, useState, useContext } from 'react';
import  '../styles/airdrop.css';
import { noop } from 'lodash';
import { ethers } from 'ethers';
import {
    Button,
    CircularProgress
} from '@mui/material';
import { AppContext } from '../App';

const Airdrop = ({ setSigner = noop }) => {
    const [connection, setConnection] = useState({ connected: false });
    const [loading, setLoading] = useState(false);
    const { setNotification } = useContext(AppContext);

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

    return (
        <div className="mainContainer">
            {connection.connected ? (
                <div className='infoText'>
                    Connected with address {connection.signer.address}
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