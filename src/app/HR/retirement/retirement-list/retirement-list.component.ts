import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { RetirementListFilter } from './retirementlistfiltermodel';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-retirement-list',
  templateUrl: './retirement-list.component.html',
  styleUrls: ['./retirement-list.component.css']
})
export class RetirementListComponent implements OnInit {
  id: number = 0;
  action: string;
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  filterData: any = {};
  currentUser: AuthData;
  from_date: any = null;
  to_date: any = null;
  oneMonthFromNow: Date;
  name:string="";
  comments: string;
  retirementList1: any[] = [];
  departmentList: any[] = [];
  statusList1 = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color:"success" },    
  ]
  selectedStatus: any = null;
  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Rejected", color:"danger" },    
    { type: "Extended", color:"success"},   
  ]
  filterModel: RetirementListFilter = {} as RetirementListFilter;
  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService) {
      currentUser: AuthData;
     }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.oneMonthFromNow = new Date();
    this.oneMonthFromNow.setMonth(this.oneMonthFromNow.getMonth()+1);
    this.to_date = new Date();
    this.to_date.setMonth((this.to_date.getMonth()*1) + 1);    
    this.getRetirementList();
    this.getPlantList();
    this.getEmployeeCategoryList();
  }

 
  selectedPlant: any = null;
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  selectedPayGroup: any = null;
  getPayGroupList() {
    
    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else{
      this.payGroupList = [];
      this.selectedPayGroup = null;
    }
  }

  selectedEmployeeCategory: any = null;
  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.employeeCategoryList = [];
      });
  }


  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }
  resigList: any[] = [];
  getRetirementList() {
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.selectedPlantId = null;
    this.filterModel.selectedPayGroupId = null;
    this.filterModel.selectedEmployeeCategoryId = null;
    this.filterModel.name = "";
    this.filterModel.selectedFromdate ="";
    this.filterModel.selectedTodate = "";

    if (this.selectedPlant != null) {
      this.filterModel.selectedPlantId = this.selectedPlant.id;
    }
    if (this.selectedEmployeeCategory != null) {
      this.filterModel.selectedEmployeeCategoryId = this.selectedEmployeeCategory.id;
    }
    if (this.selectedPayGroup != null) {
      this.filterModel.selectedPayGroupId = this.selectedPayGroup.id;
    }
    if (this.selectedStatus != null) {
      this.filterModel.selectedStatus = this.selectedStatus.type;
    }
    if (this.from_date != null)
      this.filterModel.selectedFromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      this.filterModel.selectedTodate = this.getDateFormate(this.to_date);

    if (this.name != null && this.name != "")
      this.filterModel.name = this.name;

    this.getData();   
  
  }
  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RETIREMENT_EMPLOYEE_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      console.log(this.filterData);
      for(var item of this.filterData.list){
        item.statusColor = this.statusList1.find(x=>x.type == item.status).color;
        var extnStatus = this.statusList.find(x=>x.type == item.extensionStatus);
        if(extnStatus)
          item.extensionStatusColor = extnStatus.color;
      }
      
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }
  viewRetirement(employeeId: any) {
    let route = 'HR/retirement/retirement-extension/' + employeeId;
    this.router.navigate([route]);
  }

  print(employeeId: any) {
    let route = 'HR/retirement/print-retirement/' + employeeId;
    this.router.navigate([route]);
  }
  
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RETIREMENT_EMPLOYEE_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.retirementList1 = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.retirementList1.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee ID": item.employeeId,
          "Status": item.status,
          "Created Date": this.setDateFormate(item.createdDate),
          "Created By": item.createdByName,
          "Employee No": item.employeeNo,
          "Employee Name": item.fullName,
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Category Name": item.categoryName,
          "Location": item.location,                    
          "Grade": item.grade,
          "Roll": item.role,
          "Date Of Birth": item.retirementDate,
          "Reporting Manager": item.reportingManagerName,            
          "HOD": item.approvingManagerName,     
                                            
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Retirement_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }
  submitForApproval(id) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.employeeRetirementId = id;
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting...");
      this.httpService.HRpost(APIURLS.RETIREMENT_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.retirementList1= null;
            this.getRetirementList();
            toastr.success("Successfully submitted for approval.");
          } else if (!data.success) {
            toastr.error(data.message);
          } else
          toastr.error("Error occurred.");
        }).catch(error => {
          toastr.error(error);
        });
    }
  }
performTask()
{}
}
