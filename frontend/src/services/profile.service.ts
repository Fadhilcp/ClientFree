import axios from '../lib/axios';
import { endPoints } from '../config/endpoints';


class ProfileService {
    getMyProfile() {
        return axios.get(endPoints.PROFILE.GET_ME);
    }

    updateProfile(formData : any) {
         return axios.patch(endPoints.PROFILE.UPDATE_ME, formData);
    }

    getProfileById(userId : string) {
        return axios.get(endPoints.PROFILE.GET_BY_ID(userId));
    }

    getProfiles(page: number, limit: number) {
        return axios.get(endPoints.PROFILE.LIST(page, limit));
    }
}

export const profileService = new ProfileService();