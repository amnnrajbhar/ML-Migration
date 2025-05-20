import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AppraisalInitialDetailModel } from './appraisalinitialdetailmodel.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import swal from 'sweetalert';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';

@Component({
  selector: 'app-appraisal-initialdetail',
  templateUrl: './appraisal-initialdetail.component.html',
  styleUrls: ['./appraisal-initialdetail.component.css'],
  providers: [Util]
})
export class AppraisalInitialdetailComponent implements OnInit {

  currentUser: AuthData;
  employeeId: any;
  employeeInitialAppraisalDetailId: any;
  flowTaskId: any;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  resignationStatus: any;
  initiaAppraisalDetail = {} as any;
  employeeDetails: any = {};
  DateToday: Date;
  employeeName: string = "";
  currentTab: string = "details";
  year: string = "";
  month: string = "";
  days: string = "";
  ratingList = [{ type: "A+ - Excellent" }, { type: "A - Very Good" }, { type: "B - Good" }, { type: "C - Average" }, { type: "D - Poor" }];
  oldResponsibilitiesList: any[] = [];
  newResponsibilitiesList: any[] = [];
  nextYearKraList: any[] = [];
  count = 0;
  oldResponsibitiesAttributeCode: any;
  newResponsibitiesAttributeCode: any;
  newNextYearKraAttributeCode: any;
  salaryTypes = [{ type: "New CTC" }, { type: "Monthly Increment" }];
  oneTimeSalaryTypes = [{ type: "Annual" }, { type: "Monthly" }];
  isPromotionRecommended: any;
  promotionComment: any;
  tabIndex: number = 0;
  tabsList: string[] = ["details", "salaryhistory", "attachment"];
  objectType: string = "Appraisal";
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private util: Util) { }

  ngOnInit() {
    this.DateToday = new Date();
    this.isLoading = true;
    this.urlPath = this.router.url;
    var chkaccess = true;
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.employeeInitialAppraisalDetailId = this.route.snapshot.paramMap.get('id2')!; 
      this.flowTaskId = this.route.snapshot.paramMap.get('id3')!; 
        
      this.util.canApproveTask(this.flowTaskId, this.currentUser.uid);
      //this.employeeId = 52;
      if (!this.employeeId) {
        this.employeeId = this.currentUser.hrEmployeeId;
      }
      this.GetPreviousApproverRecommendationDetailDetails(this.employeeInitialAppraisalDetailId,this.employeeId);
      this.GetEmployeeDetails(this.employeeId);
      this.getDesignation();
      this.getRole();
    }
  }

  GetEmployeeDetails(id) {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        this.employeeDetails.dateOfJoining = this.getDateFormate(this.employeeDetails.dateOfJoining);
        this.employeeName = this.employeeDetails.firstName + ' ' + this.employeeDetails.middleName + ' ' + this.employeeDetails.lastName;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  GetPreviousApproverRecommendationDetailDetails(initiaAppraisalDetailId, employeeId) {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_PREVIOUS_INITIATOR_RECOMMENDATIONS_DETAILS
      + "?employeeInitialAppraisalDetailId=" + initiaAppraisalDetailId
       + "&employeeId=" + employeeId)
    .then((data: any) => {
      if (data && data.employeeInitialAppraisalDetailId > 0) {
        this.oldResponsibilitiesList = data.oldResponsibilities;
        this.newResponsibilitiesList = data.newResponsibilities;
        this.nextYearKraList = data.nextYearKra;
        this.isPromotionRecommended = data.isPromotionRecommended;
        this.initiaAppraisalDetail.promotionComment = data.promotionComment;
        this.initiaAppraisalDetail.recommendeddesignationid = data.recommendedDesignationId;
        this.initiaAppraisalDetail.recommendedRoleid = data.recommendedRoleId;
        this.initiaAppraisalDetail.salaryType = data.salaryType;
        this.initiaAppraisalDetail.rating = data.rating;
        this.initiaAppraisalDetail.recommendedSalary = data.recommendedSalary;
        this.initiaAppraisalDetail.oneTimeSalaryType = data.oneTimeSalaryType;
        this.initiaAppraisalDetail.oneTimeSalaryAmount = data.oneTimeSalaryAmount;
        this.initiaAppraisalDetail.sales = data.sales;
        this.initiaAppraisalDetail.growth = data.growth;
        this.initiaAppraisalDetail.specialAchievement = data.specialAchievement;
        this.initiaAppraisalDetail.hodAdditionalNotes = data.hodAdditionalNotes;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }
  submit() {
    this.saveInitialAppraisalDetails();
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  selectedDesignation: any;
  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.designationList = [];
    });
  }

  selectedRole: any;
  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a, b) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      }
    }).catch(error => {
      this.roleList = [];
    });
  }

  saveInitialAppraisalDetails() {
    let connection: any;
    let data: any;

    this.isLoading = true;
    this.initiaAppraisalDetail.employeeid = this.employeeId;
    this.initiaAppraisalDetail.completedById = this.currentUser.uid;
    this.initiaAppraisalDetail.flowTaskId = this.flowTaskId;
    this.initiaAppraisalDetail.status = "Recommendation Submitted";
    this.initiaAppraisalDetail.oldresponsibilities = this.oldResponsibilitiesList;
    this.initiaAppraisalDetail.newresponsibilities = this.newResponsibilitiesList;
    this.initiaAppraisalDetail.nextyearkra = this.nextYearKraList;
    this.initiaAppraisalDetail.employeeInitialAppraisalDetailId = this.employeeInitialAppraisalDetailId;
    
    this.initiaAppraisalDetail.isPromotionRecommended = this.isPromotionRecommended;
    if(!this.isPromotionRecommended)
    {
      this.initiaAppraisalDetail.recommendeddesignationid = null;
      this.initiaAppraisalDetail.recommendedRoleid = null;
     
   }
  //  else
  //  {
  //   this.initiaAppraisalDetail.promotionComment = this.promotionComment;
  //  }
    console.log(this.oldResponsibilitiesList);
    console.log(this.newResponsibilitiesList);
    console.log(this.nextYearKraList);
    connection = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_UPDATE_INITIAL_APPRAISAL_DETAILS, this.initiaAppraisalDetail);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          swal('Details saved successfully!');
          this.router.navigate(['HR/actions/appraisal-pendingtasks']);
        }
        else
          swal(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        swal('Error occured while saving resignation details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        swal('Error occured while saving resignation details. Error:' + error);
      });
  }

  onAddOldResponsibilities() {
    this.oldResponsibilitiesList.push({});
    //this.oldResponsibitiesAttributeCode = {};
  }

  onRemoveOldResponsibilities(index) {
    this.oldResponsibilitiesList.splice(index, 1);
  }

  onAddNewResponsibilities() {
    this.newResponsibilitiesList.push({});
    //this.newResponsibitiesAttributeCode = {};
  }

  onRemoveNewResponsibilities(index) {
    this.newResponsibilitiesList.splice(index, 1);
  }

  onAddNextYearKra() {
    this.nextYearKraList.push({});
    //this.newNextYearKraAttributeCode = {};
  }

  onRemoveNextYearKra(index) {
    this.nextYearKraList.splice(index, 1);
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

  goBack() {
    let route = 'HR/actions/appraisal-pendingtasks';
    this.router.navigate([route]);
  }

  onTabClick(index)
  {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }
}



