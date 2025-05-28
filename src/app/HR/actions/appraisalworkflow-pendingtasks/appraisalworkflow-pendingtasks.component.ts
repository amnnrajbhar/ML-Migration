import { Component, OnInit } from '@angular/core';
import { TaskModel } from './taskModel.model';
import { CompleteTaskRequest } from './completeTaskRequest.model';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ExcelService } from '../../../shared/excel-service';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
import swal from 'sweetalert';
declare var toastr: any;

@Component({
  selector: 'app-appraisalworkflow-pendingtasks',
  templateUrl: './appraisalworkflow-pendingtasks.component.html',
  styleUrls: ['./appraisalworkflow-pendingtasks.component.css']
})
export class AppraisalworkflowPendingtasksComponent implements OnInit {

  currentUser!: AuthData;
  urlPath: string = '';
  myTasks: TaskModel[] = [];
  isLoading: boolean = false;
  selectedType: any = "Appraisal Approval";
  selectedPlant: any= "";
  selectedPayGroup: any= "";
  selectedEmpCategory: any= "";
  taskId: number = 0;
  comments: string
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount =0;
  employeeId: any;

  constructor(private httpService: HttpService, private router: Router, private route: ActivatedRoute,
    private excelService: ExcelService, private dataStore: DataStorageService) { }

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
    
    this.httpService.HRget(APIURLS.HR_EMPLOYEE_APPRAISAL_PENDING_TASKS+"?userId="+ userId
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

  selectAll = false;
  SelectAll(){
    for(var t of this.myTasks)
    {
      t.selected = this.selectAll;
    }
  }

  approveBulk(){
    var selectedList = this.myTasks.filter((x:any)  => x.selected);
    if(selectedList.length <= 0)
    {
      swal("Please select at least one task to approve.");
      return;
    }
    this.errorCount = 0;
    swal("Approving...");
    for(var t of selectedList)
    {      
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = t.flowTaskId;
      request.completedById = this.currentUser.uid;
      
      this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_APPROVE_TASK, request).then((data: any) => {
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
        swal("Approval Successful.");
      else 
        swal("Approval failed for " + this.errorCount + " tasks.");
      this.LoadMyPendingTasks();
    }, 5000);
    
  }

  verify(id, taskId){
    let route = 'HR/appointment/verify/' + id+"/"+taskId;
    this.router.navigate([route]);
  }

  approve(id){
    this.taskId = id;
    if(confirm("Are you sure you want to approve this?"))
    {
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = id;
      request.completedById = this.currentUser.uid;
      swal("Approving...");
      this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            swal(data.message);
          }else{
            swal("Appraisal Approved successfully.");
            this.myTasks = null;
            this.LoadMyPendingTasks();
          }
        }
      }).catch((error)=> {
        swal("Error occured.");
      });
    }
  }

  reject(id){
    this.taskId = id;
    this.comments = "";
  }

  rejectTask(){
    if(this.comments == "" || this.comments == null){
      toastr.error("Please provide comments for rejection.");
      return;
    }
    $("#CommentsModal").modal('hide');
    
    var request = {} as CompleteTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    swal("Rejecting...");
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          swal(data.message);
        }
        else{
          swal("Task Rejected successfully.");
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
    }).catch((error)=> {
      swal(error);
    });
  }

  viewAppraisalDetails(id: any, taskId: any, empId) {
    let route = 'HR/actions/appraisal-view/' + id+"/"+taskId+"/"+empId;
    this.router.navigate([route]);
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
          "Employee Name":item.firstName + ' '+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
          "Employee No":item.employeeNo,
          "Plant":item.plant,
          "Pay Group":item.payGroup,
          "Employee Category":item.employeeCategory,
          "Location":item.location,          
          "Designation":item.designation,
          "Role":item.jobRole,
          "Effective Date":item.appraisalEffectiveDate,
          "Salary Processing Date":item.appraisalSalaryProcessingDate,
          "Next Revision Date":item.appraisalNextRevisionDate,
          "Appraisal Type":item.appraisalType,
          "Old CTC":item.appraisalOldCTC,
          "New CTC":item.appraisalNewCTC,
          "Increment Amount":item.appraisalIncrementAmount,
          "One time Amount":item.appraisalOneTimeAmount,
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Pending_Appraisals'); 
      this.isLoading = false;
  
  }
}

