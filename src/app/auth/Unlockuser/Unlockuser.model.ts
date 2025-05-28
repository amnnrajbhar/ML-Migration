export class Lockout {
    id!: number;
    employeeId: string
    count!: number;
    lockoutFlag!: boolean;
    lockoutDate: string
    isActive!: boolean;
    modifiedBy: string
    modifiedDate: string
    password:string;
    passwordReset:boolean;
}