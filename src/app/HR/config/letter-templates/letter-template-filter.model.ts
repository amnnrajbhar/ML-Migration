export class LetterTemplateFilter {
    templateType: string;
    templateName: string;
    createdBy: string;
    modifiedBy: string;
    pageNo:number;
    pageSize:number;
    export:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }