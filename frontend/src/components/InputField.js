import React from 'react';

export default function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  rows,
  className = '',
}) {
  const isTextarea = rows !== undefined; // Entscheidet, ob ein Textarea gerendert wird

  return (
    <div>
      <label htmlFor={id} className="block text-l font-medium font-heading leading-6">
        {label}
      </label>
      <div className="mt-2">
        {isTextarea ? (
          <textarea
            id={id}
            name={name}
            rows={rows} // Anzahl der Zeilen
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6 ${className}`}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6 ${className}`}
          />
        )}
      </div>
    </div>
  );
}