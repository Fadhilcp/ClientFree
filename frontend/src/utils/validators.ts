
export const validateUsername = (username : string) : string => {
    if(!username.trim()) return 'Username is required';
    if(username.length < 3) return 'Username must be least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscores allowed';
    return '';
};

export const validateEmail = (email : string) : string => {
    if(!email.trim()) return 'Email is required';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? '' : 'Invalid email format';
};

export const validatePassword = (password : string) : string => {
    if(!password) return 'Password is required';
    if(password.length < 8) return 'Password must be at least 8 characters';
    // if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    // if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    // if (!/\d/.test(password)) return 'Password must contain at least one number';
    // if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character';
    return '';
};

export const validateConfirmPassword = (password : string, confirmPassword : string) : string => {
    if(!confirmPassword) return 'Please confirm your password';
    return password === confirmPassword ? '' : 'Passwords do not match';
};