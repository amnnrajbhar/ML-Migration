export class Location {
  id!: number;
  code: string
  name: string
  description: string
  toMail: string
  outwardMail: string
  visitorMail: string
  createdBy!: number;
  createdDate: string
  modifiedBy!: number;
  modifiedDate: string
  isActive!: boolean;
}
