import React, { useEffect, useState } from 'react'
import ProfileModal from './profile/ProfileModal'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store';
import { clearOtpInfo, resetNewUser, setUser } from '../../features/authSlice';
import { notify } from '../../utils/toastService';
import { userService } from '../../services/user.service';
import { skillService } from '../../services/skill.service';
import Loader from '../../components/ui/Loader/Loader';
import ClientHero from '../../components/user/HeroSection/ClientHero';
import FreelancerHero from '../../components/user/HeroSection/FreelancerHero';

const Home : React.FC = () => {

    const dispatch = useDispatch();
    const isNewUser = useSelector((state: RootState) => state.auth.isNewUser);
    const user = useSelector((state: RootState) => state.auth.user);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true);
            try {
                const response = await skillService.getActive();
                setAvailableSkills(response.data.skills);
            } catch (error : any) {
                notify.error(error.response?.data?.error || 'Failed to load Skills')
            } finally {
                setLoading(false);
            }
        };
        
        dispatch(clearOtpInfo())
        if(isNewUser) {
            fetchSkills();
            setIsModalOpen(true);
            dispatch(resetNewUser());
        }
    }, [isNewUser, dispatch]);

    const handleCreateProfile = async (formData : FormData) => {
        setLoading(true);
        try {
            const response = await userService.updateProfile(formData);
            if(response.data){
                const user = response.data.user;
                dispatch(setUser(user));
                notify.success('Profile updated successfully')
                setIsModalOpen(false);
            }
        } catch (error : any) {
            notify.error(error.response?.data?.error || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    }

  return (
      <>
        {loading && <Loader />}

        {/* Profile creation modal */}
        <ProfileModal open={isModalOpen}
        role={user?.role === "freelancer" ? "freelancer" : "client" }
        onSave={handleCreateProfile}  
        onClose={()=> setIsModalOpen(false)}
        availableSkills={availableSkills}
        />


        {/* Home page */}
        <section className="bg-white dark:bg-gray-900 min-h-screen pt-4 md:pt-4 lg:pt-1">
            <div className="max-w-screen-xl px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side - Headline and CTA */}
                <div className="space-y-6 lg:w-2xl xl:w-3xl">
                    {user?.role === "client" && <ClientHero/>}
                    {user?.role === "freelancer" && <FreelancerHero/>}
                </div>

                {/* Right Side - Hero Graphic */}
                <div className="w-full lg:ml-4 xl:ml-5">
                    <img
                    src="/images/hero-illustration.png"
                    alt="Freelance Marketplace Illustration"
                    className="w-full h-auto object-cover rounded-xl"
                    />
                </div>
                </div>
            </div>
        </section>
    </>
  );
}

export default Home