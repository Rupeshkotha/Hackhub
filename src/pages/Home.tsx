import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/50 text-text overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 flex items-center justify-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                <span className="gradient-text">HackHub</span>
                <br />
                <span className="text-text-secondary block mt-2 md:mt-4">Find Your Perfect Team</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-md md:mx-0 mx-auto">
                Connect with talented developers, designers, and innovators. Find the perfect team members
                with complementary skills and create something amazing together.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-5">
                {currentUser ? (
                  <Link to="/teams" className="btn btn-primary btn-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                    Explore Teams
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-primary btn-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-outline btn-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm lg:max-w-md h-80 md:h-96">
                 {/* Subtle Gradient Background Effect */}
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-60 blur-[120px] animate-pulse duration-[6s]" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/20 opacity-60 blur-[120px] animate-slow-spin duration-[12s] delay-500" />

                {/* Removed the distinct blob shapes */}

                 {/* Placeholder or subtle element if needed */}
                 {/* <div className="relative glass rounded-3xl p-10 shadow-lg border border-white/10 animate-float duration-[4s]">
                  <div className="space-y-5">
                    <div className="h-6 bg-surface rounded-lg w-11/12 opacity-80" />
                    <div className="h-6 bg-surface rounded-lg w-9/12 opacity-80" />
                    <div className="h-6 bg-surface rounded-lg w-10/12 opacity-80" />
                    <div className="h-6 bg-surface rounded-lg w-8/12 opacity-80" />
                    <div className="h-6 bg-surface rounded-lg w-10/12 opacity-80" />
                  </div>
                </div> */}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-surface/70">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why Choose <span className="gradient-text">HackHub</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: 'Smart Team Matching',
                description: 'Our AI-powered system helps you find team members with complementary skills and interests, boosting your project\'s potential.',
                icon: '🎯'
              },
              {
                title: 'Real-time Collaboration',
                description: 'Facilitate seamless teamwork with integrated communication and project tools for efficient development.',
                icon: '🤝'
              },
              {
                title: 'Skill Verification',
                description: 'Build trust within your team by highlighting verified skills and contributions of each member.',
                icon: '✅'
              }
            ].map((feature, index) => (
              <div key={index} className="card glass p-8 text-center hover:shadow-xl transition-shadow duration-300 border border-white/10">
                <div className="text-6xl mb-6 flex justify-center text-primary">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-text">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How <span className="gradient-text">HackHub</span> Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Sign up and build a detailed profile showcasing your skills and experience to attract teammates.'
              },
              {
                step: '2',
                title: 'Explore Teams',
                description: 'Browse existing teams looking for members or create your own for any hackathon you plan to join.'
              },
              {
                step: '3',
                title: 'Connect & Collaborate',
                description: 'Send join requests, accept invitations, and work seamlessly with your team using built-in tools.'
              },
              {
                step: '4',
                title: 'Build & Innovate',
                description: 'Leverage your team\'s combined power to build amazing projects, learn, and succeed in hackathons.'
              }
            ].map((step, index) => (
              <div key={index} className="card glass text-center p-8 border border-white/10">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 border-2 border-primary/60 shadow-lg">
                  <span className="text-3xl font-bold gradient-text">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-surface/70">
        <div className="container mx-auto px-4">
          <div className="card glass text-center max-w-4xl mx-auto p-10 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="gradient-text">Hackathon Journey</span>?
            </h2>
            <p className="text-text-secondary mb-10 text-lg leading-relaxed">
              Join thousands of developers and innovators who are already building amazing projects together.
            </p>
            {currentUser ? (
              <Link to="/teams" className="btn btn-primary btn-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                Explore Teams
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-primary btn-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 