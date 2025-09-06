// Validation utilities for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateModelName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Model name is required');
  } else if (name.trim().length < 2) {
    errors.push('Model name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Model name must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTargetColumn = (column: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!column.trim()) {
    errors.push('Target column name is required');
  } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column.trim())) {
    errors.push('Target column name must start with a letter or underscore and contain only letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFile = (file: File | null, acceptedTypes: string[], maxSizeMB: number = 10): ValidationResult => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('File is required');
  } else {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      errors.push(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForm = (validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};
