export class EmailListFilter {
    selectedPlantId: number;
    selectedEmployeeCategoryId: number;
    selectedPayGroupId: number;
    selectedStateId: string;
   
    pageNo:number;
    pageSize:number;
    export:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }