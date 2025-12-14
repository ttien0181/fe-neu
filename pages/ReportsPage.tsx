import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/apiService';
import { 
    CaseResponse, CategoryResponse, AppointmentResponse, QuestionResponse, 
    PersonResponse, AuditLogResponse, UserResponse, CaseFileResponse 
} from '../types';
import { Card, Button, Spinner, Input, Select, Label, DownloadIcon } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type ReportType = 'DASHBOARD' | 'CASES' | 'FILES' | 'APPOINTMENTS' | 'QUESTIONS' | 'USERS' | 'LOGS';

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportType>('DASHBOARD');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data State
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [files, setFiles] = useState<CaseFileResponse[]>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
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
                    filesRes, 
                    apptsRes, 
                    questsRes, 
                    usersRes, 
                    logsRes,
                    personsRes
                ] = await Promise.all([
                    api.getCases(),
                    api.getCategories(),
                    api.getCaseFiles(),
                    api.getAllAppointments(),
                    api.getAllQuestions(),
                    api.getUsers(),
                    api.getAuditLogs(),
                    api.getPersons()
                ]);

                setCases(casesRes);
                setCategories(catsRes);
                setFiles(filesRes);
                setAppointments(apptsRes);
                setQuestions(questsRes);
                setUsers(usersRes);
                setAuditLogs(logsRes);
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
            const itemDate = new Date(item[dateField] as string);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date(9999, 11, 31);
            // End date should include the whole day
            end.setHours(23, 59, 59);
            return itemDate >= start && itemDate <= end;
        });
    };

    const filteredCases = useMemo(() => filterByDate(cases, 'createdAt'), [cases, startDate, endDate]);
    // CaseFiles don't typically have createdAt in the response based on type definition, assuming logic or backend change. 
    // Using filteredCases to filter files by case association for now as a proxy if createdAt isn't on file.
    // Actually AuditLogs have timestamps. Files have `uploadedBy` but types.ts doesn't show createdAt. 
    // We will filter files based on the creation date of their parent case for this demo, or just list all if no date.
    const filteredFiles = useMemo(() => files.filter(f => filteredCases.find(c => c.id === f.caseId)), [files, filteredCases]);
    
    const filteredAppointments = useMemo(() => filterByDate(appointments, 'appointmentTime'), [appointments, startDate, endDate]);
    const filteredQuestions = useMemo(() => filterByDate(questions, 'createdAt'), [questions, startDate, endDate]);
    // User creation date not in type definition? Assuming 'createdAt' might be missing on type but usually exists. 
    // Let's assume all users for now if date missing.
    const filteredUsers = users; 
    const filteredLogs = useMemo(() => filterByDate(auditLogs, 'createdAt'), [auditLogs, startDate, endDate]);

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
            answered: filteredQuestions.filter(q => q.answer).length,
        };
        return { caseStats, apptStats, questStats };
    };

    const stats = getStats();
    const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const handlePrint = () => {
        window.print();
    };

    // --- Report Header for Print ---
    const PrintHeader = ({ title }: { title: string }) => (
        <div className="hidden print:block mb-6 border-b-2 border-primary pb-4">
            <h1 className="text-2xl font-bold text-primary uppercase text-center mb-1">{title}</h1>
            <p className="text-center font-bold text-sm text-secondary uppercase">CÔNG TY LUẬT TNHH QUỐC TẾ BÌNH AN | Website quản lý hồ sơ pháp lý</p>
            <div className="mt-4 flex justify-between text-xs">
                 <div>
                    <p><strong>BỘ LỌC:</strong></p>
                    <p>Từ ngày: {startDate || '...'}</p>
                    <p>Đến ngày: {endDate || '...'}</p>
                 </div>
                 <div className="text-right">
                    <p><strong>THÔNG TIN XUẤT:</strong></p>
                    <p>Người xuất: Admin</p>
                    <p>Thời điểm xuất: {new Date().toLocaleString()}</p>
                 </div>
            </div>
        </div>
    );

    const TableHeader = ({ cols }: { cols: string[] }) => (
        <thead className="bg-gray-100 print:bg-gray-200">
            <tr>
                {cols.map((col, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-bold text-primary uppercase border border-gray-300">
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
                <Button onClick={handlePrint} variant="primary">
                    <DownloadIcon /> Export / Print PDF
                </Button>
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
                            <option value="FILES">02_Case_Files_Report</option>
                            <option value="APPOINTMENTS">03_Appointments_Report</option>
                            <option value="QUESTIONS">04_Questions_Report</option>
                            <option value="USERS">05_Users_Roles_Report</option>
                            <option value="LOGS">06_Audit_Logs_Report</option>
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
                    <Card className="p-4 print:border print:border-gray-300">
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
                    <Card className="p-4 print:border print:border-gray-300">
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
                    <Card className="p-4 print:border print:border-gray-300">
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

                {/* Charts Area - Only visible on screen, tricky to print Recharts perfectly but we try */}
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
            </div>

            {/* --- CASES REPORT --- */}
            <div className={activeTab === 'CASES' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO TÌNH TRẠNG XỬ LÝ HỒ SƠ VỤ VIỆC" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300">
                        <TableHeader cols={['STT', 'Case_ID', 'Case Name', 'Category', 'Status', 'Court/Loc', 'Created', 'Updated']} />
                        <tbody>
                            {filteredCases.map((c, idx) => (
                                <tr key={c.id} className="border border-gray-300 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300">{c.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 font-medium">{c.caseName}</td>
                                    <td className="px-3 py-2 border border-gray-300">{categories.find(cat => cat.id === c.categoryId)?.name}</td>
                                    <td className="px-3 py-2 border border-gray-300">{c.status}</td>
                                    <td className="px-3 py-2 border border-gray-300">{c.courtName} - {c.location}</td>
                                    <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{new Date(c.updatedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* --- FILES REPORT --- */}
            <div className={activeTab === 'FILES' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO TÀI LIỆU/HỒ SƠ ĐÍNH KÈM THEO VỤ VIỆC" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300">
                        <TableHeader cols={['STT', 'File_ID', 'Case_ID', 'File Name', 'Type', 'Path', 'Uploaded By']} />
                        <tbody>
                            {filteredFiles.map((f, idx) => (
                                <tr key={f.id} className="border border-gray-300 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300">{f.id}</td>
                                    <td className="px-3 py-2 border border-gray-300">{f.caseId}</td>
                                    <td className="px-3 py-2 border border-gray-300 font-medium">{f.fileName}</td>
                                    <td className="px-3 py-2 border border-gray-300 uppercase">{f.fileType}</td>
                                    <td className="px-3 py-2 border border-gray-300 truncate max-w-xs">{f.filePath}</td>
                                    <td className="px-3 py-2 border border-gray-300">{f.uploadedBy || 'System'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* --- APPOINTMENTS REPORT --- */}
            <div className={activeTab === 'APPOINTMENTS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO LỊCH HẸN TƯ VẤN" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300">
                        <TableHeader cols={['STT', 'Appt_ID', 'Client', 'Lawyer', 'Time', 'Status', 'Notes']} />
                        <tbody>
                            {filteredAppointments.map((a, idx) => (
                                <tr key={a.id} className="border border-gray-300 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300">{a.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 font-medium">{a.userName}</td>
                                    <td className="px-3 py-2 border border-gray-300">{a.lawyerName}</td>
                                    <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{new Date(a.appointmentTime.replace(' ', 'T')).toLocaleString()}</td>
                                    <td className="px-3 py-2 border border-gray-300">{a.status}</td>
                                    <td className="px-3 py-2 border border-gray-300 italic">{a.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* --- QUESTIONS REPORT --- */}
            <div className={activeTab === 'QUESTIONS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO HỎI – ĐÁP TƯ VẤN" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300">
                        <TableHeader cols={['STT', 'Q_ID', 'Client', 'Lawyer', 'Asked Date', 'Status', 'Question']} />
                        <tbody>
                            {filteredQuestions.map((q, idx) => (
                                <tr key={q.id} className="border border-gray-300 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300">{q.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 font-medium">{q.questionerName}</td>
                                    <td className="px-3 py-2 border border-gray-300">{q.lawyerName}</td>
                                    <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{new Date(q.createdAt).toLocaleString()}</td>
                                    <td className="px-3 py-2 border border-gray-300">
                                        {q.answer ? <span className="text-green-600 font-bold">Answered</span> : <span className="text-yellow-600 font-bold">Pending</span>}
                                    </td>
                                    <td className="px-3 py-2 border border-gray-300 max-w-xs truncate">{q.content}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

             {/* --- USERS REPORT --- */}
             <div className={activeTab === 'USERS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO NGƯỜI DÙNG & PHÂN QUYỀN" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300">
                        <TableHeader cols={['STT', 'User_ID', 'Username', 'Email', 'Role', 'Status']} />
                        <tbody>
                            {filteredUsers.map((u, idx) => (
                                <tr key={u.id} className="border border-gray-300 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300">{u.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 font-bold">{u.username}</td>
                                    <td className="px-3 py-2 border border-gray-300">{u.email}</td>
                                    <td className="px-3 py-2 border border-gray-300">{u.role}</td>
                                    <td className="px-3 py-2 border border-gray-300">Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* --- LOGS REPORT --- */}
            <div className={activeTab === 'LOGS' ? 'block' : 'hidden print:hidden'}>
                <PrintHeader title="BÁO CÁO NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG)" />
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    <table className="min-w-full text-xs md:text-sm border-collapse border border-gray-300">
                        <TableHeader cols={['STT', 'Log_ID', 'Time', 'User ID', 'Action', 'Case ID', 'File ID']} />
                        <tbody>
                            {filteredLogs.map((l, idx) => (
                                <tr key={l.id} className="border border-gray-300 hover:bg-gray-50 print:break-inside-avoid">
                                    <td className="px-3 py-2 border border-gray-300 text-center">{idx + 1}</td>
                                    <td className="px-3 py-2 border border-gray-300">{l.id}</td>
                                    <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                                    <td className="px-3 py-2 border border-gray-300">{l.userId}</td>
                                    <td className="px-3 py-2 border border-gray-300 font-medium">{l.action}</td>
                                    <td className="px-3 py-2 border border-gray-300">{l.caseId || '-'}</td>
                                    <td className="px-3 py-2 border border-gray-300">{l.fileId || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
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