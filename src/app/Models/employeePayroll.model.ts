export class EmployeePayroll {
    id!: number;
    employeeId: string
    currentAnnualCtc: number | null;
    fixedCtc: number | null;
    veriablePay: number | null;
    currentWorkStatus: string
    billingRate: number | null;
    previousAppraisalDate: string | null;
    appraisalDueDate: string | null;
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}