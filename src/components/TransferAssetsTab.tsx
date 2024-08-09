import { useEffect, useState } from 'react';
import { useAccount, useConfig, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import NetworkSelector from './NetworkSelector';
import TransferInfoBNBToTON from './TransferInfo/TransferInfoBNBToTON';
import TransferAssetsInputsEVM from './TransferAssetsInputs/TransferAssetsInputsEVM';
import { ChainName } from '../types/ChainName';
import TransferAssetsInputsTON from './TransferAssetsInputs/TransferAssetsInputsTON';
import TransferInfoTONToBNB from './TransferInfo/TransferInfoTONToBNB';

interface TransferAssetsTabProps {
  fromNetwork: ChainName,
  setFromNetwork: (network: ChainName) => void;
}
const TransferAssetsTab: React.FC<TransferAssetsTabProps> = ({ fromNetwork, setFromNetwork }) => {
  const [shouldShowInfo, setShouldShowInfo] = useState(false);
  const [amount, setAmount] = useState<string>();
  const [destinationAddress, setDestinationAddress] = useState<string>();
  const [transactionSenderAddress, setTransactionSenderAddress] = useState<string>();
  const [transactionHash, setTransactionHash] = useState<`0x${string}`>();

  const { isLoading: isLoading, isSuccess: isSuccess, status } = useWaitForTransactionReceipt({
    hash: transactionHash,
  })

  // useEffect(() => {
  //   console.log(destinationAddress);
  // }, [destinationAddress])

  return (
    shouldShowInfo
      // true
      // TODO: refactor to support reverse direction
      ? fromNetwork == ChainName.TON
        ? <TransferInfoTONToBNB destinationAddress={destinationAddress as `0x${string}`}
          amount={amount}
          transactionSenderAddress={transactionSenderAddress}
          onClickBack={() => { setShouldShowInfo(false) }} />
        : <TransferInfoBNBToTON destinationAddress={destinationAddress}
          amount={amount}
          transactionStatus={status}
          transactionHash={transactionHash}
          onClickBack={() => { setShouldShowInfo(false) }}
        />
      // ? <TransferInfoBNBToTON destinationAddress={"UQC_pxTeZV0YIxOhOWRyJpuni-ab-68Akldrl6pvhZ3BcgV8"}
      //   transactionStatus={bridgeTxStatus}
      //   transactionHash={"0x111848c5de1389edd9e18c9b80c9b4e5c5186725e5f55ee77cf01044ed6233f7"}
      //   amount={"0.05"}
      //   onClickBack={() => {}}>
      // </TransferInfoBNBToTON>
      : <div>
        <div className="form-group mt-8">
          <div className='flex mx-5 mb-2'>
            <div className='flex-1 text-left font-medium'>Asset</div>
          </div>
          <NetworkSelector onSelect={(newDirection) => console.log(newDirection)}
            fromNetwork={fromNetwork} setFromNetwork={setFromNetwork}></NetworkSelector>
        </div>
        {
          fromNetwork == ChainName.TON
            ? <TransferAssetsInputsTON onBridgeTransactionSent={(data) => {
              setShouldShowInfo(true);
              setAmount(data.amount);
              setDestinationAddress(data.destinationAddress);
              setTransactionSenderAddress(data.transactionSenderAddress);
            }} />
            : <TransferAssetsInputsEVM onBridgeTransactionSent={(data) => {
              setShouldShowInfo(true);
              setAmount(data.amount);
              setDestinationAddress(data.destinationAddress);
              setTransactionSenderAddress(data.transactionSenderAddress);
              setTransactionHash(data.transactionHash);
            }} />
        }

        <div className='font-medium text-sm text-gray-400'>
          {/* <div>Bridge fee: {networkConfig.bridgeFee} TON </div> */}
          <div>Network fee: 0.0002 BNB + 0.008 TON</div>
        </div>
      </div>
  )
}



export default TransferAssetsTab;