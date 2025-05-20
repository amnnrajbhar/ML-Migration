export class Project {
            constructor(
                public id: number,
                public name: string,
                public code: string,
                public description: string,
                public fkParentId: number,
                public fkProjectManager: number,
                public fkProjectManagerName: string,
                public fkTeamLead: number,
                public fkTeamLeadName: string,
                public parentName: string,
                public isActive: boolean
            ) { }
       
}
