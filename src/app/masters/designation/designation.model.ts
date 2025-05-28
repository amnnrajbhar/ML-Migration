export class Designation {
  id!: number;
  name: string
  description: string
  fkParentId!: number;
  createdBy!: number;
  createdDate: string
  modifiedBy!: number;
  modifiedDate: string
  isActive!: boolean;
}
