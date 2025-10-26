
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { CaseFileResponse, CaseFileRequest, CaseResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Select, Spinner, PlusIcon, DeleteIcon, Label, Input } from '../components/ui';

const CaseFileForm: React.FC<{
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
            // This should not happen if cases exist
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


const CaseFilesPage: React.FC = () => {
    const [files, setFiles] = useState<CaseFileResponse[]>([]);
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAdmin } = useAuth();

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

    const handleCloseModal = () => setIsModalOpen(false);

    const handleFormSubmit = async (data: CaseFileRequest, file: File) => {
        // NOTE: The current API spec does not handle file uploads, only metadata.
        // This function will send the metadata as per the spec.
        try {
            await api.createCaseFile(data);
            // In a real app, you would upload the `file` object here.
            handleCloseModal();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to add file record.');
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
                <h1 className="text-3xl font-bold text-white">Manage Case Files</h1>
                {isAdmin && <Button onClick={() => setIsModalOpen(true)}><PlusIcon/> Add New File</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Associated Case</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Path</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {files.map(file => (
                                <tr key={file.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{file.fileName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCaseName(file.caseId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{file.filePath}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{file.fileType}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(file.id)} className="text-red-500 hover:text-red-400"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Case File">
                <CaseFileForm
                    cases={cases}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default CaseFilesPage;
