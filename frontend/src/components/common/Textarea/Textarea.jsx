import React, { forwardRef } from "react";
import clsx from "clsx";

const Textarea = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      placeholder,
      error,
      required = false,
      disabled = false,
      rows = 4,
      register, // Legacy support
      className,
      ...props
    },
    ref,
  ) => {
    const legacyProps = register ? register(name) : {};
    const finalProps = register ? { ...props, ...legacyProps } : props;
    const finalRef = register ? legacyProps.ref : ref;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={clsx(
            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-y",
            error ? "border-red-500" : "border-gray-300",
            disabled && "bg-gray-100 cursor-not-allowed",
            className,
          )}
          {...finalProps}
          ref={finalRef}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
