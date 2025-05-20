export class ResignationListFilter {
    selectedPlantId: any;
    selectedEmployeeCategoryId: any;
    selectedPayGroupId: any;
    departmentId: any;
    selectedStatus: string;
    selectedFromdate: string;
    selectedTodate: string;
    selectedShortFallDays: string;
    selectedSettlementType:string;
    hodId: number;
    name: string;
    employeeId: number;
    pageNo:number;
    pageSize:number;
    export:boolean;
    createdByName:string;
    createdOn:any;
    resignationId:any;
    pendingWith:string;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  