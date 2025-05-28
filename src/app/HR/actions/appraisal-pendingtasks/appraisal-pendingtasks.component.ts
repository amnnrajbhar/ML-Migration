import { Component, OnInit } from '@angular/core';
import { AppraisalPendingTask } from './appraisalpendingtask.model';
import { InitialAppraisalCompleteTaskRequest } from './initialappraisalcompletetaskrequest.model';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';

@Component({
  selector: 'app-appraisal-pendingtasks',
  templateUrl: './appraisal-pendingtasks.component.html',
  styleUrls: ['./appraisal-pendingtasks.component.css']
})
export class AppraisalPendingtasksComponent implements OnInit {
  currentUser!: AuthData;
  urlPath: string = '';
  //myTasks: AppraisalPendingTask[] = [];
  myTasks: any = {};
  isLoading: boolean = false;
  selectedType: any = "";
  selectedPlant: any = "";
  selectedPayGroup: any = "";
  selectedEmpCategory: any = "";
  selectedDepartment: any = "";
  selectedStatus: any = "";
  selectedName: any = "";
  taskId: number = 0;
  comments: string
  types = [{ type: "Offer Approval" }, { type: "Appointment Verification" }, { type: "Appointment Approval" }];
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount = 0;
  filterModel: any = {};
  statusList = [
    { type: "Appraisal Initiated", color: "info" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Rejected", color: "danger" },
    { type: "Withdrawn", color: "warning" }, 
    { type: "Email Sent", color: "success" },
  ]

  constructor(private httpService: HttpService, private router: Router, private dataStore: DataStorageService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.status = "";
    this.filterModel.name = "";
    this.filterModel.departmentId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.empCategoryId = "";
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.LoadDropDowns();
      
      // get filter model from the in memory data store
      var oldFilter = this.dataStore.GetData("AppraisalPendingList");
      if(oldFilter){
        // if the filter was applied earlier use it
        this.filterModel = oldFilter;
      }
      this.LoadMyPendingTasks();
    }
  }

  LoadDropDowns() {
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
    this.getDepartments();
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  getPayGroupList() {
    this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });
      }
    }).catch((error)=> {
      this.payGroupList = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.empCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.empCategoryList = [];
    });
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }
  LoadMyPendingTasks() {
    this.isLoading = true;
    this.filterModel.userId = this.currentUser.uid;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_INITIAL_APPRAISAL_PENDING_TASKS, this.filterModel).then((data: any) => {
    // this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_INITIAL_APPRAISAL_PENDING_TASKS + "?userId=" + userId
    //   + "&plantId=" + (this.selectedPlant ? this.selectedPlant : "")
    //   + "&payGroupId=" + (this.selectedPayGroup ? this.selectedPayGroup : "")
    //   + "&empCategoryId=" + (this.selectedEmpCategory ? this.selectedEmpCategory : "")
    //   + "&empDepartmentId=" + (this.selectedDepartment ? this.selectedDepartment : "")
    //   + "&status=" + (this.selectedStatus ? this.selectedStatus : "")
    //   + "&name=" + (this.selectedName ? this.selectedName : ""))
    //   .then((data: any) => {
        if (data) {
          this.myTasks = data;
    
          for (var item of this.myTasks.list) {
            if(this.statusList.find((x:any)  => x.type == item.status) != null)
            item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
          }
          // store the filter model
          this.dataStore.SetData("AppraisalPendingList", this.filterModel);
          //this.myTasks.reverse();
        }
        //this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.myTasks = [];
      });
  }

  filterData() {
    this.filterModel.pageNo = 1;
    this.LoadMyPendingTasks();
  }

  // approveBulk() {
  //   var selectedList = this.myTasks.filter((x:any)  => x.selected);
  //   if (selectedList.length <= 0) {
  //     swal("Please select at least one task to approve.");
  //     return;
  //   }
  //   this.errorCount = 0;
  //   swal("Approving...");
  //   for (var t of selectedList) {
  //     var request = {} as InitialAppraisalCompleteTaskRequest;
  //     //request.flowTaskId = t.flowTaskId;
  //     request.completedById = this.currentUser.uid;

  //     this.httpService.HRpost(APIURLS.OFFER_APPROVE_TASK, request).then((data: any) => {
  //       if (data) {
  //         if (!data.success) {
  //           this.errorCount++;
  //         }
  //       }
  //     }).catch((error)=> {
  //       this.errorCount++;
  //     });
  //   }

  //   setTimeout(() => {
  //     if (this.errorCount <= 0)
  //       swal("Approval Successful.");
  //     else
  //       swal("Approval failed for " + this.errorCount + " tasks.");
  //     this.LoadMyPendingTasks();
  //   }, 5000);

  // }

  verify(id, taskId) {
    let route = 'HR/appointment/verify/' + id + "/" + taskId;
    this.router.navigate([route]);
  }

  approve(id:any) {
    this.taskId = id;
    if (confirm("Are you sure you want to approve this?")) {
      var request = {} as InitialAppraisalCompleteTaskRequest;
      request.flowTaskId = id;
      request.completedById = this.currentUser.uid;
      swal("Approving...");
      this.httpService.HRpost(APIURLS.OFFER_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if (!data.success) {
            swal(data.message);
          } else {
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

  reject(id:any) {
    this.taskId = id;
    this.comments = "";
  }

  rejectTask() {
    $("#CommentsModal").modal('hide');

    var request = {} as InitialAppraisalCompleteTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    swal("Rejecting...");
    this.httpService.HRpost(APIURLS.OFFER_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if (!data.success) {
          swal(data.message);
        }
        else {
          swal("Task Rejected successfully.");
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
    }).catch((error)=> {
      swal(error);
    });
  }
  viewInitialAppraisalDetails(employeeId: any, id: any, flowTaskId:any) {
    let route = 'HR/actions/appraisal-initialdetail/' + employeeId+"/"+id+"/"+flowTaskId;
    this.router.navigate([route]);
  }

  viewAppraisalDetails(eid: any, id: any) {
    let route = 'HR/actions/appraisal-view-only/' + eid + "/" + id;
    this.router.navigate([route]);
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.LoadMyPendingTasks();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.LoadMyPendingTasks();
  }
  
}



