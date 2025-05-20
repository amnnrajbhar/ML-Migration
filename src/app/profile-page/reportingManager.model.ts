export class EmployeeMasterViewModelRM{
    constructor(
        public id: number,
        public employeeId: number,
        public email: string,
        public firstName: string,
        public middleName: string,
        public lastName: string,
        public designation: string
    ){}
}