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
  selector: 'app-complete-exit',
  templateUrl: './complete-exit.component.html',
  styleUrls: ['./complete-exit.component.css']
})
export class CompleteExitComponent implements OnInit {
  currentUser: AuthData;
  resignationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  resignationStatus: any;
  resignationDetails: any = {};
  employeeDetails: any = {};
  DateLastWorkingDay: string;
  ResignationDate: string;
  noticePeriod: string;
  currentTab:string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments","checklist","exitinterview", "history"];
  objectType: string = "Resignation";
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
        this.DateLastWorkingDay = this.getDateFormate(this.resignationDetails.lastWorkingDate);
        this.ResignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
        this.noticePeriod = this.resignationDetails.noticePeriod + ' Month(s)';        
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.errMsg = error;
    });
  }

  
  CompleteExit() {
    if(this.resignationDetails.exitInterviewRequired == true && this.resignationDetails.exitInterviewTemplateId > 0
    && (this.resignationDetails.exitInterviewAnswers == null || this.resignationDetails.exitInterviewAnswers == undefined ||
      this.resignationDetails.exitInterviewAnswers == "")){
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
      request.resignationId = this.resignationDetails.resignationId;
      request.completedById = this.currentUser.uid;
      this.isLoading = true;
      toastr.info("Completing exit process...");
      this.httpService.HRpost(APIURLS.RESIGNATION_COMPLETE_EXIT, request).then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Exit process completed successfully.");        
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

  Back(){
    this.location.back();
  }

}
