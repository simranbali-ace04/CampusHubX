import React from "react";

const Input = ({
  label,
  name,
  type = "text",
  register,
  error,
  placeholder,
  className = "",
  valueAsNumber,
  icon: Icon, // <--- 1. Destructure 'icon' and rename to 'Icon' (capital I)
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {/* Render the Icon if it exists */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          type={type}
          id={name}
          className={`
            w-full py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500
            ${Icon ? "pl-10 pr-3" : "px-3"} 
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          placeholder={placeholder}
          {...register(name, { valueAsNumber })}
          {...props} // <--- 2. Now 'props' does NOT contain 'icon', so the warning is gone
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
