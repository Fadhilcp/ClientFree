export interface Portfolio {
  portfolioFile: string;
  resume: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
}

export interface Company {
  name: string;
  industry: string;
  website: string;
}

export interface ExternalLink {
  type: string;
  url: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  description: string;
  profileImage: string;
  location: Location;
  portfolio: Portfolio;
  skills: string[];
  professionalTitle: string;
  hourlyRate: number | null;
  about: string;
  experienceLevel: string;
  externalLinks: ExternalLink[];
  company: Company;
}

export interface FormErrors {
  name?: string;
  phone?: string;
  description?: string;
  profileImage?: string;
  location?: Partial<Location>;
  portfolio?: Partial<Portfolio>;
  skills?: string;
  professionalTitle?: string;
  hourlyRate?: string;
  about?: string;
  experienceLevel?: string;
  externalLinks?: Partial<ExternalLink>[];
  company?: Partial<Company>;
}

export interface ExternalLinkErrors {
  type?: string;
  url?: string;
}