import React, { useState, useEffect} from "react";
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;    //0x4d09e987A81b648C4Eca1360f1d2922c3c79F96F

const getEthereumContract = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData({ ...formData, [name]: e.target.value });
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Make sure you have install metamask!");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = await getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({ 
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: "0x5208", //21000 Gwei
                    value: parsedAmount._hex,
                }] 
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, message, parsedAmount, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);
            
            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());
            window.location.reload();
        }
        catch (error) {
            console.log(error);

            throw new Error("No Ethereum object.");
        }
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert("Make sure you have install metamask!");

            const transactionContract = await getEthereumContract();
            const available = await transactionContract.getAllTransactions();

            const structuredTransactions = available.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18),
            }));

            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);

            throw new Error("No Ethereum object.");  
        }
    }
    
    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Make sure you have install metamask!");
            
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
    
                getAllTransactions();
            } else {
                console.log("No previous account found");
            }
        } catch (error) {
            console.log(error);

            throw new Error("No Ethereum object.");            
        }
    }

    const checkIfTransactionExists = async () => {
        try {
            if (!ethereum) return alert("Make sure you have install metamask!");
            
            const transactionContract = await getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            localStorage.setItem("transactionCount", transactionCount);
        }
        catch (error) {
            console.log(error);

            throw new Error("No Ethereum object.");
        }
    }
    
    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Make sure you have install metamask!");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error("No Ethereum object.");
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionExists();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, isLoading, transactions }}>
            {children}
        </TransactionContext.Provider>
    );
}