import React, { useEffect, useState } from 'react';
import { getCases, getCategories, getPersons } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Card, Spinner } from '../components/ui';
import { CaseResponse, CategoryResponse } from '../types';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <p className="text-5xl font-bold text-accent">{value}</p>
        <h3 className="text-lg font-semibold text-secondary mt-2">{title}</h3>
    </Card>
);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ cases: 0, categories: 0, persons: 0 });
    const [recentCases, setRecentCases] = useState<CaseResponse[]>([]);
    const [casesByCategory, setCasesByCategory] = useState<({ id: number; name: string; count: number; })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [cases, categories, persons] = await Promise.all([
                    getCases(),
                    getCategories(),
                    getPersons()
                ]);

                // Set main stats
                setStats({
                    cases: cases.length,
                    categories: categories.length,
                    persons: persons.length,
                });

                // Get recent cases
                const sortedCases = [...cases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                setRecentCases(sortedCases.slice(0, 5));

                // Get cases by category
                const categoryCounts = categories.map(category => {
                    const count = cases.filter(c => c.categoryId === category.id).length;
                    return { id: category.id, name: category.name, count };
                });
                setCasesByCategory(categoryCounts);

            } catch (err: any) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard title="Total Cases" value={stats.cases} />
                        <StatCard title="Total Categories" value={stats.categories} />
                        <StatCard title="Total Persons" value={stats.persons} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <h2 className="text-2xl font-semibold text-primary mb-4">Recent Activity</h2>
                            {recentCases.length > 0 ? (
                                <div className="space-y-3">
                                    {recentCases.map(c => (
                                        <div key={c.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                                            <div>
                                                <p className="font-semibold text-primary">{c.caseName}</p>
                                                <p className="text-sm text-secondary">Last updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                            <Link to={`/app/cases/${c.id}`} className="text-accent font-semibold hover:underline text-sm">View</Link>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-secondary">No recent case activity.</p>}
                        </Card>
                         <Card>
                            <h2 className="text-2xl font-semibold text-primary mb-4">Cases by Category</h2>
                            {casesByCategory.length > 0 ? (
                               <div className="w-full h-80">
                                   <ResponsiveContainer>
                                       <BarChart
                                           data={casesByCategory}
                                           margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                       >
                                           <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                           <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                           <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} />
                                           <Tooltip
                                               cursor={{ fill: '#f1f5f9' }}
                                               contentStyle={{
                                                   background: '#ffffff',
                                                   border: '1px solid #e2e8f0',
                                                   borderRadius: '0.5rem',
                                               }}
                                           />
                                           <Bar dataKey="count" fill="#14b8a6" name="Cases" />
                                       </BarChart>
                                   </ResponsiveContainer>
                               </div>
                            ) : <p className="text-secondary">No category data to display.</p>}
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;