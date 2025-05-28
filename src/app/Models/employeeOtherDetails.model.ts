export class EmployeeOtherDetails {
    id!: number;
    fkEmpId: number | null;
    employeeId: string
    designation: number | null;
    panNumber: string
    visaIsActive: boolean | null;
    visaNumber: string
    passportNumber: string
    qualification: string
    yearOfPassing: string
    hardSkill: string
    softSkill: string
    description: string
    yearExp: number | null;
    relativeExp: number | null;
    lastCompany: string
    secondLastCompany: string
    previousLocation: string
    currentLocation: string
    imgUrl: string
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}