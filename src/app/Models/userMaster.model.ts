export class UserMaster {
    id!: number;
    fkCompanyId: number | null;
    fkEmpId: number | null;
    firstName: string
    middleName: string
    lastName: string
    fullName: string
    employeeId: string
    password: string
    email: string
    phoneNumber: number | null;
    imgUrl: string
    fkDesignationId: number | null;
    fkRoleId: number | null;
    fkSubroleId: number | null;
    fkProfileId: number | null;
    fkDepartmentId: number | null;
    fkUrlId: number | null;
    lastLoginDateTime: string | null;
    lastPassword: string
    passwordResetToken: string
    tokenExpiryDate: string | null;
    status: string
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}