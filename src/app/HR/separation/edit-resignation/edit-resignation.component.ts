import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
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
declare var require: any;
declare var toastr: any;
import swal from 'sweetalert';

@Component({
  selector: 'app-edit-resignation',
  templateUrl: './edit-resignation.component.html',
  styleUrls: ['./edit-resignation.component.css'],
  providers: [Util]  
})
export class EditResignationComponent implements OnInit {

  currentUser: AuthData;
  resignationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  resignationStatus: any;
  resignationDetails = {} as Resignation;
  noticePeriod: string;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments", "checklist", "exitinterview", "history"];
  objectType: string = "Resignation";
  reasonList = [{ type: "Personal" },{ type: "Retired" }, { type: "Terminated" }];  
  fileList: any[] = [];
  reason: string = "";  
  action: any ="";
  files: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location, private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.resignationId = this.route.snapshot.paramMap.get('id')!;
      if (!this.resignationId || this.resignationId <= 0) {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/separation/resignation-list']);
      }
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
        this.employeeId = data.employeeId;
        this.resignationId = this.resignationDetails.resignationId;
        this.resignationStatus = this.resignationDetails.status;
        if (this.resignationStatus == "Submitted" || this.resignationStatus == "Rejected" || this.resignationStatus == "Re-Submitted") {
          this.isRejected = this.resignationStatus == "Rejected";
          this.noticePeriod = this.resignationDetails.noticePeriod + ' Month(s)';
        }
        else {
          toastr.error("You cannot edit this Resignation. Status is: " + this.resignationStatus);
          this.router.navigate(['/HR/separation/resignation-list']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg = error;
      this.isLoading = false;
    });
  }

  onDateOfResignationChange(){
    if(this.resignationDetails.noticePeriod > 0 && this.resignationDetails.resignationDate ){  
      
      var lastWorkingDate = new Date(this.resignationDetails.resignationDate.toString());
      lastWorkingDate.setMonth((lastWorkingDate.getMonth()*1) + (this.resignationDetails.noticePeriod * 1));            
      this.resignationDetails.lastWorkingDate = lastWorkingDate;
    }
  }

withdraw() {
  this.reason = "";
  this.action = "Withdrawn";
}

resubmit(){
  if (this.resignationDetails.rejectionDays > 7) {
    toastr.error('Resignation Cannot Be Re-Submitted After 7 Days');
    return;
  }
  if(this.resignationDetails.reason == "" || this.resignationDetails.reason == null || this.resignationDetails.reason == undefined){
    toastr.error("Please select the reason."); return;
  }
  if(this.resignationDetails.reasonDetail == "" || this.resignationDetails.reasonDetail == null || this.resignationDetails.reasonDetail == undefined){
    toastr.error("Please enter the detailed reason."); return;
  }  
  if (this.resignationDetails.resignationDate > new Date())
  {
    toastr.error('Resignation Date cannot be after Todays Date.');
    return;
  } 
  if (this.resignationDetails.resignationDate < this.resignationDetails.dateOfJoining)
  {
    toastr.error('Resignation Date cannot be before Joining Date.');
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
  // if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
  //   && this.resignationDetails.expectedLastWorkingDate < new Date()) {
  //   toastr.error('Expected Relieving Date Cannot Be Less Than Current Date');
  //   return;
  // } 
 
  // if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
  //   && this.resignationDetails.expectedLastWorkingDate > this.resignationDetails.lastWorkingDate)
  //   {
  //     toastr.error('Expected Relieving Date cannot be after Last Working day.');
  //     return;
  //   }
  if ((this.resignationDetails.reasonExpectedDateChange == undefined || this.resignationDetails.reasonExpectedDateChange == '')
    && this.resignationDetails.expectedLastWorkingDate) {
    toastr.error('Enter Reason For Expected Relieving Date Change');
    return;
  }
  if(this.resignationDetails.lastDcrDate != null && this.resignationDetails.lastDcrDate != undefined && this.resignationDetails.lastDcrDate != "" 
    && this.resignationDetails.lastDcrDate > new Date(this.resignationDetails.lastWorkingDate)){
      toastr.error('Last DCR Date cannot be after Last working day.');
      return;
    }
  for (const file of this.files) {
    var ext = file.name.split('.').pop();
    if (ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png") {
      toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
      return;
    }
    if (file.size > (2 * 1024 * 1024)) {
      toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
      return;
    }
  }
  if (confirm("Are you sure you want to re-submit the resignation?")) {
    let connection: any;
    let data: any;
    this.resignationDetails.employeeId = this.employeeId;
    this.resignationDetails.modifiedById = this.currentUser.uid;
    this.resignationDetails.resignationDate = this.util.getFormatedDateTime(this.resignationDetails.resignationDate);
    this.resignationDetails.lastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.lastWorkingDate);
    this.resignationDetails.expectedLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.expectedLastWorkingDate);
    this.resignationDetails.actualLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.actualLastWorkingDate);
    this.resignationDetails.lastDcrDate = this.util.getFormatedDateTime(this.resignationDetails.lastDcrDate);
    this.isLoading = true;
    connection = this.httpService.HRpost(APIURLS.RESIGNATION_RESUBMIT_DETAILS, this.resignationDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) {
          toastr.success('Successfully re-submitted the resignation.');
          this.submitForApproval(this.resignationDetails.resignationId);
        }
        else
          toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
          this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while re-submitting resignation details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while re-submitting resignation details. Error:' + error);
      });
  }
}

performTask() {
  var confirmMsg = this.action == "Withdrawn" ? "Are you sure you want to withdraw this?"
    : "Are you sure you want to Accept Rejection?";

    if(this.reason==  "" || this.reason == null || this.reason == undefined){
      toastr.error("Please enter the reason for withdrawal."); 
      return;
    }

  $("#ReasonModal").modal('hide');
  if (confirm(confirmMsg)) {
    var request: any = {};
    request.id = this.resignationDetails.resignationId;
    request.comments = this.reason;
    request.status = this.action;
    request.modifiedById = this.currentUser.uid;
    this.isLoading = true;
    toastr.info("Updating...");
    this.httpService.HRpost(APIURLS.RESIGNATION_UPDATE_STATUS, request).then((data: any) => {
      if (data == 200 || data.success) {
        toastr.success("Successfully " + this.action);        
        this.router.navigate(['/HR/separation/resignation-list']);
      } else if (!data.success) {
        toastr.error(data.message);
      } else
      toastr.error("Error occurred.");
        this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error(error);
    });
  }
}

  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  submit() {
    let connection: any;
    let data: any;
    if(this.resignationDetails.reason == "" || this.resignationDetails.reason == null || this.resignationDetails.reason == undefined){
      toastr.error("Please select the reason."); return;
    }
    if(this.resignationDetails.reasonDetail == "" || this.resignationDetails.reasonDetail == null || this.resignationDetails.reasonDetail == undefined){
      toastr.error("Please enter the detailed reason."); return;
    }
    if (this.resignationDetails.resignationDate > new Date())
    {
      toastr.error('Resignation Date cannot be after Todays Date.');
      return;
    } 
    if (this.resignationDetails.resignationDate < this.resignationDetails.dateOfJoining)
    {
      toastr.error('Resignation Date cannot be before Joining Date.');
      return;
    }  
    if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate < this.resignationDetails.resignationDate)
    {
      toastr.error('Expected Relieving Date cannot be before Date of Resignation');
      return;
    }
    // if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
    //   && this.resignationDetails.expectedLastWorkingDate < new Date()) {
    //   toastr.error('Expected Relieving Date Cannot Be Less Than Current Date');
    //   return;
    // } 
  
    // if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
    //   && this.resignationDetails.expectedLastWorkingDate > this.resignationDetails.lastWorkingDate)
    //   {
    //     toastr.error('Expected Relieving Date cannot be after Last Working day.');
    //     return;
    //   }
    if ((this.resignationDetails.reasonExpectedDateChange == undefined || this.resignationDetails.reasonExpectedDateChange == '')
      && this.resignationDetails.expectedLastWorkingDate) {
      toastr.error('Enter Reason For Expected Relieving Date Change');
      return;
    }
    // if(this.resignationDetails.lastDcrDate != null && this.resignationDetails.lastDcrDate != undefined && this.resignationDetails.lastDcrDate != "" 
    // && this.resignationDetails.lastDcrDate > this.resignationDetails.lastWorkingDate){
    //   toastr.error('Last DCR Date cannot be after Last working day.');
    //   return;
    // }
    
    if (confirm("Are you sure you want to update resignation details?")) {
      this.isLoading = true;
      this.resignationDetails.modifiedById = this.currentUser.uid;
      this.resignationDetails.modifiedDate = new Date();
      this.resignationDetails.resignationDate = this.util.getFormatedDateTime(this.resignationDetails.resignationDate);
      this.resignationDetails.lastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.lastWorkingDate);
      this.resignationDetails.expectedLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.expectedLastWorkingDate);
      this.resignationDetails.lastDcrDate = this.util.getFormatedDateTime(this.resignationDetails.lastDcrDate);

      connection = this.httpService.HRpost(APIURLS.RESIGNATION_UPDATE, this.resignationDetails);
      connection.then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) {
            toastr.success('Details updated successfully!');
            this.router.navigate(['/HR/separation/resignation-list']);
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
  }

  submitForApproval(id) {
    var request: any = {};
    request.resignationId = id;
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.RESIGNATION_SUBMIT_FOR_APPROVAL, request)
      .then((data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success("Successfully submitted for approval.");
          this.router.navigate(['/HR/separation/resignation-list']);

        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred.");
      }).catch(error => {
        this.isLoading = false;
        toastr.error(error);
      });
  }

  Back(){
    this.location.back();
  }
}


