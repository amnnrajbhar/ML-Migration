import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { Resignation } from '../../separation/resignation/resignation.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { ResignationUpdateRequest } from '../../separation/resignation-list/resignationupdaterequest.model'
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
declare var $: any;
declare var toastr: any;
declare var require: any;

@Component({
  selector: 'app-ess-resignation',
  templateUrl: './resignation.component.html',
  styleUrls: ['./resignation.component.css'],
  providers: [Util]
})
export class ResignationComponent implements OnInit {
  currentUser: AuthData;
  employeeId: any;
  resignationId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  editAllowed: boolean = true;
  isRejected: boolean = false;
  isSubmitted: boolean = false;
  canResubmit: boolean = false;
  canWithdraw: boolean = false;
  resignationStatus: any;
  resignationDetails = {} as Resignation;
  employeeDetails: any = {};
  fileList: any[] = [];
  DateToday: Date;
  DateLastWorkingDay: Date;
  ResignationDate: string;
  noticePeriod: string;
  tabIndex: number = 0;
  tabsList: string[] = ["checklist", "exitinterview", "history"];
  currentTab: string = "history";
  objectType: string = "Resignation";
  reason = [{ type: "Personal" },{ type: "Retired" }, { type: "Terminated" }];
  comments: string;
  action: string;
  files: any[] = [];


  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private util: Util, private route: ActivatedRoute
    , private location: Location) {
  }

  ngOnInit() {
    this.DateToday = new Date();
    this.ResignationDate = this.getDateFormate(new Date());

    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.currentUser.hrEmployeeId;
      this.resignationDetails.hodApproval = true;
      this.resignationDetails.reportingManagerApproval = true;

      this.GetEmployeeDetails(this.employeeId);
    }
  }

  GetEmployeeDetails(id) {
    if(id == null || id == undefined){
      toastr.error("HR Employee record does not exist for the logged in user. Cannot submit the Resignation.");
      this.location.back();
    }
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        this.DateLastWorkingDay = new Date(new Date().setMonth(new Date().getMonth() + parseInt(this.employeeDetails.noticePeriod)))
        this.noticePeriod = this.employeeDetails.noticePeriod + ' Month(s)';
        this.GetResignationDetailsById(this.employeeId);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error(error);
    });
  }

  GetResignationDetailsById(id) {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.RESIGNATION_STATUS_GET_BYEMPID+"/"+ id).then((data: any) => {
      if (data) {
        if(data.status != "Withdrawn" && data.status != "Rejection Accepted"){          
          this.resignationDetails = data;
          this.fileList = data.attachments;
          this.resignationId = this.resignationDetails.resignationId;
          this.resignationStatus = this.resignationDetails.status;
          this.DateLastWorkingDay = new Date(this.resignationDetails.lastWorkingDate);
          this.ResignationDate = this.getDateFormate(this.resignationDetails.resignationDate);          
          this.isSubmitted = true;
          this.currentTab = "checklist";
          this.canResubmit = this.resignationDetails.rejectionDays <= 7;

          if (this.resignationStatus == "Submitted" || this.resignationStatus == "Pending For Approval") {
            this.editAllowed = false;
            this.canWithdraw = true;
          }
          else if (this.resignationStatus == "Rejected") {
            this.editAllowed = true;
            this.isRejected = true;
          }
          else {
            this.editAllowed = false;
            this.canWithdraw = false;
          }
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error(error);
    });
  }


  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    console.log(this.currentTab);
  }

  withdraw() {
    this.comments = "";
    this.action = "Withdrawn";
  }

  accept() {
    this.comments = "";
    this.action = "Rejection Accepted";
    this.performTask();
  }

  print(id){
    let route = 'HR/separation/resignation-print/' + id;
    this.router.navigate([route]);
  }

  selectFiles(event) {
    this.files = event.target.files;
  }

  performTask() {
    if(this.action == "Withdrawn" && (this.comments == "" || this.comments == null)){
      toastr.error("Please enter the reason for withdrawal.");
      return;
    }

    var confirmMsg = this.action == "Withdrawn" ? "Are you sure you want to withdraw this?"
      : "Are you sure you want to Accept Rejection?";

    $("#ReasonModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request = {} as ResignationUpdateRequest;
      request.id = this.resignationDetails.resignationId;
      request.comments = this.comments;
      request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      toastr.info("Updating...");
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.RESIGNATION_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully " + this.action);
          this.reloadCurrentPage();
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


  reloadCurrentPage() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  resubmit() {
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
    if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate < this.ResignationDate)
    {
      toastr.error('Expected Relieving Date cannot be before Date of Resignation');
      return;
    }
  if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
    && this.resignationDetails.expectedLastWorkingDate < new Date()) {
    toastr.error('Expected Relieving Date Cannot Be Less Than Current Date');
    return;
  } 
 
  if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
    && this.resignationDetails.expectedLastWorkingDate > this.resignationDetails.lastWorkingDate)
    {
      toastr.error('Expected Relieving Date cannot be after Last Working day.');
      return;
    }
  if ((this.resignationDetails.reasonExpectedDateChange == undefined || this.resignationDetails.reasonExpectedDateChange == '')
    && this.resignationDetails.expectedLastWorkingDate) {
    toastr.error('Enter Reason For Expected Relieving Date Change');
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
      this.resignationDetails.lastWorkingDate = this.util.getFormatedDateTime(this.DateLastWorkingDay);
      this.resignationDetails.expectedLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.expectedLastWorkingDate);
      this.resignationDetails.actualLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.actualLastWorkingDate);

      this.isLoading = true;
      connection = this.httpService.HRpost(APIURLS.RESIGNATION_RESUBMIT_DETAILS, this.resignationDetails);
      connection.then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) {
            toastr.success('Successfully re-submitted the resignation.');
            this.addAttachments(true);
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

  submit() {
    if(this.resignationDetails.reason == "" || this.resignationDetails.reason == null || this.resignationDetails.reason == undefined){
      toastr.error("Please select the reason."); return;
    }
    if(this.resignationDetails.reasonDetail == "" || this.resignationDetails.reasonDetail == null || this.resignationDetails.reasonDetail == undefined){
      toastr.error("Please enter the detailed reason."); return;
    }
    if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate < this.ResignationDate)
    {
      toastr.error('Expected Relieving Date cannot be before Date of Resignation');
      return;
    }
    if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate < new Date()) {
      toastr.error('Expected Relieving Date Cannot Be Less Than Current Date');
      return;
    } 
  
    if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate > this.DateLastWorkingDay)
      {
        toastr.error('Expected Relieving Date cannot be after Last Working day.');
        return;
      }
    if ((this.resignationDetails.reasonExpectedDateChange == undefined || this.resignationDetails.reasonExpectedDateChange == '')
      && this.resignationDetails.expectedLastWorkingDate) {
      toastr.error('Enter Reason For Expected Relieving Date Change');
      return;
    }
    else {
      this.saveResignationDetails();
    }
  }


  saveResignationDetails() {

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

    if (confirm("Are you sure you want to submit resignation?")) {
      let connection: any;
      let data: any;
      this.resignationDetails.resignationDate = new Date();
      this.resignationDetails.employeeId = this.employeeId;
      this.resignationDetails.createdById = this.currentUser.uid;
      this.resignationDetails.createdDate = new Date();
      //this.resignationDetails.lastWorkingDate = this.DateLastWorkingDay;
      this.resignationDetails.resignationDate = this.util.getFormatedDateTime(this.resignationDetails.resignationDate);
      this.resignationDetails.lastWorkingDate = this.util.getFormatedDateTime(this.DateLastWorkingDay);
      this.resignationDetails.expectedLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.expectedLastWorkingDate);      
      this.resignationDetails.actualLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.actualLastWorkingDate);

      this.isLoading = true;
      connection = this.httpService.HRpost(APIURLS.RESIGNATION_CREATE, this.resignationDetails);
      connection.then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) {
            toastr.success('Resignation submitted successfully! ');
            this.resignationDetails.resignationId = data.resignationId;
            this.addAttachments(true);
          }
          else
            toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
            this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while saving resignation details. Error:' + err);
        })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while saving resignation details. Error:' + error);
        });
    }
  }

  addAttachments(submit) {

    if (this.files.length > 0) {

      const formData = new FormData();
      var index = 0;
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
        formData.append("attachments[" + index + "]", file);
        index++;
      }
      toastr.info("Uploading attachment files ...");
      this.isLoading = true;
      this.httpService.HRpostAttachmentFile(APIURLS.RESIGNATION_ADD_ATTACHMENTS + "/" + this.resignationDetails.resignationId, formData)
        .then(
          (data: any) => {
            this.isLoading = false;
            if (data == 200 || data.success) {
              toastr.success('Files uploaded successfully!');
              if(submit && submit == true)
                this.submitForApproval(this.resignationDetails.resignationId);
              else 
                this.reloadCurrentPage();
            }
            else
              toastr.error(data.message);
          })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while uploading attachments. Error:' + error);
        });
    }
    else if(submit && submit == true){
      this.submitForApproval(this.resignationDetails.resignationId);
    }
    else{
      toastr.error("Select atleast one file to upload.");
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
          console.log(this.employeeId);
          this.reloadCurrentPage();

        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred.");
      }).catch(error => {
        this.isLoading = false;
        toastr.error(error);
      });
  }


  getFile(id, fileName) {
    if (id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.RESIGNATION_DETAILS_GET_ATTACHMENT_FILE + "/" + this.resignationId + "/" + id).then((data: any) => {

      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }


  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }


}
