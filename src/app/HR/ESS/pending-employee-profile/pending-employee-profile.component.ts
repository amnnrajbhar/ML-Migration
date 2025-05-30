import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { DomSanitizer } from '@angular/platform-browser'
import { NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
import { Util } from '../../Services/util.service';
declare var require: any;
declare var toastr: any;
declare var $: any;


@Component({
  selector: 'app-pending-employee-profile',
  templateUrl: './pending-employee-profile.component.html',
  styleUrls: ['./pending-employee-profile.component.css'],
  providers: [Util]
})
export class PendingEmployeeProfileComponent implements OnInit {
  employeeId: any;
  details:any={};
  objectType: string = "Employee";
  objectTypeProfile: string = "Employee Profile";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  addressList:any[] = [];
  currentTab:string = "official";
  tabIndex: number = 0;
  taskId:any;
  profileId:any;
  action:any;
  comments:string;
  tabsList: string[] = ["official","address","education","experience","family","languages","attachments"];
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, 
    private location: Location, private readonly sanitizer: DomSanitizer, private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.taskId = this.route.snapshot.paramMap.get('id1')!;
      this.profileId = this.route.snapshot.paramMap.get('id2')!;
      this.util.canApproveTask(this.taskId, this.currentUser.uid);
    // this.employeeId = this.currentUser.hrEmployeeId;      
      this.LoadEmployeeDetails(this.employeeId);
    }    
    this.getProfileData(this.profileId);
  }

  LoadEmployeeDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.details = data;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  profileDetails:any={};
  getProfileData(id)
  {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetails = data;
        console.log(this.profileDetails);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  goBack() {
    this.router.navigate(['/HR/ess/pending-employee-profile-list']);
  }

  onBack(){
    this.location.back();
  }

  onPrevious(){
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];
  }

onNext(){
  this.tabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

onDataLoaded(data :any){
 // console.log(data);
}

approve(){
    
  if(confirm("Are you sure you want to approve this?"))
  {
    var request = {} as CompleteTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    toastr.success("Approving...");
    this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_APPROVE_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          toastr.error(data.message);
        }else{
          toastr.success("Task Approved successfully.");
          this.location.back();
        }
      }
    }).catch(error => {
      toastr.error("Error occured.");
    });
  }
}

reject() {       
  if (this.comments==undefined || this.comments=='')
  {
    toastr.error("Enter Reason For Rejection in Comments.");
    return;
  }
  if(confirm("Are you sure you want to reject this?"))
  {
    var request = {} as CompleteTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    toastr.error("Rejecting...");
    this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          toastr.error(data.message);
        }
        else{
          toastr.success("Task Rejected successfully.");
          this.location.back();
        }
      }
    }).catch(error => {
      toastr.error(error);
    });
  }
}

onTabClick(index){  
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    this.isLoading = false;
}

}
