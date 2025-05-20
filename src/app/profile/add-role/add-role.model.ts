export class Role {
            constructor(
                public id: number,
                public role: string,
                public description: string,
                public fkSuperRoleId: number,
                //public parentName: string,
                public createdby: string,
                public modifiedby: string,
                public isActive: boolean
            ) { }
       
}
