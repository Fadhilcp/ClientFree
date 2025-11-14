import axios from '../lib/axios';
import { endPoints } from '../config/endpoints';


class UserService {
    getMyProfile() {
        return axios.get(endPoints.USER.GET_ME);
    }

    updateProfile(formData : any) {
         return axios.put(endPoints.USER.UPDATE_ME, formData);
    }

    getProfileById(userId : string) {
        return axios.get(endPoints.USER.GET_BY_ID(userId));
    }

    getProfiles(search: string ,page: number, limit: number) {
        return axios.get(endPoints.USER.LIST(search ,page, limit));
    }

    setProfileImage(formData: FormData){
        return axios.post(endPoints.USER.SET_PROFILE_IMAGE, formData);
    }

    changeUserStatus(userId: string,data: { status: string}){
        return axios.patch(endPoints.USER.UPDATE_STATUS(userId), data)
    }
}

export const userService = new UserService();