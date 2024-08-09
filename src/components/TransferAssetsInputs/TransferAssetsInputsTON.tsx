import { useEffect, useState } from 'react';
import { useAccount, useBalance, useConfig, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { bridgeAbi } from '../../generated';
import { erc20Abi, isAddress } from 'viem';
import { networkConfig } from '../../networkConfig';
import { convertDecimals, formatTON, formatWTON, hasTestnetFlag, isValidTonAddress, parseTON, stripDecimals } from '../../utils/utils';
import { ConnectKitButton } from 'connectkit';
import { readContract } from 'wagmi/actions';
import { HistoryEntry, saveHistoryEntry } from '../HistoryStorage';
import TransferAssetsInputs from './TransferAssetsInputs';
import TextInput from './TextInput';
import { useTonClient } from '../../hooks/useTonClient';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, beginCell } from '@ton/core';

interface TransferAssetsInputsTONProps {
  onBridgeTransactionSent: (data: {
    transactionSenderAddress: string | undefined,
    destinationAddress: `0x${string}` | undefined,
    amount: string
  }) => void
}

const TransferAssetsInputsTON: React.FC<TransferAssetsInputsTONProps> = ({ onBridgeTransactionSent }) => {
  const [warning, setWarning] = useState("");
  const [isValidAmountString, setIsValidAmountString] = useState(false);
  const [userBalance, setUserBalance] = useState<bigint | undefined>();
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState<`0x${string}` | undefined>();
  const client = useTonClient();
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();


  useEffect(() => {
    if (!client || !tonWallet) return;
    
    // console.log(tonWallet.account.address)
    client.getBalance(Address.parse(tonWallet.account.address))
      .then(balance => { setUserBalance(balance); console.log(balance) })
      .catch(console.log);
  }, [client, tonWallet]);


  const handleValidation = (() => {
    setIsValidAmountString(false);
    if (amount) {

      if (!amount.match(/^\d+(\.\d+)?$/g)) {
        setWarning("Invalid amount");
        return;
      }

      if (parseTON(amount) < parseTON(networkConfig.bnb.minAmount)) {
        setWarning(`Minimum amount is ${networkConfig.bnb.minAmount} TON`);
        return;
      }

      if (userBalance && parseTON(amount) > userBalance) {
        setWarning("Insufficient WTON balance");
        return;
      }
    } else {
      setWarning("Enter an amount");
      return;
    }
    setIsValidAmountString(true);

    if (destinationAddress) {
      if (!isAddress(destinationAddress)) {
        setWarning("Invalid destination address");
        return;
      }

    } else {
      setWarning("Enter recipient address");
      return;
    }

    setWarning("");
  });


  // TODO: should save TON tx in history, maybe move this logic to txinfo component
  // useEffect(() => {
  //   if (!isBridgeSuccess || !bridgeHash) return;

  //   let newHistoryEntry: HistoryEntry = {
  //     date: Date.now(),
  //     bridgeRecievedAmount: amount,
  //     destinationAddress: destinationAddress,
  //     bnb: {
  //       txHash: bridgeHash,
  //       status: bridgeTxStatus,
  //     }
  //   };

  //   saveHistoryEntry(newHistoryEntry)

  // }, [isBridgeSuccess, bridgeHash]);

  useEffect(() => {
    handleValidation();
  }, [amount, destinationAddress])

  const handleTransfer = () => {
    if(!destinationAddress) return;

    let parsedAmount = parseTON(amount);

    const messageBody = beginCell()
      .storeUint(0, 32)
      .storeStringTail(destinationAddress)
      .endCell();
    // const messageBody = destinationAddress;
    (async () => {
      try {
        await tonConnectUI.sendTransaction({
          messages: [
            {
              address: networkConfig.ton.highloadWalletAddress.toString(),
              amount: parsedAmount.toString(),
              payload: messageBody.toBoc().toString("base64")
            }
          ],
          validUntil: Math.floor(Date.now() / 1000) + 5 * 60
        })
        onBridgeTransactionSent({
          transactionSenderAddress: tonWallet?.account.address,
          destinationAddress,
          amount
        });
      } catch (error) {
        // TODO: should handle error, like should close 'txinfo' or display error there
      }
    })()
  }

  const onAmountInputChange = (e: React.ChangeEvent) => {
    let value = (e.target as HTMLInputElement).value;
    if (value.match(/^\d*(\.\d*)?$/g)) {
      setAmount(value);
    }
  }

  function getButton() {
    if (!tonConnectUI.connected) {
      return <button onClick={() => { tonConnectUI.openModal() }} className='button'> Connect Wallet </button>
    }

    if (warning) {
      return <button className={"button button-disabled cursor-not-allowed"}> {warning} </button>;
    }

    if (tonConnectUI.modalState.status == "opened") {
      return <button className={`button button-disabled cursor-not-allowed`}> {"Wait for confirmation..."} </button>
    }

    return <button className={`button`} onClick={() => { handleTransfer(); }}> {"Bridge"} </button>
  }

  function getFormattedEstimatedReceiveAmount() {
    return !isValidAmountString
      ? ""
      : <div className='font-medium  text-gray-400'>
        You'll receive ~{stripDecimals(formatTON(parseTON(amount) - parseTON("0.002")))} Toncoin
      </div>
  }

  return (
    <TransferAssetsInputs userBalance={(userBalance ? stripDecimals(formatTON(userBalance)) : undefined)}
      mainButton={getButton()}
      amountInput={<TextInput value={amount} onChange={onAmountInputChange} placeholder='0.0' />}
      destinationAddressInput={<TextInput value={destinationAddress} onChange={e => { setDestinationAddress(e.target.value); }} placeholder='BNB address...' />}
      formattedEstimatedReceiveAmount={getFormattedEstimatedReceiveAmount()}
      onClickUserBalance={() => userBalance && setAmount(formatTON(userBalance))}
    />
  )
}



export default TransferAssetsInputsTON;