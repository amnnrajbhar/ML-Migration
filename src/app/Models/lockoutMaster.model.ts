export class LockoutMaster {
    id: number;
    employeeId: string;
    count: number | null;
    lockoutFlag: boolean | null;
    lockoutDate: string | null;
    isActive: boolean | null;
    modifiedBy: string;
    modifiedDate: string | null;
    password: string;
    passwordReset: boolean | null;
}