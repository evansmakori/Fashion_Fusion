import React from 'react';
import './ui.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  icon = null,
  ...props 
}) {
  const buttonClass = `btn btn-${variant} btn-${size} ${disabled || loading ? 'btn-disabled' : ''} ${className}`;
  
  return (
    <button 
      className={buttonClass} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-micro"></span>
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
