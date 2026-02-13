import type { ExternalLinkErrors, ProfileFormData, FormErrors, ExternalLink } from "../../types/profileModal.types";
import { isValidUrl } from "./isValidUrl";

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
    if (formData.hourlyRate === null || formData.hourlyRate <= 0) errors.hourlyRate = 'Hourly rate must be greater than 0';
    if (!formData.about.trim()) errors.about = 'About section is required';
    if (!formData.skills.length) errors.skills = 'At least one skill is required';

    if (formData.portfolio.length) {
      errors.portfolio = [];

      formData.portfolio.forEach((item, index) => {
        const itemErrors: Record<string, string> = {};

        if (!item.title.trim()) {
          itemErrors.title = "Title is required";
        }

        if(!item.link?.trim()) {
          itemErrors.link = "Link is required"
        } else if (item.link?.trim()) {
          if (!isValidUrl(item.link)) {
            itemErrors.link = "Enter a valid URL (https://...)";
          }
        }

        errors.portfolio![index] = itemErrors;
      });
    }

    if (formData.education.length) {
      errors.education = [];

      formData.education.forEach((edu, index) => {
        const eduErrors: Record<string, string> = {};

        if (!edu.degree.trim())
          eduErrors.degree = "Degree is required";

        if (!edu.institution.trim())
          eduErrors.institution = "Institution is required";

        if (!edu.startYear)
          eduErrors.startYear = "Start year is required";

        if (
          edu.endYear &&
          edu.startYear &&
          Number(edu.endYear) < Number(edu.startYear)
        ) {
          eduErrors.endYear = "End year cannot be before start year";
        }

        errors.education![index] = eduErrors;
      });
    }

    
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

    if (!formData.company.website.trim()) {
      errors.company.website = "Website is required";
    } else if (!isValidUrl(formData.company.website)) {
      errors.company.website = "Enter a valid website URL (https://...)";
    }
  }

  return errors;
};
