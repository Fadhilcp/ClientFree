import type { ExternalLinkErrors, ProfileFormData, FormErrors, ExternalLink } from "../../types/profileModal.types";

export const validateUsername = (username : string) : string => {
    if(!username.trim()) return 'Username is required';
    if(username.length < 3) return 'Username must be least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return 'Only letters, numbers, and underscores allowed';
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


// to validate the profile modal - create and update
export const validateProfileForm = (formData: ProfileFormData, role: 'freelancer' | 'client'): FormErrors => {
  const errors: FormErrors = {};

  // Common fields
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!formData.phone.trim()) errors.phone = 'Phone is required';
  if (!formData.description.trim()) errors.description = 'Description is required';

  errors.location = {};
  if (!formData.location.city.trim()) errors.location.city = 'City is required';
  if (!formData.location.state.trim()) errors.location.state = 'State is required';
  if (!formData.location.country.trim()) errors.location.country = 'Country is required';

  if (role === 'freelancer') {
    if (!formData.professionalTitle.trim()) errors.professionalTitle = 'Professional title is required';
    if (!formData.hourlyRate.trim()) errors.hourlyRate = 'Hourly rate is required';
    if (!formData.about.trim()) errors.about = 'About section is required';
    if (!formData.skills.length) errors.skills = 'At least one skill is required';

    errors.portfolio = {};
    if (!formData.portfolio.portfolioFile.trim()) errors.portfolio.portfolioFile = 'Portfolio file is required';
    if (!formData.portfolio.resume.trim()) errors.portfolio.resume = 'Resume is required';

    if (Array.isArray(formData.externalLinks)) {
      errors.externalLinks = formData.externalLinks.map<ExternalLinkErrors>((link: ExternalLink) => {
        const linkErrors: ExternalLinkErrors = {};
        if (!link.type?.trim()) linkErrors.type = 'Label is required';
        if (!link.url?.trim()) {
          linkErrors.url = 'URL is required';
        } else {
          const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
          if (!urlRegex.test(link.url)) {
            linkErrors.url = 'Invalid URL format';
          }
        }
        return linkErrors;
      });
    }
  }

  if (role === 'client') {
    errors.company = {};
    if (!formData.company.name.trim()) errors.company.name = 'Company name is required';
    if (!formData.company.industry.trim()) errors.company.industry = 'Industry is required';
    if (!formData.company.website.trim()) errors.company.website = 'Website is required';
  }

  return errors;
};
