import React, { useState, useEffect } from 'react';
import Parallax from 'react-parallax-tilt';
import { useTheme } from '@mui/material/styles';
import Topbar from '../components/Topbar';
import { withAuth } from '../utils/withAuth';

export const getServerSideProps = withAuth();

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
interface Tooth {
    insuredPrice: number;
    outOfNetworkPrice: number;
}

// Define the structure for the toothData state
interface ToothData {
    [key: string]: Tooth;
}


const CopayCalculator = () => {



    const [displayResults, setDisplayResults] = useState({
        uninsuredCost: 0,
        inNetworkCopay: 0,
        insurancePay: 0,
        outNetworkCopay: 0,
    });
    const theme = useTheme();
    //const [toothTypes, setToothTypes] = useState([]);
    const [benefitsRemaining, setBenefitsRemaining] = useState('');
    const [contractedFeePercentage, setContractedFeePercentage] = useState('');
    const [deductible, setDeductible] = useState('');
    const [isDeductibleUsed, setIsDeductibleUsed] = useState('No');


    const [toothData, setToothData] = useState<ToothData>({});
    const [selectedTooth, setSelectedTooth] = useState<string>('');

    // State variables
    const [isPatientInsured, setIsPatientInsured] = useState(true); // B16
    const [insuranceContributionRate, setInsuranceContributionRate] = useState(0.5); // B14
    const [insuranceCap, setInsuranceCap] = useState(1000); // B13
    const [isInsuranceCapped, setIsInsuranceCapped] = useState(false); // B18
    const [patientDeductible, setPatientDeductible] = useState(50); // B15
    const [patientCopayAdditional, setPatientCopayAdditional] = useState(0); // B21
    const [toothTypes, setToothTypes] = useState<string[]>([]); // Update the type of toothTypes state to string[]

    useEffect(() => {
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
                const fetchedToothData = result.toothData;

                const formattedToothData: ToothData = {};
                let localToothTypes: string[] = []; // Temporary array to store tooth types
                Object.keys(fetchedToothData).forEach(key => {
                    // Regular tooth type
                    formattedToothData[key] = {
                        insuredPrice: fetchedToothData[key][0],
                        outOfNetworkPrice: fetchedToothData[key][2],
                    };
                    localToothTypes.push(key); // Add regular type

                    // Retreatment tooth type
                    formattedToothData[key + ' Retreatment'] = {
                        insuredPrice: fetchedToothData[key][1],
                        outOfNetworkPrice: fetchedToothData[key][3],
                    };
                    localToothTypes.push(key + ' Retreatment'); // Add retreatment type
                });

                setToothData(formattedToothData);

                // Set the tooth types array
                setToothTypes(localToothTypes); // Here we update the toothTypes array
                // Set the default tooth type to the first in the list
                if (localToothTypes.length > 0) {
                    setSelectedTooth(localToothTypes[0]);
                }
            } catch (error) {
                console.error('Error fetching tooth values:', error);
            }
        };

        fetchToothValues();
    }, []);


    useEffect(() => {
        // Another `useEffect` for handling calculations after data fetch
        if (Object.keys(toothData).length > 0 && selectedTooth) {
            handleCalculate();
        }
    }, [selectedTooth, benefitsRemaining, contractedFeePercentage, deductible, isDeductibleUsed, toothData]);

    const handleCalculate = () => {
        // Only proceed if toothData has been loaded and a tooth is selected
        if (selectedTooth && toothData[selectedTooth]) {
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
        }
    };



    // Calculations
    const calculateUninsuredCost = () => {
        // Make sure selectedTooth is not an empty string
        if (selectedTooth && toothData[selectedTooth]) {
            return toothData[selectedTooth].insuredPrice;
        }
        return 0; // Return 0 or a default value if no tooth is selected
    };

    const calculateInNetworkCopay = () => {
        // Parse values to ensure they are numbers

        const uninsuredCost = toothData[selectedTooth].insuredPrice;
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
            const uninsuredCost = toothData[selectedTooth].insuredPrice;

            const patientCopayInNetowrk = calculateInNetworkCopay();
            // should be ?
            //const deductibleAmount = parseFloat(deductible);
            return uninsuredCost + 50 - patientCopayInNetowrk;
        }

        const uninsuredCost = toothData[selectedTooth].insuredPrice;
        const patientCopayInNetowrk = calculateInNetworkCopay();
        return uninsuredCost - patientCopayInNetowrk;



    };

    const calculateOutNetworkCopay = () => {
        const insuredCost = toothData[selectedTooth].insuredPrice; // Uninsured cost for the selected tooth
        const outNetworkCost = toothData[selectedTooth].outOfNetworkPrice; // Out of network cost for the selected tooth
        // Calculate the out of network copay
        let outNetworkCopay = outNetworkCost - insuredCost + calculateInNetworkCopay();
        return outNetworkCopay;
    };


    return (
        <>
            <Topbar />

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
                                        onChange={(e) => setSelectedTooth(e.target.value as string)}
                                    >
                                        {toothTypes.map((toothType) => (
                                            <MenuItem key={toothType} value={toothType}>
                                                {toothType}
                                            </MenuItem>
                                        ))}
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
                        <Grid key={index} item xs={12} sm={6} md={3} style={{ justifyContent: 'center' }}>
                            <Parallax tiltMaxAngleX={5} tiltMaxAngleY={5}>
                                <Card style={{
                                    maxWidth: '100%', // Maximum width is 100% of its parent container
                                    height: '400px', // Height is automatic based on its content
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.common.white,
                                    margin: 'auto', // Center the card in its grid cell
                                }}>
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
        </>
    );
};

export default CopayCalculator;
