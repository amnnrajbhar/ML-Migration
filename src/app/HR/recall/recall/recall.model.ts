import { JobChangeDetails } from './jobChangeDetails.model';
export interface Recall{

    recallId:number;
    employeeId:number;
    recallDate:any;
    reason:string;
    status:string;
    createdById:number;
    createdDate:Date;
    createdByName:string;
    modifiedById:number;
    modifiedDate:Date;
    hodApproval:boolean;
    reportingManagerApproval:boolean;  
    IsRoleChange: boolean;
    IsDesignationChange: boolean;
    IsTransfer: boolean;
    IsSalaryChange: boolean;
    IsStaffCategoryChange: boolean;
    EffectiveDate: string
    PerformanceRating: string
    JobChangeDetails: JobChangeDetails[];
    recruitmentType: string
    replacingEmployeeNumber: string
    }
