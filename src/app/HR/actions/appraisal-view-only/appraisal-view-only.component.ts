import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ReadonlyemployeeSalaryComponent } from '../readonlyemployee-salary/readonlyemployee-salary.component';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import swal from 'sweetalert';
import { Location } from '@angular/common';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-appraisal-view-only',
  templateUrl: './appraisal-view-only.component.html',
  styleUrls: ['./appraisal-view-only.component.css']
})
export class AppraisalViewOnlyComponent implements OnInit {
@ViewChild(ReadonlyemployeeSalaryComponent, { static: false }) employeeSalaryComponent: ReadonlyemployeeSalaryComponent;

  currentUser: AuthData;
  appraisalId: any;
  objectType: string = "Appraisal";
  employeeId: any;
  employeeInitialAppraisalDetailId: any;
  oldReportingManager: any;
  newReportingManager: any;
  oldHod: any;
  newHod: any;
  oldRole: any;
  newRole: any;
  oldDepartment: any;
  newDepartment: any;
  oldSubDepartment: any;
  newSubDepartment: any;
  oldPlant: any;
  newPlant: any;
  oldDesignation: any;
  newDesignation: any;
  oldCategory: any;
  newCategory: any;
  oldLocation: any;
  newLocation: any;
  oldPayGroup: any;
  newPayGroup: any;
  oldState: any;
  newState: any;
  oldNoticePeriod:any;
  newNoticePeriod:any;
  taskId: any;
  isLoading: boolean = false;
  comments:string;
  employeeDetail: any = {};
  IsDesignationChange: any;
  IsRoleChange: any;
  IsTransfer: any;
  IsSalaryChange: any;
  IsStaffCategoryChange: any;
  monthlyComponents: any[] = [];
  reimbursementComponents: any[] = [];
  monthlyTotal = 0;
  monthlyAnnualTotal = 0;
  annualComponents: any[] = [];
  variableComponents: any[] = [];
  onetimeComponents: any[] = [];
  headTypes = [{type:"I", value:"Income"}, {type:"D", value:"Deduction"}, {type:"R", value:"Reimbursement"}, {type:"O", value:"One Time"}, {type:"V", value:"Variable Pay"}, {type:"B", value:"Other Benefit"}];
  frequency = [{type:"M", value:"Monthly"}, {type:"Q", value:"Quarterly"}, {type:"H", value:"Half-Yearly"}, {type:"A", value:"Annually"}, {type:"D", value:"Daily"}, {type:"O", value:"One Time"}];
  allowanceDetails: any;
  secondSignatoryRequired = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private location: Location) { }

  ngOnInit() {
    this.employeeInitialAppraisalDetailId = this.route.snapshot.paramMap.get('id2')!;
    //this.taskId = this.route.snapshot.paramMap.get('id2')!; 
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
    this.loadEmployeeData();
  }

  loadEmployeeData() {
    this.isLoading = true;

    //this.employeeId = 24;
    this.loadEmployeeDetails(this.employeeInitialAppraisalDetailId);
    //this.isLoading = false;
  }

  loadEmployeeDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_APPRAISAL_DETAILS, id).then((data: any) => {
      if (data) {
        console.log('got data');
        this.employeeDetail = data;
        this.allowanceDetails = data.allowanceText;
       
        console.log(this.employeeDetail);
        if(this.employeeDetail.appraisalDetails != null)
        {
          if(this.employeeDetail.appraisalDetails.secondSignatoryId > 0){
            this.secondSignatoryRequired = true;          
          }
          if(this.employeeDetail.appraisalDetails.jobChangeDetails != null){
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Role") != null)
            {
            this.oldRole = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Role").oldValueText
            this.newRole = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Role").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "StaffCategory") != null)
            {
            this.oldCategory = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "StaffCategory").oldValueText
            this.newCategory = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "StaffCategory").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "State") != null)
            { 
            this.oldState = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "State").oldValueText
            this.newState = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "State").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Department") != null)
            {
            this.oldDepartment = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Department").oldValueText
            this.newDepartment = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Department").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Designation") != null)
            {
            this.oldDesignation = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Designation").oldValueText
            console.log('got data1');
            this.newDesignation = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Designation").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "PayGroup") != null)
            {
            this.oldPayGroup = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "PayGroup").oldValueText
            this.newPayGroup = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "PayGroup").newValueText
            }
            console.log('got data2');
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Location") != null)
            {
            this.oldLocation = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Location").oldValueText
            this.newLocation = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Location").newValueText
            }
            console.log('got data3');
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "SubDepartment") != null)
            {
            this.oldSubDepartment = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "SubDepartment").oldValueText
            this.newSubDepartment = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "SubDepartment").newValueText
            }
            console.log('got data4');
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Plant") != null)
            {
            this.oldPlant = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Plant").oldValueText
            this.newPlant = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Plant").newValueText
            // console.log(this.employeeDetail.AppraisalDetails.IsDesignationChange);
            // console.log(this.IsDesignationChange);
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "RM") != null)
            {
            this.oldReportingManager = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "RM").oldValueText
            this.newReportingManager = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "RM").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "HOD") != null)
            {
            this.oldHod = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "HOD").oldValueText
            this.newHod = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "HOD").newValueText
            }
            if(this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Notice Period") != null)
              {
              this.oldNoticePeriod = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Notice Period").oldValueText
              this.newNoticePeriod = this.employeeDetail.appraisalDetails.jobChangeDetails.find(x => x.type == "Notice Period").newValueText
              }            
          }
        console.log('got data5');
        if(this.employeeDetail.appraisalDetails.isDesignationChange) {this.IsDesignationChange = "Yes" ;} else {this.IsDesignationChange = "No";}
        if(this.employeeDetail.appraisalDetails.isRoleChange) {this.IsRoleChange = "Yes"; }else {this.IsRoleChange = "No";}
        if(this.employeeDetail.appraisalDetails.isTransfer) {this.IsTransfer = "Yes"; }else {this.IsTransfer = "No";}
        if(this.employeeDetail.appraisalDetails.isSalaryChange) {this.IsSalaryChange = "Yes";} else {this.IsSalaryChange = "No";}
        if(this.employeeDetail.appraisalDetails.isStaffCategoryChange) {this.IsStaffCategoryChange = "Yes";} else{this.IsStaffCategoryChange =  "No";}
      }
      if(this.employeeDetail.appraisalSalaryHeadDetails != null)
      {
        if(this.employeeDetail.appraisalSalaryHeadDetails && this.employeeDetail.appraisalSalaryHeadDetails.length > 0){
          for(var item of this.employeeDetail.appraisalSalaryHeadDetails){            
            item.salaryTypeName = this.headTypes.find(x => x.type == item.salaryType).value;
            item.frequencyName = this.frequency.find(x => x.type == item.frequency).value;
          }
          this.monthlyComponents = this.employeeDetail.appraisalSalaryHeadDetails.filter(x=>x.salaryType=="I" && x.frequency == "M");
          this.reimbursementComponents = this.employeeDetail.appraisalSalaryHeadDetails.filter(x=>x.salaryType=="R");          
          this.annualComponents = this.employeeDetail.appraisalSalaryHeadDetails.filter(x=>x.salaryType!="V" && x.frequency == "A");
          this.variableComponents = this.employeeDetail.appraisalSalaryHeadDetails.filter(x=>x.salaryType =="V");
          this.onetimeComponents = this.employeeDetail.appraisalSalaryHeadDetails.filter(x=>x.salaryType =="O" && x.frequency == "O");
          this.calculateTotals();
        }
      }
        //console.log(this.employeeDetail.recommendationDetails.oldResponsibilities);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onTabClick(index) {

  }
  
  totalCTC = 0;
  variableTotal=0;
  onetimeTotal=0;
  calculateTotals(){
    this.employeeDetail.totalIncome = 0;
    this.employeeDetail.totalDeductions = 0;
    this.employeeDetail.totalOtherBenefits = 0;
    this.employeeDetail.totalReimbursements = 0;
    
    for(var i=0; i < this.employeeDetail.appraisalSalaryHeadDetails.length; i++){
      var head = this.employeeDetail.appraisalSalaryHeadDetails[i];          
          if(head.salaryType == "I"){          
            this.employeeDetail.totalIncome += head.annualAmount;
            this.totalCTC += head.annualAmount;
            if(head.frequency == "M"){
              this.monthlyTotal += head.amount;
              this.monthlyAnnualTotal += head.annualAmount;
            }
          }
          else if(head.salaryType == "D")
            this.employeeDetail.totalDeductions += head.annualAmount;        
          else if(head.salaryType == "R"){
            this.employeeDetail.totalReimbursements += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
           else if(head.salaryType == "B"){
            this.employeeDetail.totalOtherBenefits += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
          else if(head.salaryType == "V"){
            this.variableTotal += head.annualAmount;
          }
          else if(head.salaryType == "O"){
            this.onetimeTotal += head.annualAmount;
          }
    }    
    this.employeeDetail.totalCTC = this.employeeDetail.totalIncome + this.employeeDetail.totalReimbursements + this.employeeDetail.totalOtherBenefits;
  }
  goBack() {
    this.location.back();
  }
}
