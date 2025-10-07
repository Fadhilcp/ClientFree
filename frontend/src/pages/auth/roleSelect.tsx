import SingleCard from '../../components/auth/RoleCard';
import { useNavigate } from 'react-router-dom';

const RoleSelect = () => {
  const navigate = useNavigate();

  const handleSelect = (role: 'freelancer' | 'client') => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-6 py-10 flex flex-col items-center">
      <div className="max-w-3xl text-center mb-12">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">
          Choose Your Role to Get Started
        </h1>
        <p className="text-lg text-gray-900 dark:text-gray-200">
          Select the role that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        <SingleCard
          image="/images/iam-client.png"
          CardTitle="I'm a Client"
          CardDescription="Post jobs, hire top freelancers, and manage projects easily."
          Button="Continue as Client"
          onClick={() => handleSelect('client')}
        />

        <SingleCard
          image="/images/iam-freelancer.png"
          CardTitle="I'm a Freelancer"
          CardDescription="Find projects, showcase skills, and get paid securely."
          Button="Continue as Freelancer"
          onClick={() => handleSelect('freelancer')}
        />
      </div>
    </div>
  );
};

export default RoleSelect;