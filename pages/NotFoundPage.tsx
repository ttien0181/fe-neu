
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-blue-500">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="mt-2 text-gray-400">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
