export class SoftSkill {
            constructor(
                public id: number,
                public skills: string,
                public description: string,
                public fkRoleId: number,
                public fkCalendarId: number,
                public fkAssesmentId: number,
                public isActive: boolean
            ) { }
       
}
