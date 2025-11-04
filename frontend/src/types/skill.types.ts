export type Skill = {
  _id: string;
  name: string;
  category: string;
  status: 'Active' | 'Inactive';
};

export type SkillForm = {
  name: string;
  category: string;
  status: 'active' | 'inactive';
}

export interface SkillItem {
  _id: string;
  name: string;
}