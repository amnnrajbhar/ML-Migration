export class LocationMaster {
    id!: number;
    code: string
    name: string
    printName: string
    displayName: string
    description: string
    toMail: string
    outwardMail: string
    visitorMail: string
    createdBy: number | null;
    createdDate: string | null;
    modifiedBy: number | null;
    modifiedDate: string | null;
    isActive: boolean | null;
    plantType!: number;
}