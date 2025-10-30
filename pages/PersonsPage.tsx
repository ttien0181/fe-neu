import React from 'react';
import { Card } from '../components/ui';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-background pt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-4">About LegalFlow</h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            We provide a modern, streamlined solution for legal professionals to manage cases with efficiency and clarity.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <h3 className="text-2xl font-semibold text-accent mb-3">Our Vision</h3>
            <p className="text-secondary">To empower legal teams with intuitive technology, transforming complex workflows into simple, manageable processes and driving better outcomes.</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-semibold text-accent mb-3">Our Mission</h3>
            <p className="text-secondary">To deliver a secure, reliable, and user-friendly case management platform that centralizes information and enhances collaboration for legal practices of all sizes.</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-semibold text-accent mb-3">Our Technology</h3>
            <p className="text-secondary">Built on a robust and scalable architecture, LegalFlow ensures your data is secure and accessible, allowing you to focus on what matters most: your clients.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;