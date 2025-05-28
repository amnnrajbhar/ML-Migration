export interface GuestHouseInformation {
    id: number;
    name: string
    description: string
    no_Of_Room: number;
    no_Of_Bed: number;
    fk_Location: number;
    address:string;
    adminId:number;
    location:number;
    manager_Approval: boolean;
    admin_Approval: boolean;
    createdBy: number;
    createdDate: string
    modifiedBy: number;
    modifiedDate: string
    isActive: boolean
}
