export class Form {
    constructor(
        public id: number,
        public name: string,
        public moduleName: string,
        public formDescription: string,
        public url: string,
        public menuId: number,
        public subMenuId:  number,
        public sortOrder: number,
        public createdby: number,
        public modifiedby: number,
        public isActive: boolean,

        public module_enableId:number
    ) { }

}
