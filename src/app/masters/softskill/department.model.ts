export class Department {
            constructor(
                public id: number,
                public skills: string,
                public code: string,
                public description: string,
                public fkParentId: number,
                public fkProfileId: number,
                public parentName: string,
                public isActive: boolean
            ) { }
       
}
