import React from 'react';
import './ui.css';

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  interactive = false 
}) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${interactive ? 'card-interactive' : ''} ${className}`}>
      {children}
    </div>
  );
}
