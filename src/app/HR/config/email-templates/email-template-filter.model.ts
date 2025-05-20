export class EmailTemplateFilter {
    emailTemplateName: string;
    subject: string;
    createdBy: string;
    modifiedBy: string;
    pageNo:number;
    pageSize:number;
    export:boolean;
    selectedFromDate:Date;
    selectedToDate:Date;
    isActive:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }