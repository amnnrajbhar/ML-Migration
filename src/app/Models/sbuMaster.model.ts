export class SbuMaster {
    id!: number;
    name: string
    code: string
    description: string
    headEmpId: number | null;
    fkParentId: number | null;
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}