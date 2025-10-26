
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { AuditLogResponse, CaseResponse } from '../types';
import { Spinner } from '../components/ui';

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogResponse[]>([]);
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [logsData, casesData] = await Promise.all([
                api.getAuditLogs(),
                api.getCases()
            ]);
            setLogs(logsData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setCases(casesData);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch audit logs.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const getCaseName = (caseId: number | null) => {
        if (caseId === null) return 'N/A';
        return cases.find(c => c.id === caseId)?.caseName || `Case ID: ${caseId}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
            </div>

            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Related Case</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Related File ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{log.userId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.action}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCaseName(log.caseId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.fileId || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;
