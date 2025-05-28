export class AuthData {
    EmployeeNumber!: string
    Id!: number;
    profileIDs!: string[];
    constructor(
        public isAuth: boolean,
        public uid: number,
        public userName: string,
        public firstName: string,
        public lastName: string,
        public country: string,
        public email: string,
        public role: string[],
        public token: string,
        public isapprover: boolean,
        public usr_level: number,
        public roleId: number,
        public status: boolean,
        public imgurl: string,
        public employeeId: string,
        public fkEmpId: number,
        public expiresIn: number,
        public last_Login_datetime:string,
        public token_expiry_date:string,
        public fullName:string,
        public passwordExpired:boolean,
        public baselocation:number,
        public fK_Designation:number,
        public designation:string,
        public fkProfileId:number,
        public fK_Department:number,
        public department:string,
        public joiningDate:string,
        public reportingManager:string,
        public division:string,
        public locked:number,
        public hrEmployeeId:number,
        public permissions: number[]) { }
}