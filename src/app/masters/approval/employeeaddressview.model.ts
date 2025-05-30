export class EmployeeAddressView{
    constructor(
        public id: number,
        public fkEmpId: string,
        public employeeId: string,
        public personalEmail: string,
        public phoneNumber: string,
        public emgContactNumber: string,
        public emgContactName: string,
        public currentAddress: string,
        public permanentAddress: string,
        public nomineeName: string,
        public nomineePhone: string,
        public guardianName: string,
        public guardianRelation: string,
        public guardianPhone: string,
        public description: string,
        public isActive: boolean
    ){}
}