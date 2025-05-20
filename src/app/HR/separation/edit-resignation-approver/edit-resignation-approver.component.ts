import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Resignation } from '../resignation/resignation.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import { CompleteResignationTaskRequest } from '../pending-resignation/completeResignationTaskRequest.model';
import { PendingTaskModel } from '../pending-resignation/pendingTaskModel.model';
declare var $: any;
declare var toastr: any;

declare var require: any;

@Component({
  selector: 'app-edit-resignation-approver',
  templateUrl: './edit-resignation-approver.component.html',
  styleUrls: ['./edit-resignation-approver.component.css'],
  providers: [Util]  
})
export class EditResignationApproverComponent implements OnInit {
  currentUser: AuthData;
  resignationId: any;
  approverId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isChecked: boolean = true;
  resignationStatus: any;
  //resignationDetails:any={}; //= {} as Resignation;
  resignationDetails = {} as Resignation;
  employeeDetails: any = {};
  DateLastWorkingDay: string;
  ResignationDate: string;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments", "history"];
  objectType: string = "Resignation";
  reasonList = [{ type: "Personal" },{ type: "Retired" }, { type: "Terminated" }];  
  fileList: any[] = [];
  taskId: number = 0;
  comments: string;
  reason: string = "";
  noticePeriod: string;
  files: any[] = [];
  settlementTypeList = [{ type: "Release with short notice period" },{ type: "Deduction in Settlement" }, { type: "Payment to be done" }];  
  paymodeList = [{ type: "Demand Draft(DD)" },{ type: "Online Payment" }, { type: "Cheque" }];  
  submitted = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location, private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.resignationId = this.route.snapshot.paramMap.get('id1')!;
      this.approverId = this.currentUser.uid;
      this.taskId = Number(this.route.snapshot.paramMap.get('id2')!);
      this.util.canApproveTask(this.taskId, this.currentUser.uid);
      this.GetResignationDetailsById(this.resignationId);

    }
  }

  GetResignationDetailsById(id) {
    this.isLoading = true;
    this.isVisible = true;

    this.httpService.HRget(APIURLS.RESIGNATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
        this.resignationDetails = data;
        this.fileList = data.attachments;
        this.resignationId = this.resignationDetails.resignationId;
        this.employeeId = this.resignationDetails.employeeId;
        this.resignationStatus = this.resignationDetails.status;
        if (this.resignationStatus == "Pending For Approval") {
          this.DateLastWorkingDay = this.getDateFormate(this.resignationDetails.lastWorkingDate);
          this.ResignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
          this.noticePeriod = this.resignationDetails.noticePeriod + ' Month(s)';
        }
        else {
          toastr.error("Resignation is not in Pending for Approval status. Current Status: "+ this.resignationStatus);
          this.router.navigate(['/HR/separation/pending-resignation']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg = error;
    });
  }

  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    console.log(this.currentTab);
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }

  updateResignationDetails() {
    
    this.submitted = true;

    if (this.resignationDetails.expectedLastWorkingDate < this.resignationDetails.resignationDate) {
      toastr.error('Expected Relieving Date cannot be before Date of Resignation');
      return;
    }
    // if (this.resignationDetails.expectedLastWorkingDate > this.resignationDetails.lastWorkingDate) {
    //   toastr.error('Expected Relieving Date cannot be after Last working day.');
    //   return;
    // }
    if ((this.resignationDetails.reasonExpectedDateChange == undefined || this.resignationDetails.reasonExpectedDateChange == '') && this.resignationDetails.expectedLastWorkingDate) {
      toastr.error('Enter Reason For Expected Relieving Date Change');     
      return; 
    }
    if(this.resignationDetails.lastDcrDate != null && this.resignationDetails.lastDcrDate != undefined && this.resignationDetails.lastDcrDate != "" 
    && this.resignationDetails.lastDcrDate > new Date(this.resignationDetails.lastWorkingDate)){
      toastr.error('Last DCR Date cannot be after Last working day.');
      return;
    }
    if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate < this.resignationDetails.resignationDate)
    {
      toastr.error('Requested Relieving Date cannot be before Date of Resignation');
      return;
    }
    if (this.resignationDetails.actualLastWorkingDate != null && this.resignationDetails.actualLastWorkingDate != undefined 
      && this.resignationDetails.actualLastWorkingDate < this.resignationDetails.resignationDate)
    {
      toastr.error('Actual Relieving Date cannot be before Date of Resignation');
      return;
    }

    if(this.resignationDetails.shortfallDays < 0 && (this.resignationDetails.settlementType == undefined || this.resignationDetails.settlementType == null)){      
      return;
    }
    if(this.resignationDetails.shortfallDays < 0 && this.resignationDetails.settlementType == "Payment to be done" && (this.resignationDetails.paymode == undefined || this.resignationDetails.paymode == null)){      
      return;
    }
    if(this.resignationDetails.shortfallDays < 0 && this.resignationDetails.settlementType == "Payment to be done" && (this.resignationDetails.payAmount == undefined || this.resignationDetails.payAmount == null || this.resignationDetails.payAmount <= 0)){      
      return;
    }

    if (!confirm("Are you sure you want to approve this?")) return;

    this.resignationDetails.modifiedById = this.currentUser.uid;
    this.resignationDetails.modifiedDate = new Date();
    this.resignationDetails.resignationDate = this.util.getFormatedDateTime(this.resignationDetails.resignationDate);
    this.resignationDetails.lastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.lastWorkingDate);
    this.resignationDetails.expectedLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.expectedLastWorkingDate);
    this.resignationDetails.actualLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.actualLastWorkingDate);
    this.resignationDetails.lastDcrDate = this.util.getFormatedDateTime(this.resignationDetails.lastDcrDate);

    this.isLoading = true;
    let connection: any;
    connection = this.httpService.HRpost(APIURLS.RESIGNATION_UPDATE, this.resignationDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success('Details updated successfully!');
          this.approveTask();
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while editing resignation details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while editing resignation details. Error:' + error);
      });
  }

  approve() {

   
      this.updateResignationDetails();      
   
  }

  approveTask(){
    var request = {} as CompleteResignationTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.reason;
    request.completedById = this.currentUser.uid;
    toastr.info("Approving...");
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.RESIGNATION_APPROVE_TASK, request).then((data: any) => {
      if (data) {
        if (!data.success) {
          toastr.error(data.message);
        } else {
          toastr.success("Resignation Approved successfully.");
          this.router.navigate(['/HR/separation/pending-resignation']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error("Error occured.");
      this.isLoading = false;
    });
  }

  rejectTask() {
    if(this.reason == "" || this.reason == null){
      toastr.error("Please enter reason for rejection in comments.");
      return;
    }

    if (!confirm("Are you sure you want to reject this?")) return;

    var request = {} as CompleteResignationTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.reason;
    request.completedById = this.currentUser.uid;
    toastr.info("Rejecting...");
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.RESIGNATION_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if (!data.success) {
          toastr.error(data.message);
        }
        else {
          toastr.success("Resignation Rejected successfully.");
          this.router.navigate(['/HR/separation/pending-resignation']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
      this.isLoading = false;
    });
  }

  Back(){
    this.location.back();
  }
}
