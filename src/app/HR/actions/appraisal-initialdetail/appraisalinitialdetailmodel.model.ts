export interface AppraisalInitialDetailModel{
    rating: string;
    oldresponsibilities: string[];
    newresponsibilities: string[];
    specialAchievement: string;
    nextyearkra: string[];
    recommendeddesignationid: number;
    recommendedRoleid: number;
    recommendedSalary: number;
    status: string;
    employeeid: number;
    salaryType: string;
    isPromotionRecommended: boolean;
    promotionComment: string;
    employeeInitialAppraisalDetailId: number;
    hodAdditionalNotes: string;
    oneTimeSalaryAmount: number;
    oneTimeSalaryType: string;
    completedById: number;
    flowTaskId: number;
    sales: number;
    growth: number;
}