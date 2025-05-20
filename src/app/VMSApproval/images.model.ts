export class VisitorsImage{
    constructor(
        public id: number,
        public fK_VisitorID: number,
        public visitorImage: Blob
    ){}
}