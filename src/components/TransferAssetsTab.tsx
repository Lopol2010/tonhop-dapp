import { useEffect, useState } from 'react';
import { useAccount, useConfig, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import NetworkSelector from './NetworkSelector';
import TransferInfoBNBToTON from './TransferInfo/TransferInfoBNBToTON';
import TransferAssetsInputsEVM from './TransferAssetsInputs/TransferAssetsInputsEVM';
import { ChainName } from '../types/ChainName';
import TransferAssetsInputsTON from './TransferAssetsInputs/TransferAssetsInputsTON';
import TransferInfoTONToBNB from './TransferInfo/TransferInfoTONToBNB';
import { bridgeAbi } from '../generated';

interface TransferAssetsTabProps {
  networkSelectorState: {
    fromNetwork: ChainName,
    setFromNetwork: (network: ChainName) => void;
    toNetwork: ChainName,
    setToNetwork: (network: ChainName) => void;
  }
}
const TransferAssetsTab: React.FC<TransferAssetsTabProps> = ({ networkSelectorState }) => {
  const [shouldShowInfo, setShouldShowInfo] = useState(false);
  const [amount, setAmount] = useState<string>();
  const [memo, setMemo] = useState<string>();
  const [destinationAddress, setDestinationAddress] = useState<string>();
  const [transactionSenderAddress, setTransactionSenderAddress] = useState<string>();
  const [transferStartTimestamp, setTransferStartTimestamp] = useState<number>(Date.now() / 1000);

  const { writeContract: writeBridge, data: bridgeTxHash, status: bridgeRequestStatus, reset } = useWriteContract()

  const { isLoading: isBridgeTxLoading, isSuccess: isBridgeTxSuccess, status: bridgeTxStatus } = useWaitForTransactionReceipt({
    hash: bridgeTxHash,
  })

  // useEffect(() => {
  //   console.log(destinationAddress);
  // }, [destinationAddress])

  return (
    shouldShowInfo
      // true
      // TODO: refactor to support reverse direction
      ? networkSelectorState.fromNetwork == ChainName.TON
        ? <TransferInfoTONToBNB destinationAddress={destinationAddress as `0x${string}`}
          transferStartTimestamp={transferStartTimestamp || Date.now() / 1000}
          memo={memo}
          amount={amount}
          transactionSenderAddress={transactionSenderAddress}
          onClickBack={() => { setShouldShowInfo(false) }} />
        : <TransferInfoBNBToTON destinationAddress={destinationAddress}
          transferStartTimestamp={transferStartTimestamp}
          amount={amount}
          transactionStatus={bridgeTxStatus}
          transactionHash={bridgeTxHash}
          onClickBack={() => { setShouldShowInfo(false); reset(); }}
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
            state={networkSelectorState}></NetworkSelector>
        </div>
        {
          networkSelectorState.fromNetwork == ChainName.TON
            ? <TransferAssetsInputsTON
              onBeforeBridgeTransactionSent={(data) => {
                setAmount(data.amount);
                setMemo(data.memo);
                setDestinationAddress(data.destinationAddress);
                setTransactionSenderAddress(data.transactionSenderAddress);
              }}
              onAfterBridgeTransactionSent={() => {
                setTransferStartTimestamp(Date.now() / 1000);
                setShouldShowInfo(true);
              }} />
            : <TransferAssetsInputsEVM bridgeRequestStatus={bridgeRequestStatus}
              bridgeHash={bridgeTxHash}
              onBridgeButtonClick={(data) => {
                setAmount(data.amount);
                setDestinationAddress(data.destinationAddress);
                setTransactionSenderAddress(data.transactionSenderAddress);
                writeBridge({
                  address: import.meta.env.VITE_BRIDGE_ADDRESS,
                  abi: bridgeAbi,
                  functionName: "bridge",
                  args: [BigInt(data.amount), data.destinationAddress]
                })
              }}
              onBridgeRequestSent={() => {
                setShouldShowInfo(true);
                setTransferStartTimestamp(Date.now() / 1000);
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