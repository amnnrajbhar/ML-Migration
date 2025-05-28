import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { PERMISSIONS } from '../../../shared/permissions';
import { Util } from '../../Services/util.service';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-employee-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  providers: [Util]
})
export class ViewComponent implements OnInit {
  employeeId: any;
  details: any = {};
  objectType: string = "Employee";
  currentUser!: AuthData;
  urlPath: string = '';
  isLoading: boolean = false;

  currentTab: string = "official";
  tabIndex: number = 0;
  tabsList: string[] = ["official", "salary", "assets", "attachments", "documents", "address", "education", "experience", "family", "languages", "history", "activity"];
  profileDetails: any = {};
  id: any;
  canViewFullProfile = false;
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location, private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.id = this.route.snapshot.paramMap.get('id')!;
      this.canViewFullProfile = this.util.hasPermission(PERMISSIONS.HR_EMPLOYEE_VIEW_FULL_PROFILE);
      
      if (this.id > 0) {
        this.employeeId = this.id;
        if(this.canViewFullProfile == false){
          toastr.error("You are not authorized to view full profile of the Employee.");
          //this.location.back();
          this.router.navigate(['/HR/Employee/profile/'+this.id]);
        }
      }
      else {
        this.employeeId = this.currentUser.hrEmployeeId;
      }
      this.LoadEmployeeDetails(this.employeeId);
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

  onBack() {
    this.location.back();
  }

  onPrevious() {
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  onNext() {
    this.tabIndex++;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  onDataLoaded(data: any) {
    // console.log(data);
  }


  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

}
