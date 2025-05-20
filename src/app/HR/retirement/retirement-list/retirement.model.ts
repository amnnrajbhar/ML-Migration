export interface Retirement{

    retirementId:number;
    employeeId:number;
    extensionStartDate:any;   
    extensionEndDate:any;
    retirementClosureDate: any;
    months:number,
    extensionCount:number, 
    remarks:string;
    status:string;
    createdById:number;
    createdDate:Date;
    createdByName:string;
    modifiedById:number;
    modifiedDate:Date;
    hodApproval:boolean;
    reportingManagerApproval:boolean;  
    dateOfRetirement:Date;
    }
