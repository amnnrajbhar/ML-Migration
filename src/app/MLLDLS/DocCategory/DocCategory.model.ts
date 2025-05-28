export class docCategory{
    id:number;
    location:string;
    empCode:string;
    fromDept: string
    reqStatus: string
    category: string
    initialDocNo: string
    initialDocDate: string
    finalDocNo: string
    finalDocDate: string
    lastApprover: string
    pendingApprover: string
    role: string
    docNo: string         
    docCategory: string
    docLocation: string
    approver: string
    reason: string
    approvedDate: string
    autoReject!: number;
    approverType!: number;
    substitutionFlag!: number;
    subPersom: string
    subFrom: string
 
    isSelected: any;
    Name: any;
    isActive!: boolean;
    createdBy!: number;
    createdDate: string
    modifiedBy!: number;
    modifiedDate: string
    name: string
    description: string
}