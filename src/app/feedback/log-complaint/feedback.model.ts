export class Feedback {
            constructor(
                public id: number,
                public fkEmpId: number,
                public uid: number,
                public div_name: string,
                public usr_id: string,
                public description: string,
                public resolution: string,
                public createdDate: string,
                public isActive: boolean
            ) { }
}
