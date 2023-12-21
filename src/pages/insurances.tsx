// pages/insurance-form.tsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Button,
    Card,
    CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Topbar from '../components/Topbar';
import { withAuth } from '../utils/withAuth';

export const getServerSideProps = withAuth();

interface InsuranceEntry {
    id: string;
    name: string;
    website: string;
    phone: string;
    username: string;
    password: string;
}
const websitePattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
const isValidWebsite = (website: string): boolean => websitePattern.test(website);

export default function InsuranceForm() {


    const [insuranceEntries, setInsuranceEntries] = useState<InsuranceEntry[]>([]);
    const [newInsurance, setNewInsurance] = useState({
        name: '',
        website: '',
        phone: '',
        username: '',
        password: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({
        id: '',
        name: '',
        website: '',
        phone: '',
        username: '',
        password: ''
    });

    // Start editing an insurance entry
    const startEdit = (insurance: InsuranceEntry) => {
        setEditingId(insurance.id);
        setEditFormData({ ...insurance });
    };

    // Cancel editing an insurance entry
    const cancelEdit = () => {
        setEditingId(null);
    };

    // Save edits to an insurance entry
    const saveEdit = () => {
        if (editFormData.name.trim() !== '' && isValidWebsite(editFormData.website)) {
            const updatedEntries = insuranceEntries.map((entry) =>
                entry.id === editFormData.id ? { ...editFormData } : entry
            );
            handleInsuranceRequest(editFormData, true); // true for update
            setInsuranceEntries(updatedEntries);
            setEditingId(null);
        } else {
            alert('Please enter a valid website.');
        }
    };





    const handleRemoveInsurance = async (id: string) => {
        try {
            const response = await fetch('/api/user/update_insurance', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ insuranceId: id }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Insurance deleted successfully:', result);

            // Update state to reflect the deletion
            const updatedEntries = insuranceEntries.filter((entry) => entry.id !== id);
            setInsuranceEntries(updatedEntries);

        } catch (error) {
            console.error('Error deleting insurance entry:', error);
        }
    };

    // Update the handleAddInsurance function to include website validation
    const handleAddInsurance = () => {
        if (newInsurance.name.trim() !== '' && isValidWebsite(newInsurance.website)) {
            const id = new Date().getTime().toString(); // Generate a unique ID for the entry
            const newEntry = { ...newInsurance, id };
            setInsuranceEntries([...insuranceEntries, newEntry]);
            handleInsuranceRequest(newEntry as InsuranceEntry, false); // false for add

            setNewInsurance({
                name: '',
                website: '',
                phone: '',
                username: '',
                password: ''
            });
            console.log('New insurance entry added:', newEntry);
        } else {
            alert('Please enter a valid website.');
        }
    };
    // Check if the required fields for adding a new insurance are filled
    const canAddInsurance = newInsurance.name.trim() !== '' && isValidWebsite(newInsurance.website);


    const convertEntryToJsonFormat = (entry: InsuranceEntry): Record<string, any> => {
        const formattedData: Record<string, any> = {};
        console.log('Converting entry to JSON format:', entry);
        formattedData[entry.name] = {
            website: entry.website,
            phone_number: entry.phone,
            username: entry.username,
            password: entry.password
        };

        return formattedData;
    };


    const loadDataFromJson = (insurances: InsuranceEntry[]) => {
        // Since the data is already in the correct format, we can set it directly
        setInsuranceEntries(insurances);
    };


    const handleInsuranceRequest = async (insurance: InsuranceEntry, isUpdate: boolean) => {
        try {
            const url = '/api/user/update_insurance';
            const method = isUpdate ? 'PUT' : 'POST';
            insurance = convertEntryToJsonFormat(insurance) as InsuranceEntry;
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify(insurance),
                credentials: 'include', // To include cookies in the request
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Insurance entry ${isUpdate ? 'updated' : 'added'} successfully:`, result);
        } catch (error) {
            console.error(`Error ${isUpdate ? 'updating' : 'adding'} insurance entry:`, error);
        }
    };

    const fetchInsurances = async () => {
        try {
            const response = await fetch('/api/user/get_insurance', {
                method: 'GET',
                credentials: 'include', // to include cookies in the request (if your auth relies on it)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.insurances) {
                console.log('Insurance records loaded successfully:', data.insurances);
                // Pass the array of insurance records to the loadDataFromJson function
                loadDataFromJson(data.insurances);
            }
        } catch (error) {
            console.error('Error fetching insurance records:', error);
        }
    };

    // Load insurance records when the component mounts
    useEffect(() => {
        fetchInsurances();
    }, []);



    return (
        <>
            <Topbar />
            <Card>
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table aria-label="insurance table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Insurance Name</TableCell>
                                    <TableCell align="left">Website</TableCell>
                                    <TableCell align="left">Phone Number</TableCell>
                                    <TableCell align="left">Username</TableCell>
                                    <TableCell align="left">Password</TableCell>
                                    <TableCell align="left">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {insuranceEntries.map((insurance) => (
                                    <TableRow key={insurance.id}>
                                        {editingId === insurance.id ? (
                                            // Editable fields
                                            <>
                                                <TableCell component="th" scope="row">
                                                    <TextField
                                                        fullWidth
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                    />
                                                </TableCell>

                                                <TableCell align="left">
                                                    {editingId === insurance.id ? (
                                                        <TextField
                                                            fullWidth
                                                            value={editFormData.website}
                                                            onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                                                            error={!isValidWebsite(editFormData.website) && editFormData.website !== ''}
                                                            helperText={!isValidWebsite(editFormData.website) && editFormData.website !== '' ? "The website is not a valid URL." : ""}
                                                        />
                                                    ) : (
                                                        <a href={insurance.website.startsWith('http') ? insurance.website : `http://${insurance.website}`} target="_blank" rel="noopener noreferrer">
                                                            {insurance.website}
                                                        </a>
                                                    )}
                                                </TableCell>
                                                <TableCell align="left">
                                                    <TextField
                                                        fullWidth
                                                        value={editFormData.phone}
                                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell align="left">
                                                    <TextField
                                                        fullWidth
                                                        value={editFormData.username}
                                                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell align="left">
                                                    <TextField
                                                        fullWidth
                                                        type="password"
                                                        value={editFormData.password}
                                                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell align="left">
                                                    <IconButton onClick={saveEdit}>
                                                        <SaveIcon />
                                                    </IconButton>
                                                    <IconButton onClick={cancelEdit}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </>
                                        ) : (
                                            // Display fields
                                            <>
                                                <TableCell component="th" scope="row">{insurance.name}</TableCell>
                                                <TableCell align="left">{insurance.website}</TableCell>
                                                <TableCell align="left">{insurance.phone}</TableCell>
                                                <TableCell align="left">{insurance.username}</TableCell>
                                                <TableCell align="left">{insurance.password}</TableCell>
                                                <TableCell align="left">
                                                    <IconButton onClick={() => startEdit(insurance)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleRemoveInsurance(insurance.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                                {/* New Insurance Entry */}
                                <TableRow>
                                    <TableCell>
                                        <TextField
                                            label="Insurance Name"
                                            value={newInsurance.name}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, name: e.target.value })}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TextField
                                            label="Website"
                                            value={newInsurance.website}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, website: e.target.value })}
                                            error={!isValidWebsite(newInsurance.website) && newInsurance.website !== ''}
                                            helperText={!isValidWebsite(newInsurance.website) && newInsurance.website !== '' ? "The website is not a valid URL." : ""}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TextField
                                            label="Phone Number"
                                            value={newInsurance.phone}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, phone: e.target.value })}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TextField
                                            label="Username"
                                            value={newInsurance.username}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, username: e.target.value })}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TextField
                                            label="Password"
                                            type="password"
                                            value={newInsurance.password}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, password: e.target.value })}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <IconButton
                                            color="primary"
                                            aria-label="add insurance"
                                            component="span"
                                            onClick={handleAddInsurance}
                                            disabled={!canAddInsurance}
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </>
    );
}