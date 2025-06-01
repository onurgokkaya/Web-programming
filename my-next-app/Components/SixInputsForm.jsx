import { useState, useRef, useEffect } from 'react';

const SixInputsForm = ({ code, onVerification }) => {
  const [inputs, setInputs] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, event) => {
    const value = event.target.value;
    if (value.length > 1) {
      return;
    }

    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const enteredCode = inputs.join('');
    if (enteredCode === code.toString()) {
      onVerification(true);
    } else {
      onVerification(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col space-y-8 w-full'>
      <div className='w-full flex mt-2 items-center justify-end sm:text-xs md:text-base'>
        {inputs.map((input, index) => (
          <div key={index} className='grid grid-cols-6 gap-2 w-full'>
            <input
              className='bg-gray-100 sm:w-8 lg:w-10 aspect-square text-center p-2 rounded-md'
              ref={(ref) => (inputRefs.current[index] = ref)}
              type="text"
              value={input}
              onChange={(event) => handleChange(index, event)}
              maxLength="1"
              required
            />
          </div>
        ))}
      </div>
      <div className="h-10 w-full flex justify-end">
      <button className='text-gray-600 bg-blue-300 hover:bg-blue-200 h-full w-1/3 rounded-md' type="submit">Doğrula</button>
      </div>
    </form>
  );
};

export default SixInputsForm;
