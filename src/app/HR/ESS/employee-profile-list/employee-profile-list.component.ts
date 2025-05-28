import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-employee-profile-list',
  templateUrl: './employee-profile-list.component.html',
  styleUrls: ['./employee-profile-list.component.css']
})
export class EmployeeProfileListComponent implements OnInit {
  employeeId: any;
  details:any={};
  objectType: string = "Employee";
  currentUser!: AuthData;
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
  tabsList: string[] = ["official","address","education","experience","family","languages"];
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.taskId = this.route.snapshot.paramMap.get('id1')!;
      this.profileId = this.route.snapshot.paramMap.get('id2')!;
    // this.employeeId = this.currentUser.hrEmployeeId;      
      this.LoadEmployeeDetails(this.employeeId);
    }
    
    this.getProfileData(this.profileId);
    this.getData(this.employeeId);
  }

  LoadEmployeeDetails(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.details = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  getData(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_ADDRESS, id).then((data: any) => {
      if (data) {
        this.addressList = data;
        //console.log(this.addressList);
      }
      this.isLoading = false;
    }).catch((error)=> {
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
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
  
  goBack() {
    this.router.navigate(['/HR/ess/pending-employee-profile']);
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
    }).catch((error)=> {
      toastr.error("Error occured.");
    });
  }
}
reject() {

  this.comments = "";
}

rejectTask(){        
  if (this.comments==undefined || this.comments=='')
  {
    toastr.error("Enter Reason For Rejection");
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
          $("#ReasonModal").modal("hide");
          this.location.back();
        }
      }
    }).catch((error)=> {
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
