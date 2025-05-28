export interface RoomPictures {
    id: number;
    fk_RoomMasterID: number;
    fileName: string
    description: string
    path: string
    createdBy: number;
    createdDate: string
    modifiedBy: number;
    modifiedDate: string
}