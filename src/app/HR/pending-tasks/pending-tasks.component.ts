import { Component, OnInit } from '@angular/core';
import { TaskModel } from './taskModel.model';
import { CompleteTaskRequest } from './completeTaskRequest.model';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';
import { DataStorageService } from '../Services/data-storage.service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-pending-tasks',
  templateUrl: './pending-tasks.component.html',
  styleUrls: ['./pending-tasks.component.css']
})
export class PendingTasksComponent implements OnInit {
  currentUser!: AuthData;
  urlPath: string = '';
  myTasks: TaskModel[] = [];
  isLoading: boolean = false;
  selectedType: any = "";
  selectedPlant: any= "";
  selectedPayGroup: any= "";
  selectedEmpCategory: any= "";
  taskId: number = 0;
  comments: string
  types = [{type:"Offer Approval"}, {type: "Offer Exception Approval"}, {type: "Appointment Verification"}, {type: "Appointment Approval"}];
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount =0;

  constructor(private httpService: HttpService, private router: Router, private route: ActivatedRoute,
    private excelService: ExcelService, private dataStore: DataStorageService, ) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;     
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
      this.plantList = data.filter((x:any)=> x.isActive).sort((a:any,b:any)=>{if(a.code > b.code) return 1; if(a.code < b.code) return -1; return 0;});
    }
  }).catch((error)=> {
    this.plantList = [];
  });
}

getPayGroupList() {
  this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.payGroupList = data.sort((a:any,b:any)=>{if(a.long_Desc > b.long_Desc) return 1; if(a.long_Desc < b.long_Desc) return -1; return 0;});
    }
  }).catch((error)=> {
    this.payGroupList = [];
  });
}

getEmployeeCategoryList() {
  this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.empCategoryList = data.sort((a:any,b:any)=>{if(a.catltxt > b.catltxt) return 1; if(a.catltxt < b.catltxt) return -1; return 0;});
    }
  }).catch((error)=> {
    this.empCategoryList = [];
  });
}

  LoadMyPendingTasks() {
    this.isLoading = true;
    let userId = this.currentUser.uid;
    
    this.httpService.HRget(APIURLS.OFFER_PENDING_TASKS+"?userId="+ userId
    +"&plantId="+(this.selectedPlant?this.selectedPlant:"")
    +"&payGroupId="+(this.selectedPayGroup?this.selectedPayGroup:"")
    +"&empCategoryId="+(this.selectedEmpCategory?this.selectedEmpCategory:"")
    +"&type="+(this.selectedType?this.selectedType:""))
    .then((data: any) => {
      if (data) {        
          this.myTasks = data;
        //this.myTasks.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.myTasks = [];
    });
  }

  filterData(){
    this.LoadMyPendingTasks();
  }

  approveBulk(){
    var selectedList = this.myTasks.filter((x:any)  => x.selected);
    if(selectedList.length <= 0)
    {
      toastr.error("Please select at least one task to approve.");
      return;
    }
    this.errorCount = 0;
    toastr.info("Approving...");
    for(var t of selectedList)
    {      
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = t.flowTaskId;
      request.completedById = this.currentUser.uid;
      
      this.httpService.HRpost(APIURLS.OFFER_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            this.errorCount++;
          }
        }
      }).catch((error)=> {
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

  verify(id, taskId){
    let route = 'HR/appointment/verify/' + id+"/"+taskId;
    this.router.navigate([route]);
  }

  openOfferApprove(id, taskId){
    let route = 'HR/offer/approve-offer/' + id+"/"+taskId;
    this.router.navigate([route]);
  }

  action = "";
  approve(id){
    this.action="approve";
    this.taskId = id;
    this.comments = "";
  }
  
  reject(id){
    this.action="reject";
    this.taskId = id;
    this.comments = "";
  }

  performTask(){
    if(this.action == "approve")
      this.approveTask();
    else 
      this.rejectTask();
  }

  approveTask(){        
    this.isLoading = true;
    var request = {} as CompleteTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    toastr.info("Approving...");
    this.httpService.HRpost(APIURLS.OFFER_APPROVE_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          toastr.error(data.message);
        }else{
          toastr.success("Task Approved successfully.");
          $("#CommentsModal").modal('hide');
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occured.");
    });    
  }


  rejectTask(){
    if(this.comments == ""){
      toastr.error("Please enter the reason for rejection in comments."); return;
    }    
    this.isLoading = true;
    var request = {} as CompleteTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    toastr.info("Rejecting...");
    this.httpService.HRpost(APIURLS.OFFER_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          toastr.error(data.message);
        }
        else{
          toastr.success("Task Rejected successfully.");
          $("#CommentsModal").modal('hide');
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error(error);
    });
  }

  exportData(){
    // this.filterModel.export = true;
    this.isLoading = true;    
   
      var exportList=[];
      let index=0;
      this.myTasks.forEach((item :any) => {
        index=index+1;
        let exportItem={
           "Sl No": index,
            "ID":item.objectId,
            "Type":item.name,
            "Submitted On":item.startDate,
            "Submitted By":item.initiatedBy,
            "Approval":item.role,
            "Approver":item.approvers.join('; '),
            "Details":item.initialDataList,
            "Name": item.firstName + ' '+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
            "Plant Name":item.plant,
            "Plant Code":item.plantCode,

            "Pay Group":item.payGroup,
            "Employee Category":item.employeeCategory,
            "Location":item.location,
            "Role":item.jobRole,
            "Designation":item.designation,
            "Offered Salary":item.offeredSalary
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Pending_Task'); 
      this.isLoading = false;
  
  }
}
