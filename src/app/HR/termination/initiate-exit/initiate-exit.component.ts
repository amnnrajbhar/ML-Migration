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
  selector: 'app-initiate-exit',
  templateUrl: './initiate-exit.component.html',
  styleUrls: ['./initiate-exit.component.css']
})
export class InitiateExitComponent implements OnInit {
  @ViewChild(TerminationChecklistComponent,{static:false})  terminationChecklistComponent: TerminationChecklistComponent;
  currentUser: AuthData;
  terminationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  terminationStatus: any;
  terminationDetails = {} as Termination;
  employeeDetails: any = {};
  TerminationDate: string;
  noticePeriod: string;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments"];
  objectType: string = "Termination";
  fileList: any[] = [];
  reason: string = "";  
  action: any ="";
  files: any[] = [];
  templatesList: any[] = [];
  selectedTemplateId: any;
  exitInterviewRequired: boolean;

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
      this.getTemplates();
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
        if (this.terminationStatus == "Approved") {
          this.TerminationDate = this.getDateFormate(this.terminationDetails.terminationDate);
          this.noticePeriod = this.terminationDetails.noticePeriod + ' Month(s)';
        }
        else {
          toastr.error("You cannot Initiate Exit on this. It is " + this.terminationStatus);
          this.router.navigate(['/HR/termination/termination-list']);
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
       this.terminationChecklistComponent.SaveData();

      var request: any = {};
      request.terminationId = this.terminationDetails.terminationId;
      request.exitInterviewTemplateId = this.exitInterviewRequired == true ? this.selectedTemplateId : "";
      request.exitInterviewRequired = this.exitInterviewRequired;
      request.reasonForNoExitInterview = this.reason;
      request.initiatedById = this.currentUser.uid;
      this.isLoading = true;
      toastr.info("Updating...");
      this.httpService.HRpost(APIURLS.TERMINATION_INITIATE_EXIT, request).then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Exit initiated successfully.");        
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

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getTemplates(){
    //console.log(event.target.value);
    this.httpService.HRget(APIURLS.TERMINATION_GET_PRINT_TEMPLATES+"/Exit Interview").then((data: any) => {
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
