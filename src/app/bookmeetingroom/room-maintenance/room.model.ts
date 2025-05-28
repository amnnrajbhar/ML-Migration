export interface RoomInformation {
    id: number;
    name: string
    description: string
    capacity: number;
    fk_Location: number;
    fk_Type: number;
    manager_Approval: boolean;
    admin_Approval: boolean;
    createdBy: number;
    createdDate: string
    modifiedBy: number;
    modifiedDate: string
    isActive: boolean
}