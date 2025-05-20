import { Component, OnInit } from '@angular/core';
import { AuthData } from '../../../auth/auth.model';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ExcelService } from '../../../shared/excel-service';
import { DataStorageService } from '../../Services/data-storage.service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-transfer-pending-list',
  templateUrl: './pending-list.component.html',
  styleUrls: ['./pending-list.component.css']
})
export class PendingListComponent implements OnInit {
  currentUser: AuthData;
  urlPath: string = '';
  myTasks: any[] = [];
  isLoading: boolean = false;
  selectedType: any = "";
  selectedPlant: any= "";
  selectedPayGroup: any= "";
  selectedEmpCategory: any= "";
  taskId: number = 0;
  comments: string;
  types = [{type:"Transfer Approval"}];
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount =0;
  constructor(private httpService: HttpService, private router: Router, private route: ActivatedRoute,
    private excelService: ExcelService, private dataStore: DataStorageService,) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));     
      this.LoadDropDowns();
      this.LoadMyPendingTasks();
    }
  }

LoadDropDowns(){
  this.getPlantList();
  this.getPayGroupList();
  this.getEmployeeCategoryList();
}

getPlantList() {
  this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.plantList = data.filter(x=> x.isActive).sort((a,b)=>{if(a.code > b.code) return 1; if(a.code < b.code) return -1; return 0;});
    }
  }).catch(error => {
    this.plantList = [];
  });
}

getPayGroupList() {
  this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.payGroupList = data.sort((a,b)=>{if(a.long_Desc > b.long_Desc) return 1; if(a.long_Desc < b.long_Desc) return -1; return 0;});
    }
  }).catch(error => {
    this.payGroupList = [];
  });
}

getEmployeeCategoryList() {
  this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.empCategoryList = data.sort((a,b)=>{if(a.catltxt > b.catltxt) return 1; if(a.catltxt < b.catltxt) return -1; return 0;});
    }
  }).catch(error => {
    this.empCategoryList = [];
  });
}

  LoadMyPendingTasks() {
    this.isLoading = true;
    let userId = this.currentUser.uid;
    
    this.httpService.HRget(APIURLS.HR_TRANSFER_PENDING_TASKS+"?userId="+ userId
    +"&plantId="+(this.selectedPlant?this.selectedPlant:"")
    +"&payGroupId="+(this.selectedPayGroup?this.selectedPayGroup:"")
    +"&empCategoryId="+(this.selectedEmpCategory?this.selectedEmpCategory:""))
    .then((data: any) => {
      if (data) {        
          this.myTasks = data;
        //this.myTasks.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.myTasks = [];
    });
  }

  
  filterData(){
    this.LoadMyPendingTasks();
  }

  approveBulk(){
    var selectedList = this.myTasks.filter(x => x.selected);
    if(selectedList.length <= 0)
    {
      toastr.error("Please select at least one task to approve.");
      return;
    }
    this.errorCount = 0;
    toastr.info("Approving...");
    for(var t of selectedList)
    {      
      var request: any = {};
      request.flowTaskId = t.flowTaskId;
      request.completedById = this.currentUser.uid;
      
      this.httpService.HRpost(APIURLS.HR_TRANSFER_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            this.errorCount++;
          }
        }
      }).catch(error => {
        this.errorCount++;
      });
    }

    setTimeout(() => 
    {
      if(this.errorCount <= 0)
      toastr.success("Approval Successful.");
      else 
      toastr.error("Approval failed for " + this.errorCount + " tasks.");
      this.LoadMyPendingTasks();
    }, 5000);
    
  }

 

  approve(id){
    this.taskId = id;
    if(confirm("Are you sure you want to approve this?"))
    {
      var request: any = {};
      request.flowTaskId = id;
      request.completedById = this.currentUser.uid;
      toastr.info("Approving...");
      this.httpService.HRpost(APIURLS.HR_TRANSFER_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }else{
            toastr.success("Transfer Approved successfully.");
            this.myTasks = null;
            this.LoadMyPendingTasks();
          }
        }
      }).catch(error => {
        toastr.error("Error occured.");
      });
    }
  }

  reject(id){
    this.taskId = id;
    this.comments = "";
  }
  rejectTask(){
    if (this.comments==undefined || this.comments=='')
    {
      toastr.error("Enter Reason For Rejection");
      return;
    }
    $("#CommentsModal").modal('hide');
    
    var request: any = {};
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    toastr.info("Rejecting...");
    this.httpService.HRpost(APIURLS.HR_TRANSFER_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          toastr.error(data.message);
        }
        else{
          toastr.success("Transfer Rejected successfully.");
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
    }).catch(error => {
      toastr.error(error);
    });
  }
  exportData(){
    // this.filterModel.export = true;
    this.isLoading = true;    
   
      var exportList=[];
      let index=0;
      this.myTasks.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No": index,
          "ID": item.objectId,
          "Type":item.name,
          "Submitted On":item.startDate,
          "Submitted By":item.initiatedBy,
          "Approval":item.role,
          "Approver":item.approvers.join('; '),
          "Employee No":item.employeeNo,            
          "Name":item.fullName,
          "Plant":item.plant,
          "Transfer Date":item.effectiveDate,
          "Additional Notes":item.additionalNote,
          "Pay Group":item.payGroup,
          "Employee Category":item.employeeCategory,
          "Location":item.location,
          "Role":item.jobRole,
          "Designation":item.designation,
          "Joining Date":item.dateOfJoining         
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Pending_Transfers'); 
      this.isLoading = false;
  
  }
}
