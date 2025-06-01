import React from "react";

const InputField = ({ name, value, handleChange, type}) => {
  const handleInputChange = (e) => {
    const inputValue = type === "text" ? e.target.value.trim() : e.target.value;
    handleChange(inputValue);
  };

  return (
    <div className="w-full">
      <label className="block text-blue-300">{name}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-full h-8 p-2 border rounded-md"
      />
    </div>
  );
};

export default InputField;
