import axios from '../lib/axios';
import { endPoints } from '../config/endpoints';


class UserService {
    getMyProfile() {
        return axios.get(endPoints.USER.GET_ME);
    }

    updateProfile(formData : FormData) {
         return axios.put(endPoints.USER.UPDATE_ME, formData);
    }

    getProfileById(userId : string) {
        return axios.get(endPoints.USER.GET_BY_ID(userId));
    }

    getProfiles(search: string ,page: number, limit: number, role?: string) {
        return axios.get(endPoints.USER.LIST(search ,page, limit, role));
    }

    getFreelancers(cursor: string, limit: number, search: string) {
        return axios.get(endPoints.USER.LIST_FREELANCERS(cursor, limit, search));
    }

    setProfileImage(formData: FormData){
        return axios.post(endPoints.USER.UPDATE_PROFILE_IMAGE, formData);
    }

    removeProfileImage(){
        return axios.delete(endPoints.USER.UPDATE_PROFILE_IMAGE);
    }

    changeUserStatus(userId: string,data: { status: string}){
        return axios.patch(endPoints.USER.UPDATE_STATUS(userId), data)
    }

    getInterestedFreelancers(cursor: string, limit: number, search: string) {
        return axios.get(endPoints.USER.GET_INTERESTED(cursor, limit, search));
    }

    addInterestedFreelancer(jobId: string) {
        return axios.post(endPoints.USER.ADD_INTERESTED(jobId));
    }

    removeInterestedFreelancer(jobId: string) {
        return axios.delete(endPoints.USER.REMOVE_INTERESTED(jobId));
    }
}

export const userService = new UserService();