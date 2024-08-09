import React from 'react';
import { formatWTON, stripDecimals } from '../../utils/utils';

interface TransferAssetsInputsProps {
  userBalance: string | undefined
  mainButton: React.ReactNode
  amountInput: React.ReactNode
  destinationAddressInput: React.ReactNode
  formattedEstimatedReceiveAmount: React.ReactNode | string
  onClickUserBalance: () => void
}

const TransferAssetsInputs: React.FC<TransferAssetsInputsProps>  = ({
  userBalance, 
  mainButton, 
  amountInput, 
  destinationAddressInput, 
  formattedEstimatedReceiveAmount, 
  onClickUserBalance
}) => {

  return (
      <div>
        <div className="form-group mt-8">
          <div className='flex mx-5 mb-2'>
            <div className='flex-1 text-left font-medium'>Amount</div>
            <div className='flex-1 text-right font-medium'>
              <span className='text-gray-400'>balance: </span>
              {
                userBalance
                  ? <span className='cursor-pointer dark:text-gray-300' onClick={() => onClickUserBalance() }>
                    {userBalance}
                  </span>
                  : "-"
              }
            </div>
          </div>
          {amountInput}
          <div className='flex mx-5 mb-2'>
            <div className='flex-1 text-left font-medium'>Recipient</div>
          </div>
            {destinationAddressInput}
        </div>
        {
          formattedEstimatedReceiveAmount
        }
        {mainButton}
      </div>
  )
}



export default TransferAssetsInputs;