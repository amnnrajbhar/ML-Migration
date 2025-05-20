export class EmployeeAddress {
    id: number;
    fkEmpId: number | null;
    employeeId: string;
    personalEmail: string;
    phoneNumber: string;
    emgContactNumber: string;
    emgContactName: string;
    currentAddress: string;
    permanentAddress: string;
    nomineeName: string;
    nomineePhone: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    description: string;
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
    module_enableId: number;
}