import { Location } from "../masters/locationmaster/location.model";
export class UserPlantAssignment {
  constructor(
    public id: number,
    public fkPlantId: number,
    public fkEmpId: number,
    public createdBy: number,
    public createdDate: string,
    public modifiedBy: string,
    public modifiedDate: string,
    public isActive: boolean,
    public pro_formList: Location[],
    public pro_delList: Location[]
  ) { }

}
