export class ContractEmployee {
    id!: number;
    employeeId: string
    payGroup!: number;
    location: string
    staffCat!: number;
    reportingGroup!: number;
    vendorContractorId!: number;
    vendorContractorName: string
    title: string
    firstName: string
    middleName: string
    lastName: string
    addressLine1: string
    addressLine2: string
    addressLine3: string
    postalCode: string
    city: string
    state: string
    country: string
    gender: string
    maritalStatus: string
    dob: string
    nationality: string
    telphone: string
    mobile: string
    emailId: string
    bloodGroup: string
    pan: string
    physicallyChallenged!: boolean;
    physicallyChallengedDetails: string
    emergencyContactPerson: string
    emergencyContactAddress1: string
    emergencyContactAddress2: string
    emergencyContactAddress3: string
    emergencyContactTel: string
    emergencyContactMob: string
    totalExp!: number;
    locId!: number;
    gradeId: string
    dptid!: number;
    dsgid!: number;
    sdptid!: number;
    doj: string
    dol: string
    rptmngr: string
    apprmngr: string
    rptmngrName: string
    apprmngrName: string
    block: string
    floor: string
    building: string
    shiftType: string
    shiftCode: string
    ruleCode: string
    swipeCount: string
    eligibleforOt!: boolean;
    roleId!: number;
    bandid: string
    isActive!: number;
    inActivatedOn: string
    createdBy: string
    createdOn: string
    modifiedBy: string
    modifiedOn: string
    validThrough:string;
    salaryAmount: any;
    sendSalaryAmount: any;
    salaryFreq: string
    weeklyOff!: boolean;

    fullName:string;
    swipeNo:string;
    workingDays:number;
    salarypermonth:string;
    extn:number;

    calendarType: string
    calendarCode: string
    calendarName: string
    pendingApprover: string
    status: string
    
    fileList:any[]=[];
}
