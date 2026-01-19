import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      register, // Legacy support
      error,
      placeholder,
      className = "",
      valueAsNumber,
      icon: Icon,
      ...props
    },
    ref,
  ) => {
    // Determine if we are using the legacy pattern (passing register prop)
    // or modern pattern (spreading register props)
    const legacyProps = register ? register(name, { valueAsNumber }) : {};

    // Combine props: prefer legacy register props if they exist, otherwise use spread props
    const finalProps = register ? { ...props, ...legacyProps } : props;

    // Determine the correct ref to use
    const finalRef = register ? legacyProps.ref : ref;

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
            {...finalProps}
            ref={finalRef}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
