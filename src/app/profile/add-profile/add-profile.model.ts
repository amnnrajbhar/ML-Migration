import { Form } from "./form.model";
export class AddProfile {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public parentId: number,
    public createdby: number,
    public modifiedby: number,
    public isActive: boolean,
    public pro_formList: Form[],
    public pro_delList: Form[]
  ) { }

}
