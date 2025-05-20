export interface TaskModel{
    selected: boolean;
    flowTaskId: number;
    flowId: number;
    flowType: string;
    objectId: number;
    objectType: string;
    name: string;
    description: string;
    initiatedBy: string;
    startDate: string;
    activityTrace: string;
    role: string;
    firstName: string;
    middleName: string;
    lastName: string;
    plant: string;
    payGroup: string;
    employeeCategory: string;
    location: string;
    jobRole: string;
    designation: string;
    offeredSalary: number;
    approvers: string[];
    initialDataList: any[];
    plantCode:any[]
}