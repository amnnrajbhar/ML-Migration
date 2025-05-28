export class TerminationListFilter {
    selectedPlantId!: number;
    selectedEmployeeCategoryId!: number;
    selectedPayGroupId!: number;
    selectedStatus: string
    selectedFromdate: string
    selectedTodate: string
    name: string
    employeeId!: number;
    pageNo:number;
    pageSize:number;
    export:boolean;
    submittedBy:string;
    terminationId:number;
    pendingWith:string;
    fromEmployeeNo: any;
    toEmployeeNo: any;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  