import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { confirmationDetailmodel } from './confirmationDetailmodel.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import swal from 'sweetalert';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
import { Util } from '../../Services/util.service';
declare var toastr: any;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  providers: [Util]
})
export class DetailComponent implements OnInit {

  currentUser!: AuthData;
  flowTaskId: any;
  employeeId: any;
  employeeConfirmationId: any;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  resignationStatus: any;
  confirmationDetail: any = {}; //as confirmationDetailmodel;
  employeeDetails: any = {};
  DateToday: Date;
  currentTab: string = "details";
  tabIndex = 0;
  tabsList: any[] = ["details","attachment", "history" ];
  ratingList = [{ type: "A+" }, { type: "A" }, { type: "B" }, { type: "C" }, { type: "D" }];
  currentResponsibilities: any[] = [];
  count = 0;
  salaryTypes = [{ type: "New CTC" }, { type: "Monthly Increment" }];
  nextYearKraList: any[] = [];
  currentYearKraList: any[] = [];
  newResponsibilitiesList: any[] = [];
  isExtension = false;
  confirmationTypes =
    [
      { type: "Probationary Confirmation" },
      { type: "Trainee Confirmation" },
      { type: "Probationary Retention" },
      { type: "Probation Extension" },
      { type: "Trainee Extension" },
    ];
  reasonList =
    [
      { type: "Performance Improvement" },
      { type: "Discipline" },
      { type: "Other" },
    ];
  hodConfirmationDetail: any = {};
  objectType: string = "Confirmation";

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private location: Location, private util: Util) { }

  ngOnInit() {
    this.DateToday = new Date();

    this.urlPath = this.router.url;
    var chkaccess = true;
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.route.snapshot.paramMap.get('id')!;
      this.employeeConfirmationId = this.route.snapshot.paramMap.get('id2')!;
      this.flowTaskId = this.route.snapshot.paramMap.get('id3')!;
      this.util.canApproveTask(this.flowTaskId, this.currentUser.uid);
      this.GetPreviousApproverRecommendationDetailDetails(this.employeeConfirmationId, this.employeeId);

      this.GetEmployeeDetails(this.employeeId);
      this.getDesignation();
      this.getRole();
    }
  }

  GetEmployeeDetails(id:any) {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  submit() {
    this.saveInitialConfirmationDetails();
  }

  onConfimationTypeChange(){
    if(this.hodConfirmationDetail.hodConfirmationType)
      this.isExtension = this.hodConfirmationDetail.hodConfirmationType == 'Probation Extension' || this.hodConfirmationDetail.hodConfirmationType == 'Trainee Extension';
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
        this.designationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.designationList = [];
    });
  }

  selectedRole: any;
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

  GetPreviousApproverRecommendationDetailDetails(employeeConfirmationId, employeeId) {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRget(APIURLS.CONFIRMATION_GET_PREVIOUS_INITIATOR_RECOMMENDATIONS_DETAILS
      + "?employeeConfirmationId=" + employeeConfirmationId
      + "&employeeId=" + employeeId)
      .then((data: any) => {
        if (data && data.employeeConfirmationId != 0) {
          this.currentResponsibilities = data.oldResponsibilities != undefined? data.oldResponsibilities : [];
          this.newResponsibilitiesList = data.newResponsibilities != undefined? data.newResponsibilities : [];
          this.nextYearKraList = data.nextYearKRA != undefined? data.nextYearKRA : [];
          this.currentYearKraList = data.currentYearKRA != undefined? data.currentYearKRA : [];
          this.hodConfirmationDetail.hodIsDesignationRoleChange = data.isPromotionRecommended;
          this.hodConfirmationDetail.hodChangeComment = data.comment;
          this.hodConfirmationDetail.hodRecommendedDesignationid = data.recommendedDesignationId;
          this.hodConfirmationDetail.hodRecommendedRoleid = data.recommendedRoleId;
          this.hodConfirmationDetail.hodRecommendedSalaryType = data.salaryType;
          this.hodConfirmationDetail.hodRating = data.rating;
          this.hodConfirmationDetail.hodRecommendedSalaryAmount = data.recommendedSalary;
          //this.hodConfirmationDetail.oneTimeSalaryType = data.oneTimeSalaryType;
          // this.hodConfirmationDetail.oneTimeSalaryAmount = data.oneTimeSalaryAmount;
          this.hodConfirmationDetail.sales = data.sales;
          this.hodConfirmationDetail.growth = data.growth;
          this.hodConfirmationDetail.hodSpecialAchievement = data.specialAchievement;
          this.hodConfirmationDetail.hodAdditionalNotes = data.hodAdditionalNotes;
          this.hodConfirmationDetail.hodConfirmationType = data.confirmationType;
          this.hodConfirmationDetail.newConfirmationDate = data.newConfirmationDate;
          this.hodConfirmationDetail.extensionReason = data.extensionReason;
          this.hodConfirmationDetail.extensionReasonText = data.extensionReasonText;
          this.isExtension = this.hodConfirmationDetail.hodConfirmationType == 'Probation Extension' || this.hodConfirmationDetail.hodConfirmationType == 'Trainee Extension';
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;

      });
  }

  saveInitialConfirmationDetails() {
    let connection: any;
    let data: any;
    this.hodConfirmationDetail.Employeeid = this.employeeId;
    this.hodConfirmationDetail.Status = "Recommendation Submitted";
    this.hodConfirmationDetail.submitedById = this.currentUser.uid;
    this.hodConfirmationDetail.flowTaskId = this.flowTaskId;
    this.hodConfirmationDetail.EmployeeConfirmationId = this.employeeConfirmationId;
    this.hodConfirmationDetail.HodCurrentResponsibilities = this.currentResponsibilities;
    this.hodConfirmationDetail.HodNewResponsibilities = this.newResponsibilitiesList;
    this.hodConfirmationDetail.HodNextYearKRA = this.nextYearKraList;
    this.hodConfirmationDetail.HodCurrentYearKRA = this.currentYearKraList;
    
    if (this.hodConfirmationDetail.hodConfirmationType == 'Probation Extension' || this.hodConfirmationDetail.hodConfirmationType == 'Trainee Extension') {
      this.hodConfirmationDetail.hodNewConfirmationDate = this.util.getFormatedDateTime(this.hodConfirmationDetail.hodNewConfirmationDate);

      connection = this.httpService.HRpost(APIURLS.CONFIRMATION_UPDATE_HOD_DETAILS, this.hodConfirmationDetail);
      connection.then(
        (data: any) => {
          this.isLoading = false;
          if (data == 200 || data.success) {
            swal('Details saved successfully!');
            this.goBack();
          }
          else
            swal(data.message + " Please check all the mandatory fields are entered properly.");
        },
        (err) => {
          this.isLoading = false;
          swal('Error occured while saving confirmation details. Error:' + err);
        })
        .catch((error)=> {
          this.isLoading = false;
          swal('Error occured while saving confirmation details. Error:' + error);
        });
      return;
    }
    // if (this.hodConfirmationDetail.hodConfirmationType == 'Extension') {
    //   this.submitForApproval(this.employeeConfirmationId);
    //   return;
    // }
    if (this.currentResponsibilities.length <= 0) {
      toastr.error("Please add current responsibilities."); return;
    }
    for (var item of this.currentResponsibilities) {
      if (item.description == "" || item.description == null) {
        toastr.error("Current Responsibility line should not be empty."); return;
      }
    }
    if (this.newResponsibilitiesList.length <= 0) {
      toastr.error("Please add new responsibilities."); return;
    }
    for (var item of this.newResponsibilitiesList) {
      if (item.description == "" || item.description == null) {
        toastr.error("New Responsibility line should not be empty."); return;
      }
    }
    this.isLoading = true;
    // this.hodConfirmationDetail.Employeeid = this.employeeId;
    // this.hodConfirmationDetail.Status = "Recommendation Submitted";
    // this.hodConfirmationDetail.submitedById = this.currentUser.uid;
    // this.hodConfirmationDetail.flowTaskId = this.flowTaskId;
    
    // this.hodConfirmationDetail.EmployeeConfirmationId = this.employeeConfirmationId;

    if (!this.hodConfirmationDetail.hodIsDesignationRoleChange) {
      this.hodConfirmationDetail.hodRecommendedDesignationid = null;
      this.hodConfirmationDetail.hodRecommendedRoleid = null;
    }
    connection = this.httpService.HRpost(APIURLS.CONFIRMATION_UPDATE_HOD_DETAILS, this.hodConfirmationDetail);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          swal('Details saved successfully!');
          this.goBack();
        }
        else
          swal(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        swal('Error occured while saving confirmation details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        swal('Error occured while saving confirmation details. Error:' + error);
      });
  }

  onAddCurrentResponsibilities() {
    this.currentResponsibilities.push({});
  }

  onRemoveCurrentResponsibilities(index) {
    this.currentResponsibilities.splice(index, 1);
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
  onAddCurrentYearKra() {
    this.currentYearKraList.push({});
    //this.newNextYearKraAttributeCode = {};
  }

  onRemoveCurrentYearKra(index) {
    this.currentYearKraList.splice(index, 1);
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
    this.location.back();
  }
  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[index];
  }
}



