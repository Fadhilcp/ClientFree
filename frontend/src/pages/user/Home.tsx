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
        <section className="bg-white dark:bg-gray-900 min-h-screen pt-4 md:pt-4 lg:pt-2 overflow-x-hidden">
            <div className="max-w-screen-xl px-4 mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="space-y-6 w-full lg:pr-12">
                        {user?.role === "client" && <ClientHero/>}
                        {user?.role === "freelancer" && <FreelancerHero/>}
                        {!user?.role && (
                            <h1 className="text-4xl font-extrabold dark:text-white text-gray-900">
                                The Future of <span className="text-indigo-600">Freelancing</span> is here.
                            </h1>
                        )}
                    </div>

                    {/* Right Side - Hero Graphic */}
                    <div className="flex justify-center items-center lg:justify-end w-full lg:w-[450px]">
                        <div className="relative w-full p-6 rounded-2xl bg-white/5 dark:bg-white/10 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden group">
                            <div className="absolute -inset-2 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500" />
                            
                            <img
                                src="https://illustrations.popsy.co/amber/work-from-home.svg"
                                alt="Freelancer"
                                className="relative w-full h-auto object-contain dark:brightness-110 dark:contrast-125 dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </>
  );
}

export default Home