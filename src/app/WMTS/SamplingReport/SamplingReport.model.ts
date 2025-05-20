export class SamplingFilter {
    PimNo: string;
    BatchNo: string;
    ItemCode: string;
    FromDate: string;
    Todate: string;
    Plant: string;
    pageNo:number;
    pageSize:number;
    export:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }