export class RoleMaster {
    id: number;
    fkSuperRoleId: number | null;
    role: string;
    description: string;
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
}