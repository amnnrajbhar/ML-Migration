export class RecallListFilter {
    selectedPlantId: number;
    selectedEmployeeCategoryId: number;
    selectedPayGroupId: number;
    selectedStatus: string;
    selectedFromdate: string;
    selectedTodate: string;
    name: string;
    employeeId: number;
    pageNo:number;
    pageSize:number;
    export:boolean;
    recallId:any;
    submittedBy:any;
    pendingWith:any;    
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  