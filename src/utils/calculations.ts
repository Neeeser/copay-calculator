// src/utils/calculations.ts

export interface PatientInfo {
  toothType: string;
  benefitsRemaining: number;
  contractedFee: number; // This should be in decimal format (e.g., 80% as 0.8)
  deductible: number;
  deductibleAlreadyUsed: boolean;
  rolloverAmount: number;
  rolloverUsed: boolean;
}

export interface ProcedureCosts {
  molar: number;
  premolar: number;
  anterior: number;
  molarRetreatment: number;
  premolarRetreatment: number;
  anteriorRetreatment: number;
}

// Using let to allow reassignment
export let procedureCosts: ProcedureCosts = {
  molar: 1480,
  premolar: 1057,
  anterior: 1015,
  molarRetreatment: 1553,
  premolarRetreatment: 1316,
  anteriorRetreatment: 982 // Rounded from 981.65 for simplicity
};

export let outNetworkCosts: ProcedureCosts = {
  molar: 1795,
  premolar: 1695,
  anterior: 1595,
  molarRetreatment: 1925,
  premolarRetreatment: 1795,
  anteriorRetreatment: 1695
};

// Function to update procedure costs
export function updateProcedureCosts(newCosts: ProcedureCosts): void {
  procedureCosts = newCosts;
}

// Function to update out-of-network costs
export function updateOutNetworkCosts(newCosts: ProcedureCosts): void {
  outNetworkCosts = newCosts;
}


export function getUninsuredCost(toothType: string): number {
  return procedureCosts[toothType as keyof ProcedureCosts] || 0;
}

export function calculateInsurancePay(patientInfo: PatientInfo, uninsuredCost: number): number {
  if (!patientInfo.deductibleAlreadyUsed) {
    return uninsuredCost + patientInfo.deductible;
  }
  return uninsuredCost;
}

export function calculatePatientCopayInNetwork(patientInfo: PatientInfo, uninsuredCost: number): number {
  const baseCopay = uninsuredCost * (1 - patientInfo.contractedFee);
  const benefitsApplied = patientInfo.rolloverUsed ? patientInfo.rolloverAmount + patientInfo.benefitsRemaining : patientInfo.benefitsRemaining;
  const deductibleAdjustment = patientInfo.deductibleAlreadyUsed ? 0 : patientInfo.deductible;

  if (baseCopay < benefitsApplied) {
    return baseCopay + deductibleAdjustment;
  } else if (baseCopay > benefitsApplied) {
    return uninsuredCost - benefitsApplied + deductibleAdjustment;
  } else {
    return uninsuredCost - (benefitsApplied + patientInfo.rolloverAmount) + deductibleAdjustment;
  }
}

export function calculatePatientCopayOutNetwork(patientInfo: PatientInfo, uninsuredCost: number, inNetworkCopay: number): number {
  const outNetworkCosts: ProcedureCosts = {
    molar: 1795,
    premolar: 1695,
    anterior: 1595,
    molarRetreatment: 1925,
    premolarRetreatment: 1795,
    anteriorRetreatment: 1695
  };
  const procedureCost = outNetworkCosts[patientInfo.toothType as keyof ProcedureCosts] || 0;
  return procedureCost - uninsuredCost + inNetworkCopay;
}
