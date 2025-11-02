import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { CaseResponse, CaseRequest, CategoryResponse, CaseFileResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Textarea, Select, Spinner, PlusIcon, EditIcon, DeleteIcon, Label, Card, DownloadIcon, EyeIcon } from '../components/ui';

const BASE_URL = 'http://localhost:8080/legal-case-management/api';

const CaseForm: React.FC<{
    initialData: CaseResponse | null;
    categories: CategoryResponse[];
    onSubmit: (data: CaseRequest, newFiles: File[]) => void;
    onCancel: () => void;
}> = ({ initialData, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CaseRequest>({
        caseName: initialData?.caseName || '',
        caseDescription: initialData?.caseDescription || '',
        status: initialData?.status || 'OPEN',
        courtName: initialData?.courtName || '',
        location: initialData?.location || '',
        categoryId: initialData?.categoryId || categories[0]?.id || undefined,
    });
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<CaseFileResponse[]>([]);
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (initialData?.id) {
            const fetchFiles = async () => {
                try {
                    const allFiles = await api.getCaseFiles();
                    setExistingFiles(allFiles.filter(f => f.caseId === initialData.id));
                } catch (error) {
                    console.error("Failed to fetch existing files for case", error);
                }
            };
            fetchFiles();
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'categoryId' ? Number(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        if (e.target.files) {
            const addedFiles = Array.from(e.target.files);
            const pdfFiles = addedFiles.filter(file => file.type === 'application/pdf');
            if (pdfFiles.length !== addedFiles.length) {
                setFileError('Only PDF files are allowed.');
            }
            setNewFiles(prev => [...prev, ...pdfFiles]);
        }
    };
    
    const handleRemoveNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingFile = async (fileId: number) => {
        if (window.confirm('Are you sure you want to permanently delete this file?')) {
            try {
                await api.deleteCaseFile(fileId);
                setExistingFiles(prev => prev.filter(f => f.id !== fileId));
            } catch (error) {
                alert('Failed to delete file.');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, newFiles);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="caseName">Case Name</Label>
                    <Input id="caseName" name="caseName" value={formData.caseName} onChange={handleChange} required />
                </div>
                 <div>
                    <Label htmlFor="status">Status</Label>
                    <Input id="status" name="status" value={formData.status || ''} onChange={handleChange} required />
                </div>
                 <div>
                    <Label htmlFor="courtName">Court Name</Label>
                    <Input id="courtName" name="courtName" value={formData.courtName || ''} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </Select>
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="caseDescription">Description</Label>
                    <Textarea id="caseDescription" name="caseDescription" value={formData.caseDescription || ''} onChange={handleChange} rows={4} />
                </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
                <Label>Case Files</Label>
                 {existingFiles.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-secondary">Existing Files:</p>
                        <ul className="space-y-2">
                            {existingFiles.map(file => (
                                <li key={file.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md">
                                    <span>{file.fileName}</span>
                                    <button type="button" onClick={() => handleDeleteExistingFile(file.id)} className="text-red-500 hover:text-red-700 font-semibold">&times;</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div>
                     <Label htmlFor="files" className="text-sm font-medium text-secondary">Add New Files (PDF only):</Label>
                     <Input id="files" type="file" multiple accept=".pdf" onChange={handleFileChange} />
                     {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
                </div>
                {newFiles.length > 0 && (
                    <ul className="space-y-2">
                        {newFiles.map((file, index) => (
                             <li key={index} className="flex justify-between items-center text-sm p-2 bg-background rounded-md">
                                <span>{file.name}</span>
                                <button type="button" onClick={() => handleRemoveNewFile(index)} className="text-red-500 hover:text-red-700 font-semibold">&times;</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const token = localStorage.getItem('authToken');

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

    const handlePreview = async (file: CaseFileResponse) => {
        try {
            const response = await fetch(`${BASE_URL}/casefiles/preview/${file.caseId}/${file.fileName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to preview file');
            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            setPreviewUrl(url);
            setPreviewFile(file);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error(error);
            alert('Error previewing file');
        }
    };
    
    const handleClosePreview = () => {
        if(previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setIsPreviewOpen(false);
        setPreviewUrl(null);
        setPreviewFile(null);
    }

    const handleDownload = async (file: CaseFileResponse) => {
        try {
            const response = await fetch(`${BASE_URL}/casefiles/download/${file.caseId}/${file.fileName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert('Error downloading file');
        }
    };

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
                                            <button onClick={() => handlePreview(file)} className="p-2 text-secondary hover:text-primary hover:bg-border rounded-full transition-colors"><EyeIcon /></button>
                                            <button onClick={() => handleDownload(file)} className="p-2 text-secondary hover:text-primary hover:bg-border rounded-full transition-colors"><DownloadIcon /></button>
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

            {isPreviewOpen && previewFile && (
                <Modal isOpen={isPreviewOpen} onClose={handleClosePreview} title={`Preview: ${previewFile.fileName}`} >
                    <div className="w-full h-[75vh]">
                        {previewUrl ? (
                            <iframe src={previewUrl} className="w-full h-full rounded-lg border" title={previewFile.fileName}></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full"><Spinner /></div>
                        )}
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
    const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all' });
    const { isAdmin, user } = useAuth();
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

    const handleFormSubmit = async (data: CaseRequest, newFiles: File[]) => {
        try {
            let caseId: number;
            if (editingCase) {
                const updatedCase = await api.updateCase(editingCase.id, data);
                caseId = updatedCase.id;
            } else {
                const newCase = await api.createCase(data);
                caseId = newCase.id;
            }

            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('caseId', caseId.toString());
                    formData.append('fileName', file.name);
                    formData.append('filePath', `/files/${caseId}`);
                    formData.append('fileType', 'pdf');
                     if (user?.userId) {
                        formData.append('uploadedBy', user.userId.toString());
                    }
                    return api.createCaseFile(formData);
                });
                await Promise.all(uploadPromises);
            }
            handleCloseModal();
            fetchCasesAndCategories();
        } catch (err: any) {
            setError(err.message || 'Failed to save case.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
            try {
                await api.deleteCase(id);
                fetchCasesAndCategories();
            } catch (err: any) {
                setError(err.message || 'Failed to delete case.');
            }
        }
    };

    const uniqueStatuses = useMemo(() => {
        const statuses = new Set(cases.map(c => c.status));
        return Array.from(statuses);
    }, [cases]);

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = c.caseName.toLowerCase().includes(searchLower) || c.courtName.toLowerCase().includes(searchLower);
            const matchesCategory = filters.category === 'all' || c.categoryId === Number(filters.category);
            const matchesStatus = filters.status === 'all' || c.status === filters.status;
            return matchesSearch && matchesCategory && matchesStatus;
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
                    <Select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="all">All Statuses</option>
                        {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </Select>
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