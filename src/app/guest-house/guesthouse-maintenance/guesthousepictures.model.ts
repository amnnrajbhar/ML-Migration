export interface GuestHousePictures {
    id: number;
    fk_GuestHouseMasterID: number;
    fileName: string
    description: string;
    path: string;
    createdBy: number;
    createdDate: string;
    modifiedBy: number;
    modifiedDate: string;
}