export class DepartmentMaster {
    id: number;
    name: string;
    description: string;
    fkParentId: number | null;
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}