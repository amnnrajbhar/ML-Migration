export class Department {
            constructor(
                public id: number,
                public name: string,
                public description: string,
                public fkParentId: number,
                public parentName: string,
                public isActive: boolean
            ) { }
       
}
