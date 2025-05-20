export class Rating {
            constructor(
                public id: number,
                public scale: string,
                public code: string,
                public definition: string,
                public fkParentId: number,
                public fkCalendarId: number,
                public createdDate: string,
                public isActive: boolean
            ) { }
       
}
