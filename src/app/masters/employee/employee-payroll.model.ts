export class Payroll {
    constructor(
        public id:	number,
        public employeeId:	string,
        public currentAnnualCtc:	number,
        public fixedCtc:	number,
        public veriablePay:	number,
        public currentWorkStatus:	string,
        public billingRate:	number,
        public previousAppraisalDate:	string,
        public appraisalDueDate:	string,
        public createdBy:	number,
        public createdDate:	string,
        public modifiedBy:	number,
        public modifiedDate:	string,
        public isActive:	boolean
    ){}
}