export class SBU {
            constructor(
                public id: number,
                public name: string,
                public code: string,
                public description: string,
                public fkParentId: number,
                public headEmpId: number,
                public parentName: string,
                public isActive: boolean
            ) { }
       
}
