import React, { useEffect, useState } from 'react'
import ProfileModal from './profile/ProfileModal'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store';
import { resetNewUser } from '../../features/authSlice';

const Home : React.FC = () => {

    const dispatch = useDispatch();
    const isNewUser = useSelector((state: RootState) => state.auth.isNewUser);
    const user = useSelector((state: RootState) => state.auth.user);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if(isNewUser) {
            setIsModalOpen(true);
            dispatch(resetNewUser());
        }
    }, [isNewUser, dispatch])


  return (


    <div>

        <ProfileModal open={isModalOpen}
        role={user?.role || "client"}
        onSave={(data) => {
            console.log("Saved profile data:", data);
            setIsModalOpen(false);
        }}  
        onClose={()=> setIsModalOpen(false)}
        defaultValues={user}
        />

        <h1>Home Page</h1>
      
    </div>
  )
}

export default Home
