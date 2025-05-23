export interface NewOffer{
    offerId: number;
    isConfidential: boolean;
    pfApplicable: string;
    esiApplicable: string;
    epsApplicable: string;
    preJoiningInitiation: string;
    guid: string;
    offerNo:string;
    plantId: number;
    payGroupId: number;
    employeeCategoryId: number;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    initial: string;
    gender: string;
    personalEmailId: string;
    mobileNo: string;
    dateOfBirth: string;
    age: number;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    district: string;
    stateId: number;
    pinCode: number;
    qualificationId: number;
    locationId: any;
    locationStateId: string;
    countryId: any;
    designationId: number;
    departmentId: number;
    grade:string;
    roleId: number;
    interviewedBy: string;
    assesmentReport: boolean;
    matTest: boolean;
    sendEmailNotification: boolean;
    otherEmails: string;
    presentEmployer: string;
    presentDesignation: string;
    salesAmount: number;
    totalExperience: number;
    presentCTC: number;
    offeredSalary: number;
    salaryType: string;
    packageType: string;
    referenceThru: string;
    refEmployeeNo: string;
    refDetails: string;
    recruitmentType: string;
    replacingEmployeeNumber: string;
    replacingEmployeeId: number;
    replacingEmployeeName: string;
    additionalDetails: string;
    joiningDate: string;
    createdById: number;
    modifiedById: number;
    submitForApproval: boolean;    
    createdDate: string;
    createdByName: string;
    modifiedByName: string;
    status: string;
    statusColor: string;
    reportingManagerName:string;
    approvingManagerName:string;
    reportingManagerId:number;
    approvingManagerId:number;
    secondSignatoryId: number;
    replacingEmployeePlantCode: string;
    replacingEmployeePlantName: string;
    replacingEmployeeDesignation: string;
    replacingEmployeeDepartment: string;
    replacingEmployeeCurrentCTC: number;
    replacingEmployeeDOL: string;
    replacingEmployeeDOR: string;
    }
