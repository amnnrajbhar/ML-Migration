export class EmailListFilter {
    selectedPlantId: any;
    selectedEmployeeCategoryId: any;
    selectedPayGroupId: any;
    selectedStateId: any;
    selectedEmailType: string;
    selectedEmailId: string;
    pageNo:number;
    pageSize:number;
    export:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  
