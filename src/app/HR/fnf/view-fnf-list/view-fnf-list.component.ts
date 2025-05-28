import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { FNFListFilter } from './fnflistfiltermodel';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-view-fnf-list',
  templateUrl: './view-fnf-list.component.html',
  styleUrls: ['./view-fnf-list.component.css']
})
export class ViewFnfListComponent implements OnInit {
  id: number = 0;
  action: string
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  filterData: any = {};
  currentUser!: AuthData;
  from_date: any = null;
  to_date: any = null;
  name:string="";
  fnfId!: number;
  comments: string
  reisinationList1: any[] = [];
  submittedBy:any;
  pendingWith:any;
  filterModel:any={};
  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService) {
      currentUser: AuthData;
     }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    
    this.getFNFList();
    this.getPlantList();
    this.getDepartments();
    this.getEmployeeCategoryList();
  }

  selectedStatus: any = null;
  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },  
    { type: "Submitted To Accounts", color:"warning" },  
    { type: "Payment Received", color:"warning" },  
    { type: "Issued", color:"success" },        
    { type: "Rejected", color:"danger" },
    { type: "Email Sent", color:"info" },
  ]
  selectedPlant: any = null;
  getPlantList() {
    this.httpService.HRget(APIURLS.RESIGNATION_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  selectedPayGroup: any = null;
  getPayGroupList() {
    
    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  selectedEmployeeCategory: any = null;
  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.employeeCategoryList = [];
      });
  }

  departmentList: any[] = [];
  selectedDepartment: any = null;
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
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
  getFNFList() {

    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    
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
    
    this.getData();   
  
  }
  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.FNF_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch((error)=> {
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
  viewFNF(fnfId: any) {
    let route = 'HR/fnf/view-fnf/' + fnfId;
    this.router.navigate([route]);
  }
  addFNF(fnfId: any,employeeId: any) {
    let route = 'HR/fnf/initiate-fnf/' + employeeId +'/' + fnfId;
    this.router.navigate([route]);
  }
  editFNF(fnfId: any,employeeId: any) {
    let route = 'HR/fnf/edit-fnf/' + employeeId +'/' + fnfId;
    this.router.navigate([route]);
  }

  fnfList1: any[] = [];
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.FNF_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.fnfList1 = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.fnfList1.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "FNF ID": item.fnfId,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Created Date": this.setDateFormate(item.createdDate),
          "Created By": item.createdByName,
          "Employee No": item.employeeNo,
          "Employee Name": item.fullName,
          "Plant Name": item.plantName,
          "Plant Codee": item.plantCode,
          "Paygroup Name": item.payGroupName,
          "Category Name": item.categoryName,
          "Location": item.location,                    
          "Grade": item.grade,
          "Roll": item.role,
          "Payable Days": item.payableDays,
          "Net Amount": item.netAmount,     
          "Submitted By":item.submittedBy 

        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'FNF_Initiation_List'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }
  submitForApproval(id:any) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.fnfId = id;
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting...");
      this.httpService.HRpost(APIURLS.FNF_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.reisinationList1= null;
            this.getFNFList();
            toastr.success("Successfully submitted for approval.");
          } else if (!data.success) {
            toastr.error(data.message);
          } else
          toastr.error("Error occurred.");
        }).catch((error)=> {
          toastr.error(error);
        });
    }
  }
  print(fnfId: any,employeeId:any) {
    let route = 'HR/fnf/print-fnf/' + employeeId + '/' + fnfId;
    this.router.navigate([route]);
  }
performTask()
{}
}


