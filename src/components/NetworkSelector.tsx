import { HTMLAttributes, ReactElement, ReactNode, SelectHTMLAttributes, useState } from 'react';
import bnbIcon from './../../public/bnb-bnb-logo.svg';
import tonIcon from './../../public/ton_symbol.svg';
import { ChainName } from '../types/ChainName';

interface SelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  labelText: string,
  options: ReactNode[],
  variant: "right" | "left" | "mid",
  icon: string
}

const Selector: React.FC<SelectorProps> = ({ value, onChange, labelText, options, variant, icon }) => {
  const variantConfig = {
    "right": "sm:border-l-0 sm:justify-end sm:pr-4 rounded-t-none sm:rounded-bl-none pl-4 sm:pl-0",
    "left": "sm:border-r-0 border-b-1 sm:border rounded-t-none rounded-b-none sm:rounded-bl-md pl-4",
    "mid": "border-b-0 rounded-b-none pl-4",
  }
  return <div className={`flex flex-1 items-center border rounded-md border-gray-300 dark:border-gray-600 w-full
                          ${variantConfig[variant]}`}>
    <img src={icon} className={`w-7`}></img>
    <label className='ml-3 mr-1 text-gray-500 dark:text-gray-400'>{labelText}</label>
    <select disabled className='my-4 bg-transparent disabled:opacity-100 font-semibold appearance-none'
      value={value} onChange={onChange} onClick={(e) => { e.preventDefault() }}>
      {options}
    </select>
  </div>
}

interface NetworkSelectorProps {
  onSelect: (newDirection: { from: ChainName, to: ChainName }) => void,
  fromNetwork: ChainName,
  setFromNetwork: (network: ChainName) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({onSelect, fromNetwork, setFromNetwork}) => {
  // const [fromNetwork, setFromNetwork] = useState(ChainName.BNB);
  const [toNetwork, setToNetwork] = useState(ChainName.TON);

  const handleSwap = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
    onSelect({ from: toNetwork, to: temp });
  }

  const getChainOptions = () => {
    const availableChains = [ChainName.BNB, ChainName.TON];
    return availableChains.map((e, i) => <option key={i} value={e}>{e}</option>);
  }

  const getChainIcon = (chainName: ChainName) => {
    const icons = {
      [ChainName.BNB]: bnbIcon,
      [ChainName.TON]: tonIcon,
    };
    return icons[chainName];
  }

  return (
    <div>
      <div className="flex items-center justify-center mx-5 flex-col sm:flex-row">
        <Selector labelText='' variant={"mid"} value={fromNetwork}
          onChange={e => setFromNetwork(e.target.value as ChainName)}
          icon={tonIcon}
          options={[<option key={0} value={"Toncoin"}>Toncoin</option>]}>
        </Selector>
      </div>
      <div className="flex items-stretch justify-center mx-5 mb-5 flex-col sm:flex-row">
        <Selector labelText='from:' variant={"left"} value={fromNetwork}
          onChange={e => setFromNetwork(e.target.value as ChainName)}
          icon={getChainIcon(fromNetwork)}
          options={getChainOptions()}>
        </Selector>
        <button className="flex-1 justify-center items-center
                            flex
                             rounded-none border border-gray-300 hover:border-gray-300 
                             sm:border-y sm:border-x-0 border-x-0 border-y-0 text-xl bg-transparent"
          onClick={() => handleSwap()}>
          <span className='hidden sm:block'>⇆</span>
          <span className='sm:hidden'>⇅</span>
        </button>
        <Selector value={toNetwork} variant={"right"}
          onChange={e => setToNetwork(e.target.value as ChainName)}
          labelText='to:'
          icon={getChainIcon(toNetwork)}
          options={getChainOptions()}>
        </Selector>

      </div>
    </div>
  );
}

export default NetworkSelector;
