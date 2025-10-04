import React, { useEffect, useState } from 'react'
import ProfileModal from './profile/ProfileModal'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store';
import { resetNewUser } from '../../features/authSlice';
import { notify } from '../../utils/toastService';
import { profileService } from '../../services/profile.service';
import { skillService } from '../../services/skill.service';

const Home : React.FC = () => {

    const dispatch = useDispatch();
    const isNewUser = useSelector((state: RootState) => state.auth.isNewUser);
    const user = useSelector((state: RootState) => state.auth.user);

    const [isModalOpen, setIsModalOpen] = useState(true);
    const [availableSkills, setAvailableSkills] = useState<[]>([]);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await skillService.get()
                console.log(response.data.skills)
                setAvailableSkills(response.data.skills);
            } catch (error : any) {
                notify.error(error.response?.data?.error || 'Failed to load Skills')
            }
        };

        if(isNewUser) {
            fetchSkills();
            setIsModalOpen(true);
            dispatch(resetNewUser());
        }
    }, [isNewUser, dispatch]);

    const handleCreateProfile = async (formData : any) => {
        try {
            const response = await profileService.updateProfile(formData);
            console.log("🚀 ~ handleCreateProfile ~ response:", response.data)
            if(response.data){
                notify.success('Profile updated successfully')
                setIsModalOpen(false);
            }
        } catch (error : any) {
            notify.error(error.response?.data?.error || 'Failed to create profile');
        }
    }


  return (

    <div>
        {/* Profile creation modal */}
        <ProfileModal open={isModalOpen}
        role={user?.role || "freelancer"}
        onSave={handleCreateProfile}  
        onClose={()=> setIsModalOpen(false)}
        defaultValues={user}
        availableSkills={availableSkills}
        />

        <h1>Home Page</h1>
      
    </div>
  )
}

export default Home
