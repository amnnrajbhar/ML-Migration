export class EmployeeProfileListFilter {
    selectedPlantId: number;
    selectedEmployeeCategoryId: number;
    selectedPayGroupId: number;
    selectedDepartmentId: number;
    selectedStateId: number;
    selectedLocationId: number;
    selectedStatus: string;
    selectedFromdate: string;
    selectedTodate: string;
    locationId:string;
    stateId:string;
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
  