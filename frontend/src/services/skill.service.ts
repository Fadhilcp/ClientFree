import axios from '../lib/axios';
import { endPoints } from '../config/endpoints';

interface ISkill {
    name: string;
    category: string;
    status: 'active' | 'inactive';
}

class SkillService {
    getActive(){
        return axios.get(endPoints.SKILL.GET_ACTIVE);
    }
    getAll(search: string, page: number, limit: number){
        return axios.get(endPoints.SKILL.GET_ALL(search, page, limit));
    }
    create(data : ISkill){
        return axios.post(endPoints.SKILL.CREATE, data);
    }
    update(id: string,data: Partial<ISkill>){
        return axios.patch(endPoints.SKILL.BY_ID(id), data);
    }
    getByCategory(category: string){
        return axios.get(endPoints.SKILL.BY_CATEGORY(category));
    }
    delete(id:string){
        return axios.delete(endPoints.SKILL.BY_ID(id));
    }
}

export const skillService = new SkillService();