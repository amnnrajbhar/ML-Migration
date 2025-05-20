export class Assessment {
    constructor(
        public id: number,
        public name: string,
        // public code: string,
        public createdDate: string,
        public fkEmpId: number,
        public fkCalendarId: number,
        // public parentName: string,
        public employeePcpStatus:	string,
        public formStatus:	boolean,
        public isInitiatedByEmployee: boolean,
        public isInitiatedBySystem:	boolean,
        public isApprovedByFirstLevel:	boolean,
        public isApprovedBySecondLevel:	boolean,
        public isApprovedByThirdLevel:	boolean,
        public isApprovedByFourthLevel:	boolean,
        public isApprovedByFifthLevel:	boolean,
       
        public isActive: boolean,
        public jobDescription:string,
        public sendToEmployeebyCom:	boolean,
        public modifiedDate: string,
    ) { }

}
