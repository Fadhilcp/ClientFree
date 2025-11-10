import React, { useEffect, useState } from 'react'
import ProfileModal from './profile/ProfileModal'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store';
import { clearOtpInfo, resetNewUser, setUser } from '../../features/authSlice';
import { notify } from '../../utils/toastService';
import { profileService } from '../../services/profile.service';
import { skillService } from '../../services/skill.service';
import Loader from '../../components/ui/Loader/Loader';
import Button from '../../components/ui/Button';

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
            const response = await profileService.updateProfile(formData);
            console.log("🚀 ~ handleCreateProfile ~ response.data:", response.data)
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
        <section className="bg-white dark:bg-gray-900 pt-4 md:pt-4 lg:pt-2">
            <div className="max-w-screen-xl px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side - Headline and CTA */}
                <div className="space-y-6 lg:w-2xl xl:w-3xl">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl mb-20 font-extrabold text-gray-900 dark:text-white leading-tight">
                    Let’s find the right <span className="text-indigo-600 dark:text-indigo-500">freelancer</span> for your project
                    </h1>

                    <h2 className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="block mt-2 font-bold">
                        Post your job details and start receiving proposals instantly.
                    </span>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-6">
                    <Button
                        label="Post a Job"
                        onClick={() => {}}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold"
                    />
                    <Button
                        label="Browse Freelancers"
                        variant="secondary"
                        onClick={() => {}}
                        className="px-6 py-3 font-semibold"
                    />
                    </div>
                    <span className="block mt-2 text-1xl">
                        Find skilled freelancers across every industry and hire with complete confidence.
                    </span>
                    <span className="block mt-2 text-1xl">
                        With secure escrow payments, built-in chat and video calls, and transparent reviews, you can manage your project from start to finish—all in one place.
                    </span>
                    </h2>

                    {/* CTA Buttons */}
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