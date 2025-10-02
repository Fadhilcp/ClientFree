import React from "react";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import SkillList from "../../../components/user/profile/SkillLIst";
import ContactDetails from "../../../components/user/profile/ContactDetails";
import OnlineLinks from "../../../components/user/profile/OnlineLinks";
import CompanyDetails from "../../../components/user/profile/CompanyDetails";
import Description from "../../../components/user/profile/Description";
import About from "../../../components/user/profile/About";
import ExperienceLevel from "../../../components/user/profile/ExperienceLevel";
import HourlyRate from "../../../components/user/profile/HourlyRate";
import ProfileHeader from "../../../components/user/profile/ProfileHeader";

const Profile : React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-10xl mx-auto my-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 animate-gradient text-white p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center">
              
              {/* Profile Image */}
              <ProfileImage/>

              {/* Profile Header */}
              <ProfileHeader/>

            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="col-span-2 space-y-8">

            {/* Freelancer: Hourly Rate & Experience Level */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Freelancer : Hourly Rate */}
                <HourlyRate/>

                {/* Freelancer : Experience level */}
                <ExperienceLevel/>
            </div>

            {/* Freelancer: About */}
            <About/>

            {/* Description */}
            <Description/>


            {/* Client: Company Details */}
            <CompanyDetails/>

            </div>

            {/* Right Column */}
            <div className="space-y-8">

              {/* Skills */}
              <SkillList/>

              {/* Contact */}
              <ContactDetails/>

              {/* Online Links */}
              <OnlineLinks/>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;