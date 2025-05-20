export class Recommendations{
    constructor(
        public id:	number,
        public fkEmpId:	number,
        public employeeId:	string,
        public fkCalenderId:	number,
        public fkManagerId:	number, 
        public fkRecommendationDesignation:	number,
        public fkAssesmentId:	number,
        public recommendationHike:	number,
        public fixedHike:	number,
        public variableHike:	number,
        public variableIncentive:	number,
        public comments:	string,
        public createdBy:	number,
        public createdDate:	string,
        public modifiedBy:	number,
        public modifiedDate:	string,
        public isActive:	boolean
    ){}
}