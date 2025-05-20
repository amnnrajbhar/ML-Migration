import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Termination } from '../termination/termination.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import {TerminationChecklistComponent} from '../termination-checklist/termination-checklist.component';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-complete-exit',
  templateUrl: './complete-exit.component.html',
  styleUrls: ['./complete-exit.component.css']
})
export class CompleteExitComponent implements OnInit {
  currentUser: AuthData;
  terminationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  terminationStatus: any;
  terminationDetails: any = {};
  employeeDetails: any = {};
  TerminationDate: string;
  noticePeriod: string;
  currentTab:string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments","checklist","exitinterview", "history"];
  objectType: string = "Termination";
  fileList: any[] = [];
  reason: string = "";  
  action: any ="";
  files: any[] = [];
  declaration: boolean = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.terminationId = this.route.snapshot.paramMap.get('id')!;
      if (!this.terminationId || this.terminationId <= 0) {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/termination/termination-list']);
      }
      this.GetTerminationDetailsById(this.terminationId);
    }
  }

  
  GetTerminationDetailsById(id) {
    this.isLoading = true;
    this.isVisible = true;

    this.httpService.HRget(APIURLS.TERMINATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
        this.terminationDetails = data;
        this.fileList = data.attachments;
        this.employeeId = data.employeeId;
        this.terminationId = this.terminationDetails.terminationId;
        this.terminationStatus = this.terminationDetails.status;        
        this.TerminationDate = this.getDateFormate(this.terminationDetails.terminationDate);
        this.noticePeriod = this.terminationDetails.noticePeriod + ' Month(s)';        
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.errMsg = error;
    });
  }

  
  CompleteExit() {
    if(this.terminationDetails.exitInterviewRequired == true && this.terminationDetails.exitInterviewTemplateId > 0
    && (this.terminationDetails.exitInterviewAnswers == null || this.terminationDetails.exitInterviewAnswers == undefined ||
      this.terminationDetails.exitInterviewAnswers == "")){
        toastr.error("Exit interview is not completed yet, please complete it.");
        return;
    }
    if(!this.declaration){
      toastr.error("Please check the declaration check box to confirm.");
      return;
    }
    
    var confirmMsg = "Are you sure you want to Complete the Exit Process?"; 
    
    if (confirm(confirmMsg)) {
     
      var request: any = {};
      request.terminationId = this.terminationDetails.terminationId;
      request.completedById = this.currentUser.uid;
      this.isLoading = true;
      toastr.info("Completing exit process...");
      this.httpService.HRpost(APIURLS.TERMINATION_COMPLETE_EXIT, request).then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Exit process completed successfully.");        
          this.router.navigate(['/HR/termination/termination-list']);
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

  getFile(id, fileName) {
    if (id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.TERMINATION_DETAILS_GET_ATTACHMENT_FILE + "/" + this.terminationId + "/" + id).then((data: any) => {

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

  selectFiles(event) {
    this.files = event.target.files;
  }

  addAttachments() {

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
      this.httpService.HRpostAttachmentFile(APIURLS.TERMINATION_ADD_ATTACHMENTS + "/" + this.terminationDetails.terminationId, formData)
        .then(
          (data: any) => {
            this.isLoading = false;
            if (data == 200 || data.success) {
              toastr.success('Files uploaded successfully!');
            }
            else
            toastr.error(data.message);
          })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while uploading attachments. Error:' + error);
        });
    }

  }

  Back(){
    this.location.back();
  }

}
