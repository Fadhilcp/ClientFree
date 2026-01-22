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
    // adding filterquery to apply filter as query params
    getFreelancers(cursor: string, limit: number, search: string, filterQeury: string) {
        return axios.get(
            endPoints.USER.LIST_FREELANCERS(
                cursor, limit, search
            ) + (filterQeury ? `&${filterQeury}` : "")
        );
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
    // adding filterquery to apply filter as query params
    getInterestedFreelancers(cursor: string, limit: number, search: string, filterQeury: string) {
        return axios.get(
            endPoints.USER.GET_INTERESTED(
                cursor, limit, search
            ) + (filterQeury ? `&${filterQeury}` : "")
        );
    }

    addInterestedFreelancer(jobId: string) {
        return axios.post(endPoints.USER.ADD_INTERESTED(jobId));
    }

    removeInterestedFreelancer(jobId: string) {
        return axios.delete(endPoints.USER.REMOVE_INTERESTED(jobId));
    }
    // for searchable dropdown
    searchUsers(search: string, page: number, limit: number) {
        return axios.get(endPoints.USER.SEARCH(search, page, limit));
    }

    getUsersByIds(userIds: string[]) {
        return axios.get(endPoints.USER.USERS_BY_ID, { 
            params: { userIds },
            paramsSerializer: { indexes: null }
        });
    }
}

export const userService = new UserService();