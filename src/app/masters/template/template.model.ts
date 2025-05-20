    export class Template {
        constructor(
            public id: number,
            public name: string,
            public approvalOrderByHierarchy: string,
            public approvalOrderByTemplate: string,
            public fkProject: number,
            public fkSbuId: number,
            public startDate: string,
            public endDate: string
           ) { }
    }