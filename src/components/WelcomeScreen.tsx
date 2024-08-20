// WelcomeScreen.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Image, Bell, Zap } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="welcome-screen">
      <style jsx global>{`
        /* Modern scrollbar styles */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #F8B500;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #E5A700;
        }

        /* For Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #F8B500 #f1f1f1;
        }

        /* Other styles */
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .fade-in.show {
          opacity: 1;
          transform: translateY(0);
        }
        .hover-lift {
          transition: transform 0.3s ease-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        .hero-background {
          background-color: #F8B500;
          background-image: radial-gradient(circle, #ffffff33 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .hero-content {
          background: rgba(248, 181, 0, 0.8);
          backdrop-filter: blur(5px);
        }
      `}</style>

      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 bg-white shadow-md z-50 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="https://i.ibb.co/yBTXZXL/svgviewer-png-output-3.png" alt="Logo" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#home" className="border-yellow-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="#features" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Features
                </a>
                <a href="#pricing" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Pricing
                </a>
              </div>
            </div>
            <div className="ml-6 flex items-center">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative hero-background overflow-hidden min-h-screen flex items-center">
        <div className="hero-content w-full py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl fade-in">
                <span className="block">Connect, Share, and</span>
                <span className="block text-yellow-200">Grow Together</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-yellow-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl fade-in">
                Join our vibrant community where ideas flourish, connections deepen, and experiences are shared. Unleash your creativity and connect with like-minded individuals from around the globe.
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center fade-in">
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                  <Link to="/login" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-yellow-700 bg-white hover:bg-yellow-50 sm:px-8 transition duration-300 ease-in-out hover-lift">
                    Get started
                  </Link>
                  <a href="#features" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 bg-opacity-60 hover:bg-opacity-70 sm:px-8 transition duration-300 ease-in-out hover-lift">
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center pb-8 fade-in">
          <a href="#features" className="text-white hover:text-yellow-200 transition duration-300">
            <span className="sr-only">Scroll to features</span>
            <svg className="h-6 w-6 inline-block animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center fade-in">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to thrive socially
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform is designed to enhance your social experience with powerful features that foster genuine connections and engaging interactions.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: 'Global Community',
                  description: 'Connect with people from diverse backgrounds and cultures around the world.',
                  icon: Users,
                },
                {
                  name: 'Rich Media Sharing',
                  description: 'Share your moments with high-quality photo and video uploads.',
                  icon: Image,
                },
                {
                  name: 'Real-time Notifications',
                  description: 'Stay updated with instant notifications on interactions and new content.',
                  icon: Bell,
                },
                {
                  name: 'Intelligent Feed',
                  description: 'Experience a personalized feed that learns and adapts to your interests.',
                  icon: Zap,
                },
              ].map((feature, index) => (
                <div key={feature.name} className="relative fade-in hover-lift" style={{transitionDelay: `${index * 100}ms`}}>
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center fade-in">
            <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">Choose Your Journey</h1>
            <p className="mt-5 text-xl text-gray-500 sm:text-center">
              Simple, transparent pricing that grows with you
            </p>
          </div>
          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: 'Free',
                features: [
                  'Create a personal profile',
                  'Connect with friends',
                  'Share posts and photos',
                  'Basic feed customization',
                ],
                cta: 'Start for free',
              },
              {
                name: 'Pro',
                price: '$9.99',
                features: [
                  'All Starter features',
                  'Ad-free experience',
                  'Advanced analytics',
                  'Priority support',
                ],
                cta: 'Upgrade to Pro',
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                  'All Pro features',
                  'Custom branding',
                  'API access',
                  'Dedicated account manager',
                ],
                cta: 'Contact sales',
              },
            ].map((tier, index) => (
              <div key={tier.name} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 fade-in hover-lift" style={{transitionDelay: `${index * 100}ms`}}>
                <div className="p-6">
                  <h2 className="text-2xl leading-6 font-semibold text-gray-900">{tier.name}</h2>
                  <p className="mt-4 text-sm text-gray-500">{tier.features.join('. ')}</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                    {tier.price !== 'Custom' && <span className="text-base font-medium text-gray-500">/mo</span>}
                  </p>
                  <a
                    href="#"
                    className="mt-8 block w-full bg-yellow-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-yellow-700 transition duration-300 ease-in-out"
                  >
                    {tier.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomeScreen;