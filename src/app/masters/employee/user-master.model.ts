export class UserMaster {
    constructor(
        public id: number,
        public fkCompanyId: number,
        // public fkEmpId: number,
        public firstName: string,
        public middleName: string,
        public lastName: string,
        public fullName: string,
        public FkEmpId: number,
        public employeeId: string,
        public password: string,
        public email: string,
        public phoneNumber: string,
        public fkDesignationId:number,
        public fkRoleId:number,
        public fkSubroleId:number,
        public fkProfileId:number,
        public fkDepartmentId:number,
        public lastPassword:string,
    ){}
}