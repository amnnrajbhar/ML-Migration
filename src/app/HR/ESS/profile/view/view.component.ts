import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { AuthData } from '../../../../auth/auth.model';
import { APIURLS } from '../../../../shared/api-url';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
declare var require: any;
declare var toastr: any;
declare var $: any;


@Component({
  selector: 'app-profile-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  employeeId: any;
  details: any = {};
  objectType: string = "Employee";
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;

  currentTab: string = "official";
  tabIndex: number = 0;
  tabsList: string[] = ["official", "salary", "assets", "attachments", "documents", "address", "education", "experience", "family", "languages", "activity", "history"];
  id: any;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.currentUser.hrEmployeeId;
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

  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

}
