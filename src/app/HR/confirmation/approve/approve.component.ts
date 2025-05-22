import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { NewConfirmation } from '../confirmation-detail/newconfirmation.model';
import { ConfirmationEmployeeSalaryComponent } from '../confirmation-employee-salary/confirmation-employee-salary.component';
import { JobChangeDetails } from '../confirmation-detail/jobChangeDetails.model';
declare var $: any;
declare var toastr: any;
import swal from 'sweetalert';

@Component({
  selector: 'app-confirmation-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css'],
  providers:[Util]
})
export class ApproveComponent implements OnInit {
  @ViewChild(ConfirmationEmployeeSalaryComponent) employeeSalaryComponent: ConfirmationEmployeeSalaryComponent;
  employeeId: number = 0;
  employeeConfirmationId: any;
  taskId: any;
  objectType: string = "Confirmation";
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "jobchange", "salarychange","attachment", "history" ];
  currentUser: AuthData;
  isLoading: boolean = false;
  urlPath: string = '';
  errMsg: string = "";
  comments:string;
  allowanceDetails: any;
  jobChangeDetails: any[] = [];
  secondSignatoryRequired = false;
  isExtension = false;

  filterModel: any = {};
 confirmationType = 
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
    performanceType = [{ type: "A+", text: "A+ (Excellent)" }, { type: "A", text: "A (Very Good)" }, { type: "B", text: "B (Good)" }, { type: "C", text: "C (Average)" }, { type: "D", text: "D (Poor)" }];

  salaryProcessingMonths = [{ type: "January" }, { type: "February" }, { type: "March" }, { type: "April" }, { type: "May" }, { type: "June" }, { type: "July" }, { type: "August" }, { type: "September" }, { type: "October" }, { type: "November" }, { type: "December" }];

  confirmationDetails: any={};
  employeeDetails: any = {};
  monthlyComponents: any[] = [];
  reimbursementComponents: any[] = [];
  monthlyTotal = 0;
  monthlyAnnualTotal = 0;
  annualComponents: any[] = [];
  variableComponents: any[] = [];
  onetimeComponents: any[] = [];
  headTypes = [{type:"I", value:"Income"}, {type:"D", value:"Deduction"}, {type:"R", value:"Reimbursement"}, {type:"O", value:"One Time"}, {type:"V", value:"Variable Pay"}, {type:"B", value:"Other Benefit"}];
  frequency = [{type:"M", value:"Monthly"}, {type:"Q", value:"Quarterly"}, {type:"H", value:"Half-Yearly"}, {type:"A", value:"Annually"}, {type:"D", value:"Daily"}, {type:"O", value:"One Time"}];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private location: Location, private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;

    //this.filterModel.employeeId = $("#employeeId").val();
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.employeeConfirmationId = this.route.snapshot.paramMap.get('id')!;
      this.taskId = this.route.snapshot.paramMap.get('id2')!;
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.util.canApproveTask(this.taskId, this.currentUser.uid);
      this.isLoading = true;
      this.loadDetails();   
    }

  }

  
  loadDetails() {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.CONFIRMATION_API, this.employeeConfirmationId).then((data: any) => {
      if (data) {
        this.confirmationDetails = data;
        this.employeeId = data.employeeId;
         this.allowanceDetails = data.allowanceText;
        this.jobChangeDetails = data.jobChangeDetailsList;
        if(data.secondSignatoryId > 0){
          this.secondSignatoryRequired = true;
        }
        this.isExtension = data.confirmationType.includes("Extension");
        this.GetEmployeeDetails(data.employeeId);
        if(this.confirmationDetails.headDetails && this.confirmationDetails.headDetails.length > 0){
          for(var item of this.confirmationDetails.headDetails){            
            item.salaryTypeName = this.headTypes.find(x => x.type == item.salaryType).value;
            item.frequencyName = this.frequency.find(x => x.type == item.frequency).value;
          }
          this.monthlyComponents = this.confirmationDetails.headDetails.filter(x=>x.salaryType=="I" && x.frequency == "M");
          this.reimbursementComponents = this.confirmationDetails.headDetails.filter(x=>x.salaryType=="R");          
          this.annualComponents = this.confirmationDetails.headDetails.filter(x=>x.salaryType!="V" && x.frequency == "A");
          this.variableComponents = this.confirmationDetails.headDetails.filter(x=>x.salaryType =="V");
          this.onetimeComponents = this.confirmationDetails.headDetails.filter(x=>x.salaryType =="O" && x.frequency == "O");
          this.calculateTotals();
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  
  
  GetEmployeeDetails(id) {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;        
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  approve(){
    
    if(confirm("Are you sure you want to approve this?"))
    {
      var request:any = {};
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.info("Approving...");
      this.httpService.HRpost(APIURLS.CONFIRMATION_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }else{
            toastr.success("Confirmation Approved successfully.");
            this.location.back();
          }
        }
      }).catch(error => {
        toastr.error("Error occured.");
      });
    }
  }

  reject(){        
    if(this.comments == "" || this.comments == null){
      toastr.error("Please enter reason for rejection in comments.");
      return;
    }
    if(confirm("Are you sure you want to reject this?"))
    {
      var request:any = {};
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.info("Rejecting...");
      this.httpService.HRpost(APIURLS.CONFIRMATION_REJECT_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }
          else{
            toastr.success("Confirmation Rejected successfully.");
            this.location.back();
          }
        }
      }).catch(error => {
        toastr.error(error);
      });
    }
  }
  
  onTabClick(index)
{
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

  totalCTC = 0;
  variableTotal=0;
  onetimeTotal=0;
  calculateTotals(){
    this.confirmationDetails.totalIncome = 0;
    this.confirmationDetails.totalDeductions = 0;
    this.confirmationDetails.totalOtherBenefits = 0;
    this.confirmationDetails.totalReimbursements = 0;
    
    for(var i=0; i < this.confirmationDetails.headDetails.length; i++){
      var head = this.confirmationDetails.headDetails[i];          
          if(head.salaryType == "I"){          
            this.confirmationDetails.totalIncome += head.annualAmount;
            this.totalCTC += head.annualAmount;
            if(head.frequency == "M"){
              this.monthlyTotal += head.amount;
              this.monthlyAnnualTotal += head.annualAmount;
            }
          }
          else if(head.salaryType == "D")
            this.confirmationDetails.totalDeductions += head.annualAmount;        
          else if(head.salaryType == "R"){
            this.confirmationDetails.totalReimbursements += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
           else if(head.salaryType == "B"){
            this.confirmationDetails.totalOtherBenefits += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
          else if(head.salaryType == "V"){
            this.variableTotal += head.annualAmount;
          }
          else if(head.salaryType == "O"){
            this.onetimeTotal += head.annualAmount;
          }
    }    
    this.confirmationDetails.totalCTC = this.confirmationDetails.totalIncome + this.confirmationDetails.totalReimbursements + this.confirmationDetails.totalOtherBenefits;
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  goBack() {
    this.location.back();
  }

}
