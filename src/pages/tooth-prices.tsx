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

export const getServerSideProps = withAuth();

export default function ToothPrices() {
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

    // Fetch tooth values from the server
    const fetchToothValues = async () => {
        try {
            const response = await fetch('/api/user/get_tooth_values', {
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
        }
    };


    useEffect(() => {
        fetchToothValues();
    }, []);

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
                body: JSON.stringify({ toothData }),
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
            fetchToothValues();
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
            fetchToothValues();
        }
    };



    return (
        <>
            <Topbar />
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
        </>
    );
}
