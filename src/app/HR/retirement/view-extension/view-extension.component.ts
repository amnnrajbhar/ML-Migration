import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Retirement } from '../retirement-list/retirement.model';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-view-extension',
  templateUrl: './view-extension.component.html',
  styleUrls: ['./view-extension.component.css'],
  providers:[Util]
})
export class ViewExtensionComponent implements OnInit {
  currentUser: AuthData;
  appraisalId: any;
  objectType: string = "Retirement";
  employeeId: any;
  employeeRetirementId: any;
  taskId: any;
  isLoading: boolean = false;
  comments:string;
  retirementDetails: any = {};
  errMsg: string = "";
  errMsgModalPop: string = "";
  extendedDate: any;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "history"];
  statusList = [
    { type: "Active", color:"info" },    
    { type: "Extended", color:"success" },    
  ]

  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private fb: FormBuilder,
    private util: Util,private location: Location) {
  }

  ngOnInit() {
    this.employeeRetirementId = this.route.snapshot.paramMap.get('id')!;
    this.employeeId = this.route.snapshot.paramMap.get('id2')!;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
    this.getRetirementDetails(this.employeeRetirementId);
    this.GetEmployeeRetirementDate(this.employeeId);
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }


  getRetirementDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.RETIREMENT_GET_DETAILS_BY_ID, id).then((data: any) => {
      if (data) {
        this.retirementDetails = data;
        
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  extensionDetails= {} as any;
  extensionStartDate:Date;
  GetEmployeeRetirementDate(id) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RETIREMENT_EMPLOYEE_GET_DATE, id).then((data: any) => {
      if (data) {
        this.extensionDetails = data;
        this.retirementDetails.dateOfRetirement=data.dateOfRetirement;
        this.retirementDetails.extensionStartDate =data.extensionStartDate;

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  goBack() {
    this.location.back();
  }

}
