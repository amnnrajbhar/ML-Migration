export class ProfileListFilter {
    selectedPlantId: any;
    selectedEmployeeCategoryId: any;
    selectedPayGroupId: any;
    departmentId: any;
    selectedStatus: string;
    name: string;
    employeeId: number;
    pageNo:number;
    pageSize:number;
    export:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  