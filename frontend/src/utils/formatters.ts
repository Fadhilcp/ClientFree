// this make the first letter capital 
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

//this also same purpose but in the status it used
export function mapStatus(status: string): 'Active' | 'Inactive' | 'Suspended' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'banned':
      return 'Suspended';
    default:
      return 'Inactive';
  }
}

// this is used for date readability
export function formatDate(date: string): string {
  return new Date(date).toISOString().split('T')[0];
}