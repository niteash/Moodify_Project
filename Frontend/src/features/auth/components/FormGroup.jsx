import React from "react";

const Formgroup = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default Formgroup;
