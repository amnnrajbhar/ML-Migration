export interface BookGuestHouse {
    id: number;
    requestNo:string;
    fkEmployeeId: number;
    employeeNumber: string;
    fkRoomId: number;
    fkPurpose: number;
    empoloyeeLocation: number;
    roomLocation: number;
    numberOfPerson: number;
    fromDate: any;
    toDate: any;
    fromTime: any;
    toTime: any;
    comments: string;
    isApprovalReq: boolean;
    createdBy: number;
    createdDate: string;
    modifiedBy: number;
    modifiedDate: string;
    isCancelled: boolean;
    cancelComments: string;
    empDesignation: string,
    empName:string,
    empEmail: string,
    managerId: number,
    managerName: string,
    managerEmail: string,
    managerComments: string,
    managerApprovalDate: string,
    adminId: number,
    adminName: string,
    adminEmail: string,
    adminComments: string,
    adminApprovalDate: string,
    status: string,
    roomName: string,
    description: string,
    no_Of_Room: string,
    no_Of_Bed: string,
    purpose: string,
    roomLocationCode: string,
    roomLocationName: string,
    empLocatonCode: string,
    empLocation: string,
    empDepartment:string
}
