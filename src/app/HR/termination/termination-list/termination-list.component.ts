import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { TerminationListFilter } from './terminationlistfiler.model';
import { TerminationUpdateRequest } from './terminationupdaterequest.model';
declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-termination-list',
  templateUrl: './termination-list.component.html',
  styleUrls: ['./termination-list.component.css']
})
export class TerminationListComponent implements OnInit {
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
  name:string="";
  terminationId: number ;
  comments: string;
  terminationList1: any[] = [];
  submittedBy:string;
  pendingWith:string;
  filterModel: TerminationListFilter = {} as TerminationListFilter;
  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService) {
      currentUser: AuthData;
     }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.selectedStatus = "";
    this.getTerminationList();
    this.getPlantList();
    this.getEmployeeCategoryList();
  }

  selectedStatus: any = null;
  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Exit Initiated", color:"warning" },
    { type: "Exit Interview Completed", color:"warning" },
    { type: "Exit Completed", color:"success" },
    { type: "Rejected", color:"danger" },       
    { type: "Email Sent", color:"warning" },
    { type: "Withdrawn", color:"danger" }
  ]
  selectedPlant: any = null;
  getPlantList() {
    this.httpService.HRget(APIURLS.TERMINATION_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
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
    else
      this.payGroupList = [];
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

  terminationList: any[] = [];
  getTerminationList() {
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.selectedPlantId =null;
    this.filterModel.selectedEmployeeCategoryId = null;
    this.filterModel.selectedPayGroupId = null;
    this.filterModel.selectedStatus = null;
    this.filterModel.selectedFromdate = "";
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
   
      this.getData();   
  
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.TERMINATION_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
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

  printExit(terminationId: any) {
    let route = 'HR/termination/print-exit/' + terminationId;
    this.router.navigate([route]);
  }

  printExitInterview(terminationId: any){
    let route = 'HR/termination/print-exit-interview/' + terminationId;
    this.router.navigate([route]);
  }

  viewTermination(terminationId: any) {
    let route = 'HR/termination/view-termination/' + terminationId;
    this.router.navigate([route]);
  }

  editTermination(terminationId: any) {
    let route = 'HR/termination/edit-termination/' + terminationId;
    this.router.navigate([route]);
  }

  initiateExit(terminationId: any) {
    let route = 'HR/termination/initiate-exit/' + terminationId;
    this.router.navigate([route]);
  }

  withdraw(id) {
    this.terminationId = id;
    this.comments = "";
    this.action = "Withdrawn";
  }
  completeExit(terminationId: any){
    let route = 'HR/termination/complete-exit/' + terminationId;
    this.router.navigate([route]);
  }
  performTask() {
    if (this.comments==undefined || this.comments=='')
    {
      toastr.error("Enter Reason For Withdrwal");
      return;
    }
    var confirmMsg = this.action == "Withdrawn" ? "Are you sure you want to withdraw this?"
      : "Are you sure you want to archive this?";

    $("#CommentsModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request = {} as TerminationUpdateRequest;
      request.id = this.terminationId;
      request.comments = this.comments;
      request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      toastr.info("Updating...");
      this.httpService.HRpost(APIURLS.TERMINATION_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.terminationList1 = [];
          this.getTerminationList();
          toastr.success("Successfully " + this.action);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
        toastr.error("Error occurred.");
      }).catch(error => {
        toastr.error(error);
      });
    }
  }

  termList1: any[] = [];
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.TERMINATION_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.terminationList1 = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.terminationList1.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Termination ID": item.terminationId,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Created Date": this.setDateFormate(item.createdDate),
          "Created By": item.createdByName,
          "Employee No": item.employeeNo,
          "Employee Name": item.fullName,
          "Plant Code": item.plantCode,
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Category Name": item.categoryName,
          "Location": item.location,                    
          "Grade": item.grade,
          "Roll": item.role,
          "Date Of Joining": item.dateOfJoining,  
          "Termination Date": item.terminationDate,
          "Last Working Date": item.lastWorkingDate,
          "Reason": item.reason,     
          "Reporting Manager": item.reportingManagerName,            
          "HOD": item.approvingManagerName,     
                                            
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Termination_List'); 
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
      request.terminationId = id;
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting...");
      this.httpService.HRpost(APIURLS.TERMINATION_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.terminationList1= null;
            this.getTerminationList();
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

  }

