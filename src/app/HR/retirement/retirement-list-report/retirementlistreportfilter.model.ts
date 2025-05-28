export class RetirementListReportFilter {
    selectedPlantId: any;
    selectedEmployeeCategoryId: any;
    selectedPayGroupId: any;
    selectedDepartmentId: any;
    selectedDesignationId:any;
    selectedStateId:any;
    selectedLocationId:any;
    selectedGender:any
    selectedType: any;
    selectedFromdate: any;
    selectedTodate: any;
    selectedOption: any;   
    selectedGroup: any;    
    name: string
    employeeId!: number;
    pageNo:number;
    pageSize:number;
    export:boolean;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  