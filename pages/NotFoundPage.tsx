import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="mt-2 text-secondary">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6">
        <Button>
            Go to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;