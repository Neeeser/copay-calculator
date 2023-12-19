// pages/tooth-prices.tsx
import React, { useState } from 'react';
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
    CardContent,
    Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Topbar from '../components/Topbar';
import { withAuth } from '../utils/withAuth';

export const getServerSideProps = withAuth();

interface ToothEntry {
    id: number;
    name: string;
    price: number;
    retreatmentPrice: number;
}

export default function ToothPrices() {
    const [toothEntries, setToothEntries] = useState<ToothEntry[]>([]);
    const [newTooth, setNewTooth] = useState({ name: '', price: '', retreatmentPrice: '' });

    const isValidNumber = (value: string) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value));

    const canAdd = newTooth.name && isValidNumber(newTooth.price) && isValidNumber(newTooth.retreatmentPrice);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', price: '', retreatmentPrice: '' });

    const formatNumberInput = (value: string) => {
        // Return the value as is if it's empty or matches the numeric format
        if (value === '' || (/^\d*\.?\d{0,2}$/.test(value))) {
            return value;
        }
        // If the value is numeric but doesn't match the format (e.g., too many decimal places), format it
        if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
            return parseFloat(value).toFixed(2);
        }
        // If the value is not numeric, return an empty string
        return '';
    };

    const handleAddTooth = () => {
        if (canAdd) {
            const newEntry: ToothEntry = {
                id: toothEntries.length + 1,
                name: newTooth.name,
                price: parseFloat(newTooth.price),
                retreatmentPrice: parseFloat(newTooth.retreatmentPrice),
            };
            setToothEntries([...toothEntries, newEntry]);
            setNewTooth({ name: '', price: '', retreatmentPrice: '' }); // Reset input fields
        }
    };

    const handleRemoveTooth = (id: number) => {
        setToothEntries(toothEntries.filter(entry => entry.id !== id));
    };
    const startEdit = (row: ToothEntry) => {
        setEditingId(row.id);
        setEditFormData({ name: row.name, price: row.price.toString(), retreatmentPrice: row.retreatmentPrice.toString() });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };


    const saveEdit = (id: number) => {
        // Make sure the edited values are numbers before saving
        if (isValidNumber(editFormData.price) && isValidNumber(editFormData.retreatmentPrice)) {
            const updatedEntries = toothEntries.map(entry =>
                entry.id === id ? {
                    ...entry,
                    name: editFormData.name,
                    price: parseFloat(parseFloat(editFormData.price).toFixed(2)),
                    retreatmentPrice: parseFloat(parseFloat(editFormData.retreatmentPrice).toFixed(2))
                } : entry
            );
            setToothEntries(updatedEntries);
            setEditingId(null);
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
                                    <TableCell align="left">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {toothEntries.map((row) => (
                                    <TableRow key={row.id}>
                                        {editingId === row.id ? (
                                            <>
                                                {/* Editable Cells */}
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
                                                    <IconButton onClick={() => saveEdit(row.id)}>
                                                        <SaveIcon />
                                                    </IconButton>
                                                    <IconButton onClick={cancelEdit}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                {/* Read-Only Cells */}
                                                <TableCell component="th" scope="row">{row.name}</TableCell>
                                                <TableCell align="left">{`$${row.price.toFixed(2)}`}</TableCell>
                                                <TableCell align="left">{`$${row.retreatmentPrice.toFixed(2)}`}</TableCell>
                                                <TableCell align="left">
                                                    <IconButton onClick={() => startEdit(row)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleRemoveTooth(row.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell>
                                        <TextField label="Tooth Name" value={newTooth.name} onChange={(e) => setNewTooth({ ...newTooth, name: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TextField
                                            label="Price"
                                            value={newTooth.price}
                                            onChange={(e) => {
                                                if (isValidNumber(e.target.value) || e.target.value === '') {
                                                    setNewTooth({ ...newTooth, price: formatNumberInput(e.target.value) });
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TextField
                                            label="Retreatment Price"
                                            value={newTooth.retreatmentPrice}
                                            onChange={(e) => {
                                                if (isValidNumber(e.target.value) || e.target.value === '') {
                                                    setNewTooth({ ...newTooth, retreatmentPrice: formatNumberInput(e.target.value) });
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <Button
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={handleAddTooth}
                                            disabled={!canAdd}
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
