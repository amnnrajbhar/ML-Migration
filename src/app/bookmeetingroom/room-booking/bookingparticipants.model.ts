export interface BookingParticipants {
    id: number;
    fK_BookingId: number;
    name: string;
    mobile: string;
    mobileCode: string;
    email: string;
    type: string;
    employeeId: string;
    createdBy: number;
    createdDate: string;
    modifiedBy: number;
    modifiedDate: string;
}