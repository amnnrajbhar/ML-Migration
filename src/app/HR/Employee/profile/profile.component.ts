import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var require: any;

@Component({
  selector: 'app-employee-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  employeeId: any;
  details:any={};
  objectType: string = "Employee";
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  action:any ="View";
  currentTab:string = "official";
  tabIndex: number = 0;
  tabsList: string[] = ["official", "assets", "attachments","address", "education", "experience", "family", "languages", "activity"];
  profileDetailsList:any={};
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.route.snapshot.paramMap.get('id')!;     
      //this.action = this.route.snapshot.paramMap.get('id2')!;      
      //this.employeeId = this.currentUser.hrEmployeeId;      
      this.LoadEmployeeDetails(this.employeeId);
      this.getProfileData(this.employeeId);
    }
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

onDataLoaded(){
  //$("#tab_"+this.currentTab).addClass("completed");
}


onTabClick(index){  
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
}

getProfileData(id)
{
  this.isLoading = true;

  this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_BY_EMPLOYEE_ID + "/" + id).then((data: any) => {
    if (data) {
      this.profileDetailsList = data;
      console.log(this.profileDetailsList);
    }
    this.isLoading = false;
  }).catch((error)=> {
    this.isLoading = false;
  });
}
}
