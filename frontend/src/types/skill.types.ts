export type Skill = {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
};

export type SkillForm = {
  name: string;
  category: string;
  status: 'active' | 'inactive';
}

export interface SkillItem {
  id: string;
  name: string;
}