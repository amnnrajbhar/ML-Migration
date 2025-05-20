export class Calendar {
    constructor(
                public id: number,
                public fkCompanyId: string,
                public fiscalYear: string,
                public period: number,
                public month: string,
                public startDate: string,
                public endDate: string,
                public closeMonth: number,
                public closeYear: number,
                public year: number
            ) { }
       
}
