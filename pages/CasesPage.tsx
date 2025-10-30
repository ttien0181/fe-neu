import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { CaseResponse, CaseRequest, CategoryResponse, CaseFileResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Textarea, Select, Spinner, PlusIcon, EditIcon, DeleteIcon, Label, Card, DownloadIcon, EyeIcon } from '../components/ui';

const BASE_URL = 'http://localhost:8080/legal-case-management/api';

const CaseForm: React.FC<{
    initialData: CaseRequest | null;
    categories: CategoryResponse[];
    onSubmit: (data: CaseRequest) => void;
    onCancel: () => void;
}> = ({ initialData, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CaseRequest>(initialData || {
        caseName: '',
        caseDescription: '',
        status: 'OPEN',
        courtName: '',
        location: '',
        categoryId: categories[0]?.id || undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'categoryId' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="caseName">Case Name</Label>
                <Input id="caseName" name="caseName" value={formData.caseName} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="caseDescription">Description</Label>
                <Textarea id="caseDescription" name="caseDescription" value={formData.caseDescription || ''} onChange={handleChange} />
            </div>
             <div>
                <Label htmlFor="status">Status</Label>
                <Input id="status" name="status" value={formData.status || ''} onChange={handleChange} />
            </div>
             <div>
                <Label htmlFor="courtName">Court Name</Label>
                <Input id="courtName" name="courtName" value={formData.courtName || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Case</Button>
            </div>
        </form>
    );
};


const CaseDetail: React.FC<{ caseId: string }> = ({ caseId }) => {
    const [caseItem, setCaseItem] = useState<CaseResponse | null>(null);
    const [files, setFiles] = useState<CaseFileResponse[]>([]);
    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<CaseFileResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const caseData = await api.getCaseById(Number(caseId));
                setCaseItem(caseData);

                if (caseData.categoryId) {
                    const categoryData = await api.getCategoryById(caseData.categoryId);
                    setCategory(categoryData);
                }

                const allFiles = await api.getCaseFiles();
                setFiles(allFiles.filter(f => f.caseId === Number(caseId)));

            } catch (e: any) {
                setError("Failed to load case details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [caseId]);

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!caseItem) return <p>Case not found.</p>;

    return (
        <div>
            <Link to="/app/cases" className="text-accent hover:underline mb-6 inline-block">&larr; Back to all cases</Link>
            <h1 className="text-4xl font-bold text-primary mb-2">{caseItem.caseName}</h1>
            <p className="text-secondary mb-8">Details for case ID: {caseItem.id}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-2xl font-semibold mb-4">Case Information</h2>
                        <div className="space-y-3 text-primary">
                            <p><strong className="text-secondary">Description:</strong> {caseItem.caseDescription}</p>
                            <p><strong className="text-secondary">Status:</strong> <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">{caseItem.status}</span></p>
                            <p><strong className="text-secondary">Court:</strong> {caseItem.courtName}</p>
                            <p><strong className="text-secondary">Location:</strong> {caseItem.location}</p>
                            <p><strong className="text-secondary">Category:</strong> {category?.name || 'N/A'}</p>
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-2xl font-semibold mb-4">Case Files</h2>
                        {files.length > 0 ? (
                            <ul className="space-y-3">
                                {files.map(file => (
                                    <li key={file.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                                        <span className="text-primary">{file.fileName}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { setPreviewFile(file); setIsPreviewOpen(true); }} className="p-2 text-secondary hover:text-primary hover:bg-border rounded-full transition-colors"><EyeIcon /></button>
                                            <a href={`${BASE_URL}/casefiles/download/${file.caseId}/${file.fileName}`} download target="_blank" rel="noopener noreferrer" className="p-2 text-secondary hover:text-primary hover:bg-border rounded-full transition-colors"><DownloadIcon /></a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-secondary">No files associated with this case.</p>}
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-2xl font-semibold mb-4">Metadata</h2>
                        <div className="space-y-3 text-primary">
                           <p><strong className="text-secondary">Created:</strong> {new Date(caseItem.createdAt).toLocaleString()}</p>
                           <p><strong className="text-secondary">Last Updated:</strong> {new Date(caseItem.updatedAt).toLocaleString()}</p>
                        </div>
                    </Card>
                </div>
            </div>
            {previewFile && (
                <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={`Preview: ${previewFile.fileName}`}>
                    <div className="w-full h-[70vh]">
                       <iframe src={`${BASE_URL}/casefiles/preview/${previewFile.caseId}/${previewFile.fileName}`} width="100%" height="100%" title={previewFile.fileName}></iframe>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const CaseList: React.FC = () => {
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ search: '', category: 'all', date: '' });
    const { isAdmin } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<CaseResponse | null>(null);

    const fetchCasesAndCategories = useCallback(async () => {
        try {
            setLoading(true);
            const [casesData, categoriesData] = await Promise.all([api.getCases(), api.getCategories()]);
            setCases(casesData.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            setCategories(categoriesData);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCasesAndCategories();
    }, [fetchCasesAndCategories]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOpenModal = (caseItem: CaseResponse | null = null) => {
        setEditingCase(caseItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCase(null);
    };

    const handleFormSubmit = async (data: CaseRequest) => {
        try {
            if (editingCase) {
                await api.updateCase(editingCase.id, data);
            } else {
                await api.createCase(data);
            }
            handleCloseModal();
            fetchCasesAndCategories();
        } catch (err: any) {
            setError(err.message || 'Failed to save case.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this case?')) {
            try {
                await api.deleteCase(id);
                fetchCasesAndCategories();
            } catch (err: any) {
                setError(err.message || 'Failed to delete case.');
            }
        }
    };

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = c.caseName.toLowerCase().includes(searchLower) || c.courtName.toLowerCase().includes(searchLower);
            const matchesCategory = filters.category === 'all' || c.categoryId === Number(filters.category);
            const matchesDate = !filters.date || new Date(c.updatedAt) >= new Date(filters.date);
            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [cases, filters]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Manage Cases</h1>
                 {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon /> Add New Case</Button>}
            </div>

            <Card className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="search" placeholder="Search by name or court..." value={filters.search} onChange={handleFilterChange} />
                    <Select name="category" value={filters.category} onChange={handleFilterChange}>
                        <option value="all">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </Select>
                    <Input name="date" type="date" value={filters.date} onChange={handleFilterChange} />
                </div>
            </Card>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCases.map(caseItem => (
                        <Card key={caseItem.id} className="flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-semibold text-primary mb-2 pr-2">{caseItem.caseName}</h2>
                                    {isAdmin && (
                                        <div className="flex-shrink-0 flex items-center gap-1">
                                            <button onClick={() => handleOpenModal(caseItem)} className="p-1 text-secondary hover:text-primary"><EditIcon /></button>
                                            <button onClick={() => handleDelete(caseItem.id)} className="p-1 text-secondary hover:text-red-500"><DeleteIcon /></button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-secondary text-sm mb-1">{categories.find(c => c.id === caseItem.categoryId)?.name || 'N/A'}</p>
                                <p className="text-secondary text-sm mb-4">Court: {caseItem.courtName}</p>
                                <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">{caseItem.status}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                <p className="text-xs text-secondary">Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}</p>
                                <Link to={`/app/cases/${caseItem.id}`} className="text-accent font-semibold hover:underline">View Details</Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCase ? 'Edit Case' : 'Add New Case'}>
                <CaseForm
                    initialData={editingCase}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

const CasesPage: React.FC = () => {
    const { caseId } = useParams<{ caseId?: string }>();
    return caseId ? <CaseDetail caseId={caseId} /> : <CaseList />;
};

export default CasesPage;