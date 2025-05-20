export class OfferListFilter {
    selectedPlantId: string;
    selectedPayGroupId: string;
    selectedEmployeeCategoryId: string;
    selectedStatus: string;
    selectedFromdate: string;
    selectedTodate: string;
    selectedDepartmentId:string;
    selectedSubDepartmentId:string;
    name: string;
    offerId: string;
    appointmentId: string;
    employeeId: number;
    employmentType: string;
    includeConfidential: boolean;
    pageNo:number;
    pageSize:number;
    export:boolean;
    createdbyname:string;
    pendingWith: string;
    constructor(){
      this.export=false;
      this.pageSize=10;
      this.pageNo=1;
    }
  }
  