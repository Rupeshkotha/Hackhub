import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import CallToAction from '../components/CallToAction';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
    </>
  );
};

export default Home; 