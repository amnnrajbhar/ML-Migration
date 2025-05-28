import { Component, OnInit } from '@angular/core';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ExcelService } from '../../../shared/excel-service';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;
import swal from 'sweetalert';

@Component({
  selector: 'app-confirmationpendingtask',
  templateUrl: './confirmationpendingtask.component.html',
  styleUrls: ['./confirmationpendingtask.component.css']
})
export class ConfirmationpendingtaskComponent implements OnInit {
  currentUser!: AuthData;
  urlPath: string = '';
  myTasks: any[] = [];
  isLoading: boolean = false;
  selectedPlant: any = "";
  selectedPayGroup: any = "";
  selectedEmpCategory: any = "";
  taskId: number = 0;
  comments: string
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount = 0;
  selectAll = false;

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

  LoadDropDowns() {
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
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

  LoadMyPendingTasks() {
    this.isLoading = true;
    let userId = this.currentUser.uid;

    this.httpService.HRget(APIURLS.CONFIRMATION_PENDING_TASKS + "?userId=" + userId
      + "&plantId=" + (this.selectedPlant ? this.selectedPlant : "")
      + "&payGroupId=" + (this.selectedPayGroup ? this.selectedPayGroup : "")
      + "&empCategoryId=" + (this.selectedEmpCategory ? this.selectedEmpCategory : ""))
      .then((data: any) => {
        if (data) {
          this.myTasks = data;          
        }
        //this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
  }

  onSelectAllChange(){
    for (var t of this.myTasks) {
      t.selected = this.selectAll;
    }
  }

  filterData() {
    this.LoadMyPendingTasks();
  }

  approveBulk() {
    var selectedList = this.myTasks.filter((x:any)  => x.selected);
    if (selectedList.length <= 0) {
      swal("Please select at least one task to approve.");
      return;
    }
    this.errorCount = 0;
    swal("Approving...");
    for (var t of selectedList) {
      var request:any = {};
      request.flowTaskId = t.flowTaskId;
      request.completedById = this.currentUser.uid;

      this.httpService.HRpost(APIURLS.CONFIRMATION_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if (!data.success) {
            this.errorCount++;
          }
        }
      }).catch((error)=> {
        this.errorCount++;
      });
    }

    setTimeout(() => {
      if (this.errorCount <= 0)
        swal("Approval Successful.");
      else
        swal("Approval failed for " + this.errorCount + " tasks.");
      this.LoadMyPendingTasks();
    }, 5000);

  }

  // verify(id, taskId) {
  //   let route = 'HR/appointment/verify/' + id + "/" + taskId;
  //   this.router.navigate([route]);
  // }

  approve(id:any) {
    this.taskId = id;
    if (confirm("Are you sure you want to approve this?")) {
      var request: any = {};
      request.flowTaskId = id;
      request.completedById = this.currentUser.uid;
      swal("Approving...");
      this.httpService.HRpost(APIURLS.CONFIRMATION_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if (!data.success) {
            swal(data.message);
          } else {
            swal("Confirmation Approved successfully.");
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
    if(this.comments == "" || this.comments == null){
      toastr.error("Please enter reason for rejection.");
      return;
    }
    $("#CommentsModal").modal('hide');

    var request:any = {};
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    swal("Rejecting...");
    this.httpService.HRpost(APIURLS.CONFIRMATION_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if (!data.success) {
          swal(data.message);
        }
        else {
          swal("Confirmation Rejected successfully.");
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
    }).catch((error)=> {
      swal(error);
    });
  }

  view(id, taskId) {
    let route = 'HR/confirmation/approve/' +id+ "/"+taskId;
    this.router.navigate([route]);
  }
  exportData(){
    this.isLoading = true;    
   
    var exportList=[];
    let index=0;
    this.myTasks.forEach((item :any) => {
      index=index+1;
      let exportItem={
        "Sl No": index,
        "ID": item.objectId,
        "Approval":item.name,
        "Submitted On":item.startDate,
        "Submitted By":item.initiatedBy,
        "Approver Type":item.role,
        "Approver":item.approvers.join('; '),
        "Employee No":item.employeeNo,
        "Name": item.firstName + ' '+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
        "Joining Date":item.dateOfJoining,
        "Probation Period":item.probationPeriod,
        "Confirmation Due":item.dateOfConfirmation,
        "Comments":item.comments,
        "Type":item.confirmationType,
        "Confimation Date":item.confirmationDate,
        "Performance Rating":item.rating,  
        "Effective Date":item.effectiveDate,
        "Salary Processing Date":item.salaryProcessingDate,
        "Next Revision Date":item.nextRevisionDate,
        "Old CTC":item.oldCTC,
        "New CTC":item.newCTC,
        "Increment Amount":item.incrementAmount,
        "One Time Amount":item.oneTimeAmount,
        "Next Confirmation Date":item.newConfirmationDate,
        "Reason":item.extensionReason,
        "HOD" :item.hodName,          
        "Plant":item.plant,
        "Pay Group":item.payGroup,
        "Employee Category":item.employeeCategory,
        "State":item.state,
        "Location":item.location,
        "Department":item.department,
        "Designation":item.designation,
        "Reporting Manager":item.reportingManagerName
      };
        exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'Pending_Confirmations'); 
    this.isLoading = false;
  }
}



