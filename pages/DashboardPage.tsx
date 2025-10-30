import React, { useEffect, useState } from 'react';
import { getCases, getCategories, getPersons } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Card, Spinner } from '../components/ui';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <p className="text-5xl font-bold text-accent">{value}</p>
        <h3 className="text-lg font-semibold text-secondary mt-2">{title}</h3>
    </Card>
);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ cases: 0, categories: 0, persons: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cases, categories, persons] = await Promise.all([
                    getCases(),
                    getCategories(),
                    getPersons()
                ]);
                setStats({
                    cases: cases.length,
                    categories: categories.length,
                    persons: persons.length,
                });
            } catch (err: any) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome back, {user?.username}!</h1>
            <p className="text-secondary mb-8">Here's a quick overview of your system.</p>
            {loading ? (
                 <div className="flex justify-center items-center h-64">
                    <Spinner />
                 </div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Cases" value={stats.cases} />
                    <StatCard title="Total Categories" value={stats.categories} />
                    <StatCard title="Total Persons" value={stats.persons} />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;