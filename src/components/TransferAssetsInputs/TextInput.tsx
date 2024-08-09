import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const TextInput: React.FC<TextInputProps> = ({value, onChange, placeholder}) => {
  return (
    <input className="w-[calc(100%-40px)]
                          p-3 mx-5 mb-5
                          bg-gray-100
                          outline-blue-500
                          border border-solid border-gray-300 rounded-md
                          dark:bg-gray-700
                          dark:border-none
                          dark:outline-gray-100"
      placeholder={placeholder} type="text" value={value == undefined ? "" : value} onChange={onChange} />
  )
}



export default TextInput;