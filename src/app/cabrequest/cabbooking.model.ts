export interface CabBooking {
    id: number;
    requestNo:string;
    fkEmployeeId: number;
    employeeNumber: string
    fkPurpose: number;
    empoloyeeLocation: number;
    typeofTrip: string;
    serviceType: string;
    fromLocation: string;
    toLocation: string;
    numberOfPerson: number;
    fromDateTime: any;
    toDateTime: any;
    comments: string
    isApprovalReq: boolean;
    createdBy: number;
    createdDate: string
    modifiedBy: number;
    modifiedDate: string
    isCancelled: boolean;
    cancelComments: string
    empDesignation: string;
    empName:string,
    empEmail: string;
    empContactNo: string;
    managerId: number,
    managerName: string;
    managerEmail: string;
    managerComments: string;
    managerApprovalDate: string;
    adminId: number,
    adminName: string;
    adminEmail: string;
    adminComments: string;
    adminApprovalDate: string;
    cabDetails: string;
    driverName: string;
    driverContact: string;
    status: string;
    purpose: string;
    empLocatonCode: string;
    empLocation: string;
    empDepartment:string
}
