export class CompetencyMaster {
    id: number;
    name: string;
    fkHeadEmpId: number | null;
    fkSbuId: number | null;
    description: string;
    fkParentId: number | null;
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}