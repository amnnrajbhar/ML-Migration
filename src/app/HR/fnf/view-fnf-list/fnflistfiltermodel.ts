export class FNFListFilter {
    selectedPlantId!: number;
    selectedEmployeeCategoryId!: number;
    selectedPayGroupId!: number;
    selectedLocationId!: number;
    selectedStatus: string
    selectedFromdate: string
    selectedTodate: string
    name: string
    employeeId!: number;
    pageNo:number;
    pageSize:number;
    export:boolean;
    fnfId:any;
    submittedBy:string;
    pendingWith:string;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }