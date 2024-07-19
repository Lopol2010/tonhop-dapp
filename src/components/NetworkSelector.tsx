// src/NetworkSelector.js

import { HTMLAttributes, ReactElement, ReactNode, SelectHTMLAttributes, useState } from 'react';
import bnbIcon from './../../public/bnb-bnb-logo.svg';
import tonIcon from './../../public/ton_symbol.svg';

interface SelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  labelText: string,
  options: ReactNode[],
  variant: "right" | "left" | "mid",
  icon: string
}

const Selector: React.FC<SelectorProps> = ({ value, onChange, labelText, options, variant, icon }) => {
  const variantConfig = {
    "right": "sm:border-l-0 sm:justify-end sm:pr-4 rounded-t-none sm:rounded-bl-none",
    "left": "sm:border-r-0 border-b-0 sm:border rounded-t-none rounded-b-none sm:rounded-bl-md",
    "mid": "border-b-0 rounded-b-none",
  }
  return <div className={`flex flex-1 items-center border rounded-md border-gray-300 dark:border-gray-600 w-full pl-4
                          ${variantConfig[variant]}`}>
    <img src={icon} className='w-7'></img>
    <label className='ml-3 mr-1 text-gray-500 dark:text-gray-400'>{labelText}</label>
    <select disabled className='my-4 bg-transparent disabled:opacity-100 font-semibold appearance-none'
      value={value} onChange={onChange} onClick={(e) => { e.preventDefault() }}>
      {options}
      {/* <option value="Ethereum Network">Ethereum Network</option> */}
      {/* <option value="Binance Smart Chain">Binance Smart Chain</option> */}
      {/* <option value="Polygon Network">Polygon Network</option> */}
      {/* <option value="TON">TON Network</option> */}
      {/* Add more options as necessary */}
    </select>
  </div>
}

const NetworkSelector = () => {
  const [fromNetwork, setFromNetwork] = useState('BSC');
  const [toNetwork, setToNetwork] = useState('TON');

  const handleSwap = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  }


  return (
    <div>

      <div className="flex items-center justify-center mx-5 flex-col sm:flex-row">
        <Selector labelText='' variant={"mid"} value={fromNetwork}
          onChange={e => setFromNetwork(e.target.value)}
          icon={tonIcon}
          options={[<option value="Toncoin">Toncoin</option>]}>
        </Selector>
      </div>
      <div className="flex items-center justify-center mx-5 mb-5 flex-col sm:flex-row">
        <Selector labelText='from:' variant={"left"} value={fromNetwork}
          onChange={e => setFromNetwork(e.target.value)}
          icon={bnbIcon}
          options={[<option value="BSC">Binance Smart Chain</option>]}>
        </Selector>
        {/* <button className="swap-button" onClick={handleSwap}>⇆</button> */}
        <Selector value={toNetwork} variant={"right"}
          onChange={e => setToNetwork(e.target.value)}
          labelText='to:'
          icon={tonIcon}
          options={[<option value="TON">The Open Network</option>]}>
        </Selector>

      </div>
    </div>
  );
}

export default NetworkSelector;
