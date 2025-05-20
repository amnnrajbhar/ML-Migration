export class EmployeeOtherDetails{
    constructor(
        public id: number,
        public fkEmpId: number,
        public employeeId: string,
        public designation: number,
        public panNumber: string,
        public visaIsActive: boolean,
        public visaNumber: string,
        public passportNumber: string,
        public qualification: string,
        public yearOfPassing: string,
        public hardSkill: string,
        public softSkill: string,
        public description: string,
        public yearExp: number,
        public relativeExp: number,
        public lastCompany: string,
        public secondLastCompany: string,
        public previousLocation: string,
        public currentLocation: string

    ){}
}