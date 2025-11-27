import React from 'react';
import './ui.css';

export default function Badge({ children, variant = 'primary', size = 'md' }) {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {children}
    </span>
  );
}
