export interface Termination{

    terminationId:number;
    employeeId:number;
    terminationDate:any;

    dateOfJoining:Date;
    reason:string;

    additionalNotes :string;
    status:string;
    plantId:number;
    payGroupId:number;
    employeeCategoryId:number;
    createdById:number;
    createdDate:Date;
    createdByName:string;
    plantName:string;
    payGroupName:string;
    employeeCategoryName:string;
    locationState:string;
    location:string;
    role:string;
    roleId:number;
    firstName:string;
    currentCTC:number;
    middleName:string;
    lastName:string;
    stateId:number;
    locationId:number;
    designationId:number;
    departmentId:number;
    designation:string;
    department:string;
    grade:string;
    emailSentDate:Date;
    modifiedById:number;
    modifiedDate:Date;
    hodApproval:boolean;
    reportingManagerApproval:boolean;  
    noticePeriod:string; 
    approvalRejectiongDate:Date;   
    tenure:string;
    payoutMonths: number;
    exitInterviewRequired: boolean;
    }
