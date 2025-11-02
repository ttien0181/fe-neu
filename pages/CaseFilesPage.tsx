import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { CaseFileResponse, CaseFileRequest, CaseResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Select, Spinner, PlusIcon, DeleteIcon, Label, Input, EditIcon, Card } from '../components/ui';

// Form for ADDING a new file (includes file upload)
const CaseFileAddForm: React.FC<{
  cases: CaseResponse[];
  onSubmit: (data: CaseFileRequest, file: File) => void;
  onCancel: () => void;
}> = ({ cases, onSubmit, onCancel }) => {
    const [caseId, setCaseId] = useState<string>(cases[0]?.id.toString() || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
            } else {
                setFileError('Only PDF files are allowed.');
                e.target.value = '';
                setSelectedFile(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setFileError('Please select a file.');
            return;
        }
        if (!caseId) {
            return;
        }
        const requestData: CaseFileRequest = {
            caseId: Number(caseId),
            fileName: selectedFile.name,
            filePath: `/files/${caseId}`,
            fileType: 'pdf'
        };
        onSubmit(requestData, selectedFile);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="caseId">Case</Label>
                <Select id="caseId" name="caseId" value={caseId} onChange={(e) => setCaseId(e.target.value)} required disabled={cases.length === 0}>
                    {cases.length > 0 ? (
                        cases.map(c => <option key={c.id} value={c.id}>{c.caseName}</option>)
                    ) : (
                        <option>No cases available</option>
                    )}
                </Select>
            </div>
            <div>
                <Label htmlFor="file">PDF File</Label>
                <Input id="file" name="file" type="file" accept=".pdf" onChange={handleFileChange} required />
                {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={!caseId || cases.length === 0}>Add File</Button>
            </div>
        </form>
    );
};

// Form for EDITING file metadata
const CaseFileEditForm: React.FC<{
  initialData: CaseFileResponse;
  cases: CaseResponse[];
  onSubmit: (data: Partial<CaseFileRequest>) => void;
  onCancel: () => void;
}> = ({ initialData, cases, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        fileName: initialData.fileName,
        caseId: initialData.caseId.toString()
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            fileName: formData.fileName,
            caseId: Number(formData.caseId)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="fileName">File Name</Label>
                <Input id="fileName" name="fileName" value={formData.fileName} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="caseId">Case</Label>
                <Select id="caseId" name="caseId" value={formData.caseId} onChange={handleChange} required>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.caseName}</option>)}
                </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
};


const CaseFilesPage: React.FC = () => {
    const [files, setFiles] = useState<CaseFileResponse[]>([]);
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<CaseFileResponse | null>(null);
    const { isAdmin, user } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [filesData, casesData] = await Promise.all([api.getCaseFiles(), api.getCases()]);
            setFiles(filesData);
            setCases(casesData);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch case files.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (file: CaseFileResponse | null = null) => {
        setEditingFile(file);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFile(null);
    };

    const handleAddSubmit = async (data: CaseFileRequest, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', data.caseId.toString());
            formData.append('fileName', data.fileName);
            formData.append('filePath', data.filePath);
            formData.append('fileType', data.fileType);
            if (user?.userId) {
                formData.append('uploadedBy', user.userId.toString());
            }

            await api.createCaseFile(formData);
            handleCloseModal();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to add file record.');
        }
    };

    const handleEditSubmit = async (data: Partial<CaseFileRequest>) => {
        if (!editingFile || !user) return;
        try {
            const updatedFile = await api.updateCaseFile(editingFile.id, data);
            
            await api.createAuditLog({
                userId: user.userId,
                action: `UPDATE_FILE: User updated file '${updatedFile.fileName}'`,
                fileId: updatedFile.id,
                caseId: updatedFile.caseId,
            });

            handleCloseModal();
            fetchData();
        } catch (err: any) {
             setError(err.message || 'Failed to update file record.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this file record?')) {
            try {
                await api.deleteCaseFile(id);
                fetchData();
            } catch (err: any) {
                setError(err.message || 'Failed to delete file record.');
            }
        }
    };
    
    const getCaseName = (caseId: number) => cases.find(c => c.id === caseId)?.caseName || 'Unknown Case';

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Manage Case Files</h1>
                {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon/> Add New File</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <Card className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider border-b-2 border-border">File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider border-b-2 border-border">Associated Case</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider border-b-2 border-border">Path</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider border-b-2 border-border">Type</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider border-b-2 border-border">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {files.map(file => (
                                <tr key={file.id} className="hover:bg-background">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{file.fileName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{getCaseName(file.caseId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{file.filePath}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{file.fileType}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenModal(file)} className="p-1 text-secondary hover:text-accent"><EditIcon/></button>
                                            <button onClick={() => handleDelete(file.id)} className="p-1 text-secondary hover:text-red-500"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                             {files.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-secondary">No files found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFile ? 'Edit Case File' : 'Add New Case File'}>
               {editingFile ? (
                   <CaseFileEditForm 
                        initialData={editingFile}
                        cases={cases}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCloseModal}
                   />
               ) : (
                   <CaseFileAddForm
                        cases={cases}
                        onSubmit={handleAddSubmit}
                        onCancel={handleCloseModal}
                    />
               )}
            </Modal>
        </div>
    );
};

export default CaseFilesPage;