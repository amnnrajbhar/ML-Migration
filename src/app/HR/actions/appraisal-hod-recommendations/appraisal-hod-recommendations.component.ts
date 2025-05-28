import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
//import { NewAppraisal } from './newappraisal.model';
import { EmployeeSalaryComponent } from '../employee-salary/employee-salary.component';
//import { JobChangeDetails } from './jobChangeDetails.model';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appraisal-hod-recommendations',
  templateUrl: './appraisal-hod-recommendations.component.html',
  styleUrls: ['./appraisal-hod-recommendations.component.css']
})
export class AppraisalHodRecommendationsComponent implements OnInit {
  employeeDetail: any = {};
  @Input() employeeInitialAppraisalDetail!: number;
  recommendedDesignation: any;
  recommendedRole: any;
  isLoading: boolean = false;
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.getDesignation();
    this.getRole();
   
  }

  loadRecommendationsData() {
    this.loadEmployeeDetails(this.employeeInitialAppraisalDetail);
  }

  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
        this.loadRecommendationsData();
  
      }
    }).catch((error)=> {
      this.designationList = [];
    });
  }

  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a:any, b:any) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      
      }
    }).catch((error)=> {
      this.roleList = [];
    });
  }

  loadEmployeeDetails(id:any) {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_HOD_RECOMMENDATIONS_DETAILS, id).then((data: any) => {
      if (data) {
        console.log('inside hod');
        this.employeeDetail = data;
        console.log(this.employeeDetail.recommendationDetails);
       // this.recommendedDesignation = this.designationList.find((x:any)  => x.id == this.employeeDetail.recommendationDetails.recommendedDesignationId).name;
        //this.recommendedRole = this.roleList.find((x:any)  => x.id == this.employeeDetail.recommendationDetails.recommendedRoleId).role_ltxt;
  console.log(this.recommendedDesignation);
  console.log(this.recommendedRole);
  this.isLoading = false;
        }
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
}
