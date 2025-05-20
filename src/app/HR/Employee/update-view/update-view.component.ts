import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-update-view',
  templateUrl: './update-view.component.html',
  styleUrls: ['./update-view.component.css']
})
export class UpdateViewComponent implements OnInit {
  employeeId: any;
  details: any = {};
  objectType: string = "Employee";
  objectTypeProfile: string = "Employee Profile";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;

  currentTab: string = "official";
  tabIndex: number = 0;
  tabsList: string[] = ["official", "assets", "address", "education", "experience", "family", "languages", "attachments", "history"];
  profileDetails: any = {};
  profileUpdateStatus: any;
  isPending: boolean = false; 
  editAllowed = true;
  profileId: any;

  statusList = [
    { type: "Update", color: "info" },
    { type: "Delete", color: "danger" },
    { type: "Add", color: "success" },
  ]

  approvalStatusList = [
    { type: "Submitted", color: "info" },
    { type: "Pending For Approval", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
  ];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.profileId = this.route.snapshot.paramMap.get('id')!;
      if (this.profileId <= 0) {
        toastr.error("Invalid input.");
        this.location.back();
      }
      this.getProfileData(this.profileId);
    }
  }
  
  getProfileData(profileId) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + profileId).then((data: any) => {
      if (data) {
        this.profileDetails = data;
        this.employeeId = data.employeeId;
        this.LoadEmployeeDetails(data.employeeId);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
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


onTabClick(index){  
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
  this.isLoading = false;
}


}
