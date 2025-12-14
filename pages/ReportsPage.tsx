import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/apiService';
import { 
    CaseResponse, CategoryResponse, AppointmentResponse, QuestionResponse, 
    PersonResponse
} from '../types';
import { Card, Button, Spinner, Input, Select, Label, DownloadIcon } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type ReportType = 'DASHBOARD' | 'CASES' | 'APPOINTMENTS' | 'QUESTIONS' | 'PERSONS';

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportType>('DASHBOARD');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data State
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [persons, setPersons] = useState<PersonResponse[]>([]);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch all data needed for reports
                const [
                    casesRes, 
                    catsRes, 
                    apptsRes, 
                    questsRes, 
                    personsRes
                ] = await Promise.all([
                    api.getCases(),
                    api.getCategories(),
                    api.getAllAppointments(),
                    api.getAllQuestions(),
                    api.getPersons()
                ]);

                setCases(casesRes);
                setCategories(catsRes);
                setAppointments(apptsRes);
                setQuestions(questsRes);
                setPersons(personsRes);
                
            } catch (err: any) {
                setError("Failed to load report data. " + (err.message || ''));
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Filter Logic
    const filterByDate = <T extends { createdAt?: string, appointmentTime?: string }>(
        items: T[], 
        dateField: keyof T
    ) => {
        if (!startDate && !endDate) return items;
        return items.filter(item => {
            const dateValue = item[dateField] as string;
            if (!dateValue) return false; // Skip if date is missing
            const itemDate = new Date(dateValue);
            if (isNaN(itemDate.getTime())) return false; // Skip if invalid date

            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date(9999, 11, 31);
            // End date should include the whole day
            end.setHours(23, 59, 59);
            return itemDate >= start && itemDate <= end;
        });
    };

    const filteredCases = useMemo(() => filterByDate(cases, 'createdAt'), [cases, startDate, endDate]);
    const filteredAppointments = useMemo(() => filterByDate(appointments, 'appointmentTime'), [appointments, startDate, endDate]);
    const filteredQuestions = useMemo(() => filterByDate(questions, 'createdAt'), [questions, startDate, endDate]);
    
    // Persons do not have a createdAt field in the provided DTO, so we do not filter them by date.
    const filteredPersons = persons; 

    // Dashboard Calculations
    const getStats = () => {
        const caseStats = {
            total: filteredCases.length,
            processing: filteredCases.filter(c => c.status === 'Processing' || c.status === 'OPEN').length,
            completed: filteredCases.filter(c => c.status === 'Completed' || c.status === 'CLOSED').length,
            waiting: filteredCases.filter(c => c.status === 'Waiting' || c.status === 'PENDING').length,
        };
        const apptStats = {
            total: filteredAppointments.length,
            pending: filteredAppointments.filter(a => a.status === 'PENDING').length,
            approved: filteredAppointments.filter(a => a.status === 'ACCEPTED').length,
            cancelled: filteredAppointments.filter(a => a.status === 'REJECTED').length,
        };
        const questStats = {
            total: filteredQuestions.length,
            pending: filteredQuestions.filter(q => !q.answer).length,
            answered: filteredQuestions.filter(q => !!q.answer).length,
        };
        return { caseStats, apptStats, questStats };
    };

    const stats = getStats();
    const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    // Helper for safe date formatting
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString.replace(' ', 'T')); // Handle potential space in SQL timestamps
        return isNaN(d.getTime()) ? '-' : d.toLocaleString();
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        let headers: string[] = [];
        let data: any[] = [];
        let filename = `Report_${activeTab}_${new Date().toISOString().split('T')[0]}`;

        if (activeTab === 'CASES') {
            headers = ['STT', 'Case ID', 'Case Name', 'Category', 'Status', 'Court', 'Location', 'Created At', 'Updated At'];
            data = filteredCases.map((c, idx) => ({
                stt: idx + 1,
                id: c.id,
                name: c.caseName,
                category: categories.find(cat => cat.id === c.categoryId)?.name || '',
                status: c.status,
                court: c.courtName,
                location: c.location,
                created: formatDate(c.createdAt),
                updated: formatDate(c.updatedAt)
            }));
        } else if (activeTab === 'APPOINTMENTS') {
            headers = ['STT', 'Appt ID', 'Client', 'Lawyer', 'Time', 'Status', 'Notes'];
            data = filteredAppointments.map((a, idx) => ({
                stt: idx + 1,
                id: a.id,
                client: a.userName,
                lawyer: a.lawyerName,
                time: formatDateTime(a.appointmentTime),
                status: a.status,
                notes: a.notes
            }));
        } else if (activeTab === 'QUESTIONS') {
             headers = ['STT', 'Q ID', 'Client', 'Lawyer', 'Asked Date', 'Status', 'Question', 'Answer'];
             data = filteredQuestions.map((q, idx) => ({
                stt: idx + 1,
                id: q.id,
                client: q.questionerName,
                lawyer: q.lawyerName,
                date: formatDateTime(q.createdAt),
                status: q.answer ? 'Answered' : 'Pending',
                question: q.content,
                answer: q.answer || ''
             }));
        } else if (activeTab === 'PERSONS') {
            headers = ['STT', 'Person ID', 'Name', 'Role', 'Contact Info'];
            data = filteredPersons.map((p, idx) => ({
                stt: idx + 1,
                id: p.id,
                name: p.name,
                role: p.role,
                contact: p.contactInfo
            }));
        } else if (activeTab === 'DASHBOARD') {
             headers = ['Category', 'Metric', 'Value'];
             const s = getStats();
             data = [
                { cat: 'Cases', metric: 'Total Cases', value: s.caseStats.total },
                { cat: 'Cases', metric: 'Processing', value: s.caseStats.processing },
                { cat: 'Cases', metric: 'Completed', value: s.caseStats.completed },
                { cat: 'Cases', metric: 'Waiting', value: s.caseStats.waiting },
                { cat: 'Appointments', metric: 'Total', value: s.apptStats.total },
                { cat: 'Appointments', metric: 'Pending', value: s.apptStats.pending },
                { cat: 'Appointments', metric: 'Approved', value: s.apptStats.approved },
                { cat: 'Appointments', metric: 'Cancelled', value: s.apptStats.cancelled },
                { cat: 'Questions', metric: 'Total', value: s.questStats.total },
                { cat: 'Questions', metric: 'Pending', value: s.questStats.pending },
                { cat: 'Questions', metric: 'Answered', value: s.questStats.answered },
             ];
        }

        // CSV Creation
        const csvContent = [
            headers.join(','),
            ...data.map(row => Object.values(row).map(v => {
                // Escape quotes and wrap in quotes
                const val = String(v || '').replace(/"/g, '""');
                return `"${val}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Report Header for Print ---
    const PrintHeader = ({ title }: { title: string }) => (
        <div className="hidden print:block mb-8 border-b-2 border-primary pb-4">
            <div className="flex justify-between items-start">
                <div>
                     <h1 className="text-xl font-bold text-primary uppercase mb-1">CÔNG TY LUẬT TNHH QUỐC TẾ BÌNH AN</h1>
                     <p className="text-sm text-secondary">Trụ sở: 2/532 Ngọc Thụy, Long Biên, TP. Hà Nội</p>
                     <p className="text-sm text-secondary">Website quản lý hồ sơ pháp lý</p>
                </div>
                <div className="text-right text-xs">
                    <p>Ngày xuất: {new Date().toLocaleString()}</p>
                    <p>Người xuất: Admin</p>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-center mt-8 uppercase">{title}</h2>
            <div className="mt-2 text-center text-sm italic">
                (Từ ngày: {startDate || '...'} - Đến ngày: {endDate || '...'})
            </div>
        </div>
    );

    // --- Report Footer for Print ---
    const PrintFooter = () => (
        <div className="hidden print:block mt-12 break-inside-avoid">
            <div className="flex justify-end px-10">
                <div className="text-center">
                    <p className="font-bold mb-1 uppercase">GIÁM ĐỐC</p>
                    <p className="italic text-xs mb-20">(Ký và ghi rõ họ tên)</p>
                    <p className="font-bold">__________________________</p>
                </div>
            </div>
        </div>
    );

    const TableHeader = ({ cols }: { cols: string[] }) => (
        <thead className="bg-gray-100 print:bg-gray-200">
            <tr>
                {cols.map((col, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-bold text-primary uppercase border border-gray-300 print:border-gray-500">
                        {col}
                    </th>
                ))}
            </tr>
        </thead>
    );

    if (loading) return <div className="flex justify-center mt-20"><Spinner /></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-bold text-primary">Reports & Analytics</h1>
                <div className="flex gap-2">
                    <Button onClick={handleExportExcel} variant="secondary">
                        <DownloadIcon /> Export Excel (CSV)
                    </Button>
                    <Button onClick={handlePrint} variant="primary">
                        <DownloadIcon /> Print / Save PDF
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <Card className="p-4 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label>From Date</Label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <Label>To Date</Label>
                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div>
                        <Label>Report Type</Label>
                        <Select value={activeTab} onChange={e => setActiveTab(e.target.value as ReportType)}>
                            <option value="DASHBOARD">Dashboard (KPIs)</option>
                            <option value="CASES">01_Cases_Report</option>
                            <option value="APPOINTMENTS">03_Appointments_Report</option>
                            <option value="QUESTIONS">04_Questions_Report</option>
                            <option value="PERSONS">05_Persons_Report</option>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setStartDate(''); setEndDate(''); }} className="w-full">Clear</Button>
                    </div>
                </div>
            </Card>

            {/* --- DASHBOARD VIEW --- */}
            <div className={activeTab === 'DASHBOARD' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="DASHBOARD KPI (TỔNG HỢP TỪ CÁC SHEET BÁO CÁO)" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 print:grid-cols-3">
                    <Card className="p-4 print:border print:border-gray-400 print:shadow-none">
                        <h3 className="font-bold text-lg mb-2 text-center">Cases Overview</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b"><th className="text-left py-1">State</th><th className="text-right py-1">Count</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Processing</td><td className="text-right">{stats.caseStats.processing}</td></tr>
                                    <tr><td>Completed</td><td className="text-right">{stats.caseStats.completed}</td></tr>
                                    <tr><td>Waiting</td><td className="text-right">{stats.caseStats.waiting}</td></tr>
                                    <tr className="font-bold border-t"><td>Total</td><td className="text-right">{stats.caseStats.total}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <Card className="p-4 print:border print:border-gray-400 print:shadow-none">
                        <h3 className="font-bold text-lg mb-2 text-center">Appointments Overview</h3>
                         <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b"><th className="text-left py-1">State</th><th className="text-right py-1">Count</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Pending</td><td className="text-right">{stats.apptStats.pending}</td></tr>
                                    <tr><td>Approved</td><td className="text-right">{stats.apptStats.approved}</td></tr>
                                    <tr><td>Cancelled</td><td className="text-right">{stats.apptStats.cancelled}</td></tr>
                                    <tr className="font-bold border-t"><td>Total</td><td className="text-right">{stats.apptStats.total}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <Card className="p-4 print:border print:border-gray-400 print:shadow-none">
                        <h3 className="font-bold text-lg mb-2 text-center">Questions Overview</h3>
                         <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b"><th className="text-left py-1">State</th><th className="text-right py-1">Count</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Pending</td><td className="text-right">{stats.questStats.pending}</td></tr>
                                    <tr><td>Answered</td><td className="text-right">{stats.questStats.answered}</td></tr>
                                    <tr className="font-bold border-t"><td>Total</td><td className="text-right">{stats.questStats.total}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                    <Card className="p-6 h-80">
                         <h3 className="font-bold mb-4">Cases by Category</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categories.map(c => ({ name: c.name, count: filteredCases.filter(k => k.categoryId === c.id).length }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card className="p-6 h-80">
                         <h3 className="font-bold mb-4">Appointments Status</h3>
                          <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={[
                                            { name: 'Pending', value: stats.apptStats.pending },
                                            { name: 'Approved', value: stats.apptStats.approved },
                                            { name: 'Cancelled', value: stats.apptStats.cancelled },
                                        ]} 
                                        cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label
                                    >
                                        {['Pending', 'Approved', 'Cancelled'].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                    </Card>
                </div>
                <PrintFooter />
            </div>

            {/* --- CASES REPORT --- */}
            <div className={activeTab === 'CASES' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO TÌNH TRẠNG XỬ LÝ HỒ SƠ VỤ VIỆC" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300 print:border-gray-500">
                        <TableHeader cols={['STT', 'Case_ID', 'Case Name', 'Category', 'Status', 'Court/Loc', 'Created', 'Updated']} />
                        <tbody>
                            {filteredCases.map((c, idx) => (
                                <tr key={c.id} className="border border-gray-300 print:border-gray-500 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{c.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 font-medium">{c.caseName || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{categories.find(cat => cat.id === c.categoryId)?.name || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{c.status || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{c.courtName || '-'} / {c.location || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 whitespace-nowrap">{formatDate(c.updatedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                <PrintFooter />
            </div>

            {/* --- APPOINTMENTS REPORT --- */}
            <div className={activeTab === 'APPOINTMENTS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO LỊCH HẸN TƯ VẤN" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300 print:border-gray-500">
                        <TableHeader cols={['STT', 'Appt_ID', 'Client', 'Lawyer', 'Time', 'Status', 'Notes']} />
                        <tbody>
                            {filteredAppointments.map((a, idx) => (
                                <tr key={a.id} className="border border-gray-300 print:border-gray-500 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{a.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 font-medium">{a.userName || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{a.lawyerName || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 whitespace-nowrap">{formatDateTime(a.appointmentTime)}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{a.status}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 italic">{a.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                <PrintFooter />
            </div>

            {/* --- QUESTIONS REPORT --- */}
            <div className={activeTab === 'QUESTIONS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO HỎI – ĐÁP TƯ VẤN" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300 print:border-gray-500">
                        <TableHeader cols={['STT', 'Q_ID', 'Client', 'Lawyer', 'Asked Date', 'Status', 'Question']} />
                        <tbody>
                            {filteredQuestions.map((q, idx) => (
                                <tr key={q.id} className="border border-gray-300 print:border-gray-500 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{q.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 font-medium">{q.questionerName || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{q.lawyerName || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 whitespace-nowrap">{formatDateTime(q.createdAt)}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">
                                        {q.answer ? <span className="text-green-600 font-bold print:text-black">Answered</span> : <span className="text-yellow-600 font-bold print:text-black">Pending</span>}
                                    </td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 max-w-xs truncate">{q.content || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                <PrintFooter />
            </div>

             {/* --- PERSONS REPORT --- */}
             <div className={activeTab === 'PERSONS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO DANH SÁCH NHÂN SỰ/ĐỐI TƯỢNG (PERSONS)" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300 print:border-gray-500">
                        <TableHeader cols={['STT', 'Person_ID', 'Name', 'Role', 'Contact Info']} />
                        <tbody>
                            {filteredPersons.map((p, idx) => (
                                <tr key={p.id} className="border border-gray-300 print:border-gray-500 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{p.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500 font-bold">{p.name || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{p.role || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300 print:border-gray-500">{p.contactInfo || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                <PrintFooter />
            </div>

            {/* Style to hide non-printing elements when printing */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    #root, #root > div, main, .p-4, .p-6 {
                        padding: 0;
                        margin: 0;
                        background: white;
                    }
                    /* Specifically target the active tab content to be visible */
                    .block {
                        display: block !important;
                        visibility: visible !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    /* Make all children of the active tab visible */
                    .block * {
                        visibility: visible !important;
                    }
                    /* Ensure tables look good */
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #000 !important;
                        padding: 4px 8px !important;
                        color: #000 !important;
                    }
                    /* Hide scrollbars */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    /* Page breaks */
                    tr {
                        break-inside: avoid;
                    }
                    h1, h2, h3, p {
                        color: #000 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReportsPage;