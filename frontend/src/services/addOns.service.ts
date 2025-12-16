import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'

class AddOnService {
    async createAddOn(addOnData: any) {
        return axios.post(endPoints.ADDONS.CREATE, addOnData);
    }

    async updateAddOn(addOnId: string, addOnData: any) {
        return axios.put(endPoints.ADDONS.BY_ID(addOnId), addOnData);
    }

    async getAllAddOns(search: string, page: number, limit: number){
        return axios.get(endPoints.ADDONS.GET_ALL(search, page, limit));
    }

    async toggleActive(addOnId: string) {
        return axios.patch(endPoints.ADDONS.TOGGLE_ACTIVE(addOnId));
    }

    async getById(addOnId: string) {
        return axios.get(endPoints.ADDONS.BY_ID(addOnId));
    }

    async deleteAddOn(addOnId: string) {
        return axios.delete(endPoints.ADDONS.BY_ID(addOnId));
    }

    async getActiveAddOns() {
        return axios.get(endPoints.ADDONS.GET_ACTIVE)
    }
}

export const addOnService = new AddOnService();