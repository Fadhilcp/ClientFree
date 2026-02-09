export interface Portfolio {
  title: string;
  link?: string;
  file?: string;
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

export interface Education { 
  degree: string;
  institution: string;
  startYear: number | "";
  endYear?: number | "";
}

export interface ProfileFormData {
  name: string;
  phone: string;
  description: string;
  profileImage: string;
  location: Location;
  portfolio: Portfolio[];
  education: Education[];
  resume: { fileUrl?: string; };
  skills: string[];
  professionalTitle: string;
  hourlyRate: number | null;
  about: string;
  experienceLevel: string;
  externalLinks: ExternalLink[];
  company: Company;
}

export interface PortfolioError {
  title?: string;
  link?: string;
  file?: string;
}

export interface EducationError {
  degree?: string;
  institution?: string;
  startYear?: string;
  endYear?: string;
}

export interface ResumeError {
  fileUrl?: string;
}

export interface ExternalLinkErrors {
  type?: string;
  url?: string;
}

export interface FormErrors {
  name?: string;
  phone?: string;
  description?: string;
  profileImage?: string;
  location?: Partial<Location>;
  portfolio?: PortfolioError[];
  education?: EducationError[];
  resume?: ResumeError;
  skills?: string;
  professionalTitle?: string;
  hourlyRate?: string;
  about?: string;
  experienceLevel?: string;
  externalLinks?: Partial<ExternalLinkErrors>[];
  company?: Partial<Company>;
}