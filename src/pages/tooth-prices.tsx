// pages/tooth-prices.tsx
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Topbar from '../components/Topbar';
import { withAuth } from '../utils/withAuth';
import { Select, MenuItem, FormControl, InputLabel, CardHeader } from '@mui/material';


// Adjusted ToothEntry to be a dictionary type
interface ToothEntry {
    [key: string]: {
        price: number; // Price
        retreatmentPrice: number; // Retreatment Price
        outOfNetworkPrice: number; // Out of Network
        outOfNetworkRetreatment: number; // Out of Network Retreatment
    };
}

interface ToothPrices {
    [key: string]: number[];
}
interface InsuranceInfo {
    id: string;
    name: string;
}
export const getServerSideProps = withAuth();

export default function ToothPrices() {

    // Update the insurances state to use the new interface
    const [insurances, setInsurances] = useState<InsuranceInfo[]>([]);
    const [selectedInsurance, setSelectedInsurance] = useState<string>(''); // For the name
    const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>(''); // For the id


    const [toothEntries, setToothEntries] = useState<ToothEntry>({});
    const [newTooth, setNewTooth] = useState({ name: '', price: '', retreatmentPrice: '', outOfNetworkPrice: '', outOfNetworkRetreatment: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        price: '',
        retreatmentPrice: '',
        outOfNetworkPrice: '', // Add Out of Network
        outOfNetworkRetreatment: '', // Add Out of Network Retreatment
    });

    // Helper function to check if a string is a valid number
    const isValidNumber = (value: string) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value));

    // Function to format number input
    const formatNumberInput = (value: string) => {
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            return value;
        }
        if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
            return parseFloat(value).toFixed(2);
        }
        return '';
    };

    const fetchInsurances = async () => {
        try {
            const response = await fetch('/api/user/get_insurance', {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const { insurances } = await response.json();
            setInsurances(insurances.map((insurance: { id: string; name: string; }) => ({
                id: insurance.id,
                name: insurance.name
            })));
            console.log('Fetched insurances:', insurances);

            if (insurances.length > 0) {
                // Set the selected insurance to the name of the first insurance
                setSelectedInsurance(insurances[0].name);
                // Also keep track of the selected insurance ID
                setSelectedInsuranceId(insurances[0].id);
            }
        } catch (error) {
            console.error('Error fetching insurance names:', error);
        }
    };

    useEffect(() => {
        fetchInsurances();
    }, []);

    // Whenever the selectedInsurance changes, update the selectedInsuranceId as well
    useEffect(() => {
        const selected = insurances.find(insurance => insurance.name === selectedInsurance);
        setSelectedInsuranceId(selected ? selected.id : '');
    }, [selectedInsurance, insurances]);


    // Fetch tooth values from the server
    const fetchToothValues = async (insuranceId: string) => {
        if (!insuranceId) {
            // If no insurance ID is provided, clear the tooth entries
            setToothEntries({});
            return;
        }
        try {
            const response = await fetch(`/api/user/get_tooth_values?insurance_id=${insuranceId}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            const data = result.toothData; // Access the toothData property of the response

            const entries: ToothEntry = {};
            Object.keys(data).forEach(key => {
                const [price, retreatmentPrice, outOfNetworkPrice, outOfNetworkRetreatment] = data[key];
                if (
                    typeof price === 'number' &&
                    typeof retreatmentPrice === 'number' &&
                    typeof outOfNetworkPrice === 'number' &&
                    typeof outOfNetworkRetreatment === 'number'
                ) {
                    entries[key] = { price, retreatmentPrice, outOfNetworkPrice, outOfNetworkRetreatment };
                } else {
                    console.warn(`Invalid price format for key: ${key}`);
                }
            });
            setToothEntries(entries);
        } catch (error) {
            console.error('Error fetching tooth values:', error);
            setToothEntries({});
        }
    };

    // Effect to fetch tooth values when the selected insurance changes
    useEffect(() => {
        // Call fetchToothValues with the selectedInsuranceId
        fetchToothValues(selectedInsuranceId);
    }, [selectedInsuranceId]); // Only re-run the effect if selectedInsuranceId changes

    // Transform the toothEntries to match the expected array format
    const transformToothEntries = (toothEntries: ToothEntry): ToothPrices => {
        const transformed: ToothPrices = {};
        Object.keys(toothEntries).forEach(toothName => {
            const prices = toothEntries[toothName];
            transformed[toothName] = [
                prices.price,
                prices.retreatmentPrice,
                prices.outOfNetworkPrice,
                prices.outOfNetworkRetreatment
            ];
        });
        return transformed;
    };


    // Update tooth values on the server
    const updateToothValues = async (toothEntries: ToothEntry) => {
        // Transform the entries into the array format
        const toothData = transformToothEntries(toothEntries);
        try {
            const response = await fetch('/api/user/update_tooth_values', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ toothData, insuranceId: selectedInsuranceId }), // Include insuranceId in the body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Updated tooth values:', responseData);
        } catch (error) {
            console.error('Error updating tooth values:', error);
        }
    };


    const canAddTooth = () => {
        return (
            newTooth.name.trim() !== '' &&
            isValidNumber(newTooth.price) &&
            isValidNumber(newTooth.retreatmentPrice) &&
            isValidNumber(newTooth.outOfNetworkPrice) &&
            isValidNumber(newTooth.outOfNetworkRetreatment)
        );
    };

    // Add a new tooth entry
    const handleAddTooth = async () => {
        // Check that all fields are filled in
        if (
            newTooth.name &&
            isValidNumber(newTooth.price) &&
            isValidNumber(newTooth.retreatmentPrice) &&
            isValidNumber(newTooth.outOfNetworkPrice) &&
            isValidNumber(newTooth.outOfNetworkRetreatment)
        ) {
            const newEntry = {
                price: parseFloat(newTooth.price),
                retreatmentPrice: parseFloat(newTooth.retreatmentPrice),
                outOfNetworkPrice: parseFloat(newTooth.outOfNetworkPrice),
                outOfNetworkRetreatment: parseFloat(newTooth.outOfNetworkRetreatment),
            };

            const updatedEntries = {
                ...toothEntries,
                [newTooth.name]: newEntry,
            };

            setToothEntries(updatedEntries);
            setNewTooth({ name: '', price: '', retreatmentPrice: '', outOfNetworkPrice: '', outOfNetworkRetreatment: '' });
            await updateToothValues(updatedEntries);
            fetchToothValues(selectedInsuranceId);
        } else {
            // Alert the user that all fields must be filled
            alert("Please fill in all fields before adding a new tooth.");
        }
    };


    // Remove a tooth entry
    const handleRemoveTooth = (toothName: string) => {
        const { [toothName]: _, ...remainingEntries } = toothEntries;
        setToothEntries(remainingEntries);
        updateToothValues(remainingEntries);
    };

    // Start editing a tooth entry
    const startEdit = (toothName: string, toothData: {
        price: number,
        retreatmentPrice: number,
        outOfNetworkPrice: number,
        outOfNetworkRetreatment: number,
    }) => {
        setEditingId(toothName);
        setEditFormData({
            name: toothName,
            price: toothData.price.toString(),
            retreatmentPrice: toothData.retreatmentPrice.toString(),
            outOfNetworkPrice: toothData.outOfNetworkPrice.toString(), // Include Out of Network
            outOfNetworkRetreatment: toothData.outOfNetworkRetreatment.toString(), // Include Out of Network Retreatment
        });
    };

    // Cancel editing a tooth entry
    const cancelEdit = () => {
        setEditingId(null);
    };

    // Save edits to a tooth entry
    const saveEdit = async () => {
        if (
            editFormData.name &&
            isValidNumber(editFormData.price) &&
            isValidNumber(editFormData.retreatmentPrice) &&
            isValidNumber(editFormData.outOfNetworkPrice) &&
            isValidNumber(editFormData.outOfNetworkRetreatment)
        ) {
            const updatedEntry = {
                price: parseFloat(editFormData.price),
                retreatmentPrice: parseFloat(editFormData.retreatmentPrice),
                outOfNetworkPrice: parseFloat(editFormData.outOfNetworkPrice),
                outOfNetworkRetreatment: parseFloat(editFormData.outOfNetworkRetreatment),
            };

            const updatedEntries = {
                ...toothEntries,
                [editFormData.name]: updatedEntry,
            };

            if (editingId !== editFormData.name) {
                // Remove the old entry if the name was changed
                if (editingId !== null) {
                    delete updatedEntries[editingId];
                }
            }

            setToothEntries(updatedEntries);
            setEditingId(null);
            await updateToothValues(updatedEntries);
            fetchToothValues(selectedInsuranceId);
        }
    };



    return (
        <>
            <Topbar />
            <Card>
                <CardHeader
                    title="Select Insurance"
                    subheader="Choose an insurance to view or edit tooth prices."
                />
                <CardContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="insurance-select-label">Insurance</InputLabel>
                        <Select
                            labelId="insurance-select-label"
                            id="insurance-select"
                            value={selectedInsurance}
                            label="Insurance"
                            onChange={(event) => {
                                const selectedName = event.target.value;
                                setSelectedInsurance(selectedName);
                                // Find the ID corresponding to the selected name and set it
                                const insurance = insurances.find(ins => ins.name === selectedName);
                                setSelectedInsuranceId(insurance ? insurance.id : '');
                            }}
                        >
                            {insurances.map((insurance) => (
                                <MenuItem key={insurance.id} value={insurance.name}>
                                    {insurance.name}
                                </MenuItem>
                            ))}
                        </Select>

                    </FormControl>
                </CardContent>
            </Card>
            {selectedInsurance && (
                <Card>
                    <CardContent>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tooth</TableCell>
                                        <TableCell align="left">Price</TableCell>
                                        <TableCell align="left">Retreatment Price</TableCell>
                                        <TableCell align="left">Out of Network</TableCell>
                                        <TableCell align="left">Out of Network Retreatment</TableCell>
                                        <TableCell align="left">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(toothEntries).map(([toothName, toothData]) => (
                                        <TableRow key={toothName}>
                                            {editingId === toothName ? (
                                                // Editable Cells
                                                <>
                                                    <TableCell component="th" scope="row">
                                                        <TextField
                                                            fullWidth
                                                            value={editFormData.name}
                                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        <TextField
                                                            fullWidth
                                                            value={editFormData.price}
                                                            onChange={(e) => setEditFormData({ ...editFormData, price: formatNumberInput(e.target.value) })}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        <TextField
                                                            fullWidth
                                                            value={editFormData.retreatmentPrice}
                                                            onChange={(e) => setEditFormData({ ...editFormData, retreatmentPrice: formatNumberInput(e.target.value) })}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        <TextField
                                                            fullWidth
                                                            value={editFormData.outOfNetworkPrice}
                                                            onChange={(e) => setEditFormData({ ...editFormData, outOfNetworkPrice: formatNumberInput(e.target.value) })}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        <TextField
                                                            fullWidth
                                                            value={editFormData.outOfNetworkRetreatment}
                                                            onChange={(e) => setEditFormData({ ...editFormData, outOfNetworkRetreatment: formatNumberInput(e.target.value) })}
                                                        />
                                                    </TableCell>

                                                    <TableCell align="left">
                                                        <IconButton onClick={() => saveEdit()}>
                                                            <SaveIcon />
                                                        </IconButton>
                                                        <IconButton onClick={cancelEdit}>
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                // Read-Only Cells
                                                <>
                                                    <TableCell component="th" scope="row">{toothName}</TableCell>
                                                    <TableCell align="left">{`$${toothData.price.toFixed(2)}`}</TableCell>
                                                    <TableCell align="left">{`$${toothData.retreatmentPrice.toFixed(2)}`}</TableCell>
                                                    <TableCell align="left">{`$${toothData.outOfNetworkPrice.toFixed(2)}`}</TableCell>
                                                    <TableCell align="left">{`$${toothData.outOfNetworkRetreatment.toFixed(2)}`}</TableCell>
                                                    <TableCell align="left">
                                                        <IconButton onClick={() => startEdit(toothName, toothData)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleRemoveTooth(toothName)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell>
                                            <TextField
                                                label="Tooth Name"
                                                value={newTooth.name}
                                                onChange={(e) => setNewTooth({ ...newTooth, name: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell align="left">
                                            <TextField
                                                label="Price"
                                                value={newTooth.price}
                                                onChange={(e) => setNewTooth({ ...newTooth, price: formatNumberInput(e.target.value) })}
                                            />
                                        </TableCell>
                                        <TableCell align="left">
                                            <TextField
                                                label="Retreatment Price"
                                                value={newTooth.retreatmentPrice}
                                                onChange={(e) => setNewTooth({ ...newTooth, retreatmentPrice: formatNumberInput(e.target.value) })}
                                            />
                                        </TableCell>
                                        <TableCell align="left">
                                            <TextField
                                                label="Out of Network"
                                                value={newTooth.outOfNetworkPrice}
                                                onChange={(e) => setNewTooth({ ...newTooth, outOfNetworkPrice: formatNumberInput(e.target.value) })}
                                            />
                                        </TableCell>
                                        <TableCell align="left">
                                            <TextField
                                                label="Out of Network Retreatment"
                                                value={newTooth.outOfNetworkRetreatment}
                                                onChange={(e) => setNewTooth({ ...newTooth, outOfNetworkRetreatment: formatNumberInput(e.target.value) })}
                                            />
                                        </TableCell>
                                        <TableCell align="left">
                                            <Button
                                                startIcon={<AddCircleOutlineIcon />}
                                                onClick={handleAddTooth}
                                                disabled={!canAddTooth()} // Button is disabled if canAddTooth is false
                                            >
                                                Add Tooth
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
