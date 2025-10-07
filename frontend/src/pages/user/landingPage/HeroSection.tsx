import React from 'react';
import Button from '../../../components/ui/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900 pt-6 pb-10 md:pt-4 lg:pt-1">

      <div className="max-w-screen-xl px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Heading and Introduction */}
          <div className="space-y-6 lg:w-2xl xl:w-3xl">
            <p className="font-bold text-gray-900 dark:text-white">
              BUILD Your CAREER with FREEDOM
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Be a <span className="text-indigo-600">Freelancer</span>, Work Smarter & Grow Faster.
            </h1>

            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="block mt-2">
                Find your dream projects and clients with our Freelance Marketplace. Connect with businesses worldwide, showcase your skills, and get paid securely.
              </span>
              <span className="block mt-2">
                Whether you’re a designer, developer, writer, or marketer — unlock opportunities, get job alerts, and work on your terms with ease.
              </span>
              <span className="block mt-2">
                For clients, our platform offers instant access to top-tier freelance talent across industries. Post jobs, review portfolios, and hire with confidence — all in one seamless experience.
              </span>
              <span className="block mt-2">
                Whether you're building a startup, scaling a business, or launching a creative campaign, we help you find the right people to bring your vision to life.
              </span>
            </p>

            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                label="Get Started"
                onClick={() => {}}
                className="px-6 py-3 bg-indigo-500 text-white font-semibold"
              />
              <Button
                label="Explore Marketplace"
                variant="secondary"
                onClick={() => {}}
                className="px-6 py-3 font-semibold"
              />
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="w-full lg:ml-4 xl:ml-5">
            <img
              src="/images/hero-illustration.png"
              alt="Hero Illustration"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
