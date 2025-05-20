export class Competency{
    constructor(
        public id: number,
        public name: string,
        public fkHeadEmpId: number,
        
        public fkSbuId: number,
        public fkSbuName: string,
        public description: string,
        public fkParentId: number,
        public isActive: boolean,
        public HeadEmpName: string,
        public ParentName: string,

    ){}
}