import React from 'react';
import { Link } from 'react-router-dom';
import { Button, GithubIcon } from '../components/ui';

const LandingPage: React.FC = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-primary text-center px-4 pt-20">
             <div className="relative z-10 flex flex-col items-center">
                 <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                    Bringing Clarity to the <br/> Legal World.
                 </h1>
                 <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10">
                    LegalFlow is a modern, intuitive platform that makes high-performance case management accessible to legal professionals everywhere, streamlining workflows where complexity is common.
                 </p>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to="/register">
                        <Button variant="primary" className="w-full sm:w-auto px-6 py-3 text-lg">
                            Start Free Trial
                        </Button>
                    </Link>
                     <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" className="w-full sm:w-auto px-6 py-3 text-lg">
                            <GithubIcon />
                            View on GitHub
                        </Button>
                    </a>
                 </div>
            </div>
        </div>
    );
};

export default LandingPage;