export interface Resignation{

    resignationId:number;
    employeeId:number;
    resignationDate:any;

    dateOfJoining:Date;
    lastWorkingDate:any;
    reason:string;
    reasonDetail:string;

    expectedLastWorkingDate:any;
    reasonExpectedDateChange :string;
    actualLastWorkingDate: any;
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
    noticePeriod: number; 
    approvalRejectiongDate:Date;   
    tenure:string;
    rejectionDays:number;  
    lastDcrDate: any;
    isFieldStaff: boolean;

    shortfallDays:number;
    settlementType: string;
    paymode:string;
    payAmount: number;

    receiptDate:Date;
    chequeNo:string;
    chequeDate:Date;
    paidAmount:number;
    issuingBank:string;
    accountNo:string;
    issuingPersonName:string;
    nameOfTheCheque:string;
    transferDate:Date;
    referenceNo:string;
    modeOfTransfer:string;
    favouring:string;
    }
