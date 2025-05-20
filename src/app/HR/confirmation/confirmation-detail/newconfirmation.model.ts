import { JobChangeDetails } from './jobChangeDetails.model';
export interface NewConfirmation {
    EmployeeAppraisalId: number;
    EmployeeId: number;
    Status: string;
    IsRoleChange: boolean;
    IsDesignationChange: boolean;
    IsTransfer: boolean;
    IsSalaryChange: boolean;
    IsStaffCategoryChange: boolean;
    CreatedDate: string;
    CreatedById: number;
    EffectiveDateMonth: string;
    EffectiveDateYear: string;
    PerformanceRating: string;
    AppraisalType: string;
    JobChangeDetails: JobChangeDetails[];
    AppraisedById: number;
    ApprovedById: number;
    SalaryProcessingMonth: string;
    SalaryProcessingYear: string;
    Note: string;
    AdHocNote: string;
    PackageType: string;
    EmployeeConfirmationId: number;
    NextCyclePeriod: string;
    NextCyleMonth: string;
}
