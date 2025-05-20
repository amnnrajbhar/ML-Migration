import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Resignation } from '../resignation/resignation.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import {ResignationChecklistComponent} from '../resignation-checklist/resignation-checklist.component';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-initiate-exit',
  templateUrl: './initiate-exit.component.html',
  styleUrls: ['./initiate-exit.component.css']
})
export class InitiateExitComponent implements OnInit {
  @ViewChild(ResignationChecklistComponent) resignationChecklistComponent: ResignationChecklistComponent;
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
  employeeDetails: any = {};
  DateLastWorkingDay: string;
  ResignationDate: string;
  noticePeriod: string;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments"];
  objectType: string = "Resignation";
  fileList: any[] = [];
  reason: string = "";  
  action: any ="";
  files: any[] = [];
  templatesList: any[] = [];
  selectedTemplateId: any;
  exitInterviewRequired: boolean;
  isShortfall: boolean;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }

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
      this.getTemplates();
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
        if (this.resignationDetails.shortfallDays != 0)
        {
          this.isShortfall=true;
          console.log(this.isShortfall);
        }
        if (this.resignationStatus == "Approved") {
          this.DateLastWorkingDay = this.getDateFormate(this.resignationDetails.lastWorkingDate);
          this.ResignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
          this.noticePeriod = this.resignationDetails.noticePeriod + ' Month(s)';
        }
        else {
          toastr.error("You cannot Initiate Exit on this Resignation. It is " + this.resignationStatus);
          this.router.navigate(['/HR/separation/resignation-list']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.errMsg = error;
    });
  }

  initiate() {
    if(this.exitInterviewRequired && (this.selectedTemplateId == null || this.selectedTemplateId == undefined)){
      toastr.error("Please select an exit interview template.");
      return;
    }
    else if(!this.exitInterviewRequired && this.reason == ""){
      toastr.error("Please enter reason for exit interview not required.");
      return;    
    }
    var confirmMsg = "Are you sure you want to Initiate Exit Process?"; 
    
    if (confirm(confirmMsg)) {
      // save checklist items
      this.resignationChecklistComponent.SaveData();

      var request: any = {};
      request.resignationId = this.resignationDetails.resignationId;
      request.exitInterviewTemplateId = this.exitInterviewRequired == true ? this.selectedTemplateId : "";
      request.exitInterviewRequired = this.exitInterviewRequired;
      request.reasonForNoExitInterview = this.reason;
      request.initiatedById = this.currentUser.uid;
      this.isLoading = true;
      toastr.info("Initiating exit process...");
      this.httpService.HRpost(APIURLS.RESIGNATION_INITIATE_EXIT, request).then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Exit initiated successfully.");        
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
      this.httpService.HRpostAttachmentFile(APIURLS.RESIGNATION_ADD_ATTACHMENTS + "/" + this.resignationDetails.resignationId, formData)
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

  getTemplates(){
    //console.log(event.target.value);
    this.httpService.HRget(APIURLS.RESIGNATION_GET_PRINT_TEMPLATES+"/Exit Interview").then((data: any) => {
      if (data.length > 0) {
        this.templatesList = data.sort((a, b) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });
        
        //this.printTemplateTypes = data.sort((a, b) => { if (a.templateType > b.templateType) return 1; if (a.templateType < b.templateType) return -1; return 0; });
      }
    }).catch(error => {
      this.templatesList = [];
    });
  }

  Back(){
    this.location.back();
  }

}
