export type Skill = {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Inactive';
};

export type SkillForm = {
  name: string;
  category: string;
  status: 'active' | 'inactive';
}