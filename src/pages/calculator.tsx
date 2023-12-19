import React, { useState, useEffect } from 'react';
import Parallax from 'react-parallax-tilt';

import {
    Card,
    FormControl,
    CardContent,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Box,
    Grid
} from '@mui/material';
import { calculatePatientCopayInNetwork } from '@/utils/calculations';

const CopayCalculator = () => {

    // Assumed values for illustration. Replace with actual values from your spreadsheet
    const procedureCosts = {
        Molar: 1259,
        Premolar: 1057,
        Anterior: 1015,
        MolarRetreatment: 1553,
        PremolarRetreatment: 1316,
        AnteriorRetreatment: 982,
    };
    const outOfNetworkCosts = {
        Molar: 1795,
        Premolar: 1695,
        Anterior: 1595,
        MolarRetreatment: 1925,
        PremolarRetreatment: 1795,
        AnteriorRetreatment: 1695,
    };

    const [displayResults, setDisplayResults] = useState({
        uninsuredCost: 0,
        inNetworkCopay: 0,
        insurancePay: 0,
        outNetworkCopay: 0,
    });


    const [selectedTooth, setSelectedTooth] = useState('Molar');
    const [benefitsRemaining, setBenefitsRemaining] = useState('');
    const [contractedFeePercentage, setContractedFeePercentage] = useState('');
    const [deductible, setDeductible] = useState('');
    const [isDeductibleUsed, setIsDeductibleUsed] = useState('No');

    // State variables
    const [isPatientInsured, setIsPatientInsured] = useState(true); // B16
    const [insuranceContributionRate, setInsuranceContributionRate] = useState(0.5); // B14
    const [insuranceCap, setInsuranceCap] = useState(1000); // B13
    const [isInsuranceCapped, setIsInsuranceCapped] = useState(false); // B18
    const [patientDeductible, setPatientDeductible] = useState(50); // B15
    const [patientCopayAdditional, setPatientCopayAdditional] = useState(0); // B21

    useEffect(() => {
        handleCalculate();
    }, [selectedTooth, benefitsRemaining, contractedFeePercentage, deductible, isDeductibleUsed]); // Add other dependencies if needed

    const handleCalculate = () => {
        const uninsuredCost = calculateUninsuredCost();
        const inNetworkCopay = calculateInNetworkCopay();
        const insurancePay = calculateInsurancePay();
        const outNetworkCopay = calculateOutNetworkCopay();

        setDisplayResults({
            uninsuredCost,
            inNetworkCopay,
            insurancePay,
            outNetworkCopay,
        });
    };


    // Calculations
    const calculateUninsuredCost = () => {
        return procedureCosts[selectedTooth as keyof typeof procedureCosts];
    };

    const calculateInNetworkCopay = () => {
        // Parse values to ensure they are numbers
        const uninsuredCost = procedureCosts[selectedTooth as keyof typeof procedureCosts];
        const coverageRate = parseFloat(contractedFeePercentage) / 100;
        const benefitsRemain = parseFloat(benefitsRemaining);
        const deductibleAmount = isDeductibleUsed === 'No' ? parseFloat(deductible) : 0;

        // Calculate the amount covered by insurance, capped at the benefits remaining
        let insuranceCoverage = Math.min(uninsuredCost * coverageRate, benefitsRemain);

        // Calculate the patient copay, subtracting insurance coverage from uninsured cost
        // and adding deductible if it hasn't been used
        let inNetworkCopay = uninsuredCost - insuranceCoverage + deductibleAmount;

        // If insurance coverage is greater than or equal to uninsured cost, no deductible is applied
        // as the insurance would cover everything up to the uninsured cost
        if (insuranceCoverage >= uninsuredCost) {
            inNetworkCopay = Math.max(0, uninsuredCost - insuranceCoverage);
        }

        return inNetworkCopay;
    };


    
    const calculateInsurancePay = () => {
        // Parse values to ensure they are numbers
        if (isDeductibleUsed === 'No') {
            const uninsuredCost = procedureCosts[selectedTooth as keyof typeof procedureCosts];
            const patientCopayInNetowrk = calculateInNetworkCopay();
            // should be ?
            //const deductibleAmount = parseFloat(deductible);
            return uninsuredCost + 50 - patientCopayInNetowrk;
        }

        const uninsuredCost = procedureCosts[selectedTooth as keyof typeof procedureCosts];
        const patientCopayInNetowrk = calculateInNetworkCopay();
        return uninsuredCost - patientCopayInNetowrk;



    };

    const calculateOutNetworkCopay = () => {
        const insuredCost = procedureCosts[selectedTooth as keyof typeof procedureCosts]; // Uninsured cost for the selected tooth
        const outNetworkCost = outOfNetworkCosts[selectedTooth as keyof typeof outOfNetworkCosts]; // Out of network cost for the selected tooth
        // Calculate the out of network copay
        let outNetworkCopay = outNetworkCost - insuredCost + calculateInNetworkCopay();
        return outNetworkCopay;
    };


    return (
        <Box p={4}>
            <Card>
                <Box p={4}>
                    <Typography variant="h4" gutterBottom>
                        Copay Calculator
                    </Typography>
                    <Grid container spacing={2}>
                        {/* Tooth Type Dropdown */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tooth Type</InputLabel>
                                <Select
                                    value={selectedTooth}
                                    label="Tooth Type"
                                    onChange={(e) => setSelectedTooth(e.target.value)}
                                >
                                    <MenuItem value="Molar">Molar</MenuItem>
                                    <MenuItem value="Premolar">Premolar</MenuItem>
                                    <MenuItem value="Anterior">Anterior</MenuItem>
                                    {/* ... other tooth types */}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Benefits Remaining Input */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Benefits Remaining ($)"
                                type="number"
                                fullWidth
                                value={benefitsRemaining}
                                onChange={(e) => setBenefitsRemaining(e.target.value)}
                            />
                        </Grid>

                        {/* Contracted Fee Percentage Input */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Contracted Fee (%)"
                                type="number"
                                fullWidth
                                value={contractedFeePercentage}
                                onChange={(e) => setContractedFeePercentage(e.target.value)}
                            />
                        </Grid>

                        {/* Deductible Input */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Deductible ($)"
                                type="number"
                                fullWidth
                                value={deductible}
                                onChange={(e) => setDeductible(e.target.value)}
                            />
                        </Grid>

                        {/* Deductible Already Used Dropdown */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Deductible Already Used</InputLabel>
                                <Select
                                    value={isDeductibleUsed}
                                    label="Deductible Already Used"
                                    onChange={(e) => setIsDeductibleUsed(e.target.value)}
                                >
                                    <MenuItem value="Yes">Yes</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Calculate Button */}
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={handleCalculate}>
                                Calculate
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </Card>

            {/* Results Display */}
            <Grid container spacing={3} component="div">
                <Grid item xs={12}>

                </Grid>
                {[
                    { title: 'Uninsured Cost', value: displayResults.uninsuredCost },
                    { title: 'Patient Copay (In Network)', value: displayResults.inNetworkCopay },
                    { title: 'Insurance Pay', value: displayResults.insurancePay },
                    { title: 'Patient Copay (Out of Network)', value: displayResults.outNetworkCopay },
                ].map((item, index) => (
                    <Grid key={index} item xs={12} sm={6} md={3} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Parallax tiltMaxAngleX={5} tiltMaxAngleY={5}>
                            <Card style={{ borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '250px', height: '200px' }}>
                                <CardContent>
                                    <Typography variant="h5" align="center">
                                        {item.title}
                                    </Typography>
                                    <Typography variant="h4" align="center" color="primary">
                                        ${isNaN(item.value) || item.value === null ? '0' : item.value.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Parallax>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CopayCalculator;
