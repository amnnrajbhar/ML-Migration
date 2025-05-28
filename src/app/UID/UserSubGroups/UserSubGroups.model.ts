export class UserSubGroupsMaster{
   
  id!: number;
  name: string
  description: string
  fkSoftwareId!: number;
  fkUserGroupId!: number;
  createdBy: string
  createdDate: string
  modifiedBy: string
  modifiedDate: string
  isActive: boolean
}