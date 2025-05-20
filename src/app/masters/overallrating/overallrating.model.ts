export class Overallrating {
            constructor(
                public id: number,
                public fkCalenderId: number,
                public rating: number,
                public ratingemp: number,
                public description: string,
                public createdDate: string,
                public isActive: boolean
            ) { }
       
}
