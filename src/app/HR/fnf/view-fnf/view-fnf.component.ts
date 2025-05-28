import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FNFDetails } from '../initiate-fnf/fnfdetails.model';
import { FNFSettlement } from '../initiate-fnf/fnfsettlement.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { Resignation } from '../../separation/resignation/resignation.model';
import { AuthData } from '../../../auth/auth.model';
import { MOMENT } from 'angular-calendar';
import moment from 'moment'
declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-view-fnf',
  templateUrl: './view-fnf.component.html',
  styleUrls: ['./view-fnf.component.css'],
  providers:[Util]
})
export class ViewFnfComponent implements OnInit {
  currentUser!: AuthData;
  employeeId: any;
  fnfId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = false;
  isEditable: boolean = true;
  isApproved:boolean = false;
  isSubmitted:boolean = false;
  isPayment:boolean=false;
  isIssued:boolean=false;
  fnfStatus :any;
  fnfDetails= {} as FNFDetails;
  employeeDetails :any={};
  actualLastDate: any;
  objectType: string = "FNF";
  currentTab: string = "initiate";
  tabIndex: number = 0;
  tabsList: string[] = ["initiate","submit", "payment", "issue","attachments"];
  types = [{ type: "Earnings" }, { type: "Deductions" }];  
  modes = [{ mode: "Cheque" }, { mode: "DD" }];  
  issuemodes = [{ issuemode: "In Person" }, { issuemode: "Courier" }];  
  count = 0;
  heads = [{ head: "Salary" }, { head: "Leave" }, { head: "Bonus" }, { head: "LTA" },{ head: "LWP" },{ head: "Income Tax" }, { head: "EPF" }, { head: "Miscellaneous" }, { head: "Notice Period Deductions" }];  
  headList: any[] = [];
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  resignationDate: any;
  details: any = {};
  employee:any={};
  salarydetails:any={};
  monthlyComponents: any[] = [];
  monthlyTotal = 0;
  monthlyAnnualTotal = 0;
  annualComponents: any[] = [];
  variableComponents: any[] = [];
  totalCTC=0;
  variableTotal =0;
  headTypes = [{type:"I", value:"Income"}, {type:"D", value:"Deduction"}, {type:"R", value:"Reimbursement"}, {type:"B", value:"Other Benefit"}, , {type:"O", value:"One Time"}, , {type:"V", value:"Variable Pay"}];
  frequency = [{type:"M", value:"Monthly"}, {type:"Q", value:"Quarterly"}, {type:"H", value:"Half-Yearly"}, {type:"A", value:"Annually"}, {type:"D", value:"Daily"}, {type:"O", value:"One Time"}];
  

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private fb: FormBuilder,
    private util: Util,private location: Location) {
    }

  ngOnInit() {
    
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.route.snapshot.paramMap.get('id')!;  
      this.fnfId = this.route.snapshot.paramMap.get('id2')!;  
      if (!this.employeeId || this.employeeId <= 0 || this.fnfId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/fnf/initiate-fnf-list']);
      }
      this.GetEmployeeDetails(this.employeeId);
      this.GetResignationDetails(this.employeeId);
      this.LoadData();
      if (this.fnfId>0)
      {
        this.GetFNFDetailsById(this.fnfId);
        this.isVisible = true;
        this.isEditable = false;
      }
    }
  }

  GetEmployeeDetails(id:any) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;

    });
  }


  settlementDetails: any[] = [];
  GetFNFDetailsById(id:any) {
    this.isVisible=true;
    this.httpService.HRget(APIURLS.FNF_GET_DETAILS_BY_ID+"/"+id).then((data: any) => {
      if (data) {
         this.fnfDetails=data;
         this.settlementDetails=data.fnfSettlementDetailsViewModel;
         this.headList=this.settlementDetails;
         this.calculateTotals();
         this.fnfId = this.fnfDetails.fnfId;
         this.employee.id=this.fnfDetails.submittedToId;
         this.employee.fullName=this.fnfDetails.submittedToName;
         
         if(this.fnfDetails.status!="Pending For Approval" )
         {
           this.isApproved=true;
           this.isEditable = true;
         }
         if(this.fnfDetails.status=="Submitted To Accounts")
         {
           this.isApproved=true;
           this.isSubmitted=true;
         }
         if(this.fnfDetails.status=="Payment Received")
         {
          this.isSubmitted=true;
          this.isPayment=true;
         }
         if(this.fnfDetails.status=="Issued")
         {
          this.isSubmitted=true;
          this.isPayment=true;
          this.isIssued=true;
         }
         this.fnfStatus= this.fnfDetails.status;         
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error(error);
    });
  }

  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_SALARY_DETAILS + "/" + this.employeeId ).then((data: any) => {
      if (data) {
        this.salarydetails = data;
        if(this.salarydetails.headDetails && this.salarydetails.headDetails.length > 0){
          for(var item of this.salarydetails.headDetails){            
            item.salaryTypeName = this.headTypes.find((x:any)  => x.type == item.salaryType).value;
            item.frequencyName = this.frequency.find((x:any)  => x.type == item.frequency).value;
          }
          this.monthlyComponents = this.salarydetails.headDetails.filter((x:any)=>x.salaryType=="I" && x.frequency == "M");
          this.annualComponents = this.salarydetails.headDetails.filter((x:any)=>x.salaryType!="V" && x.frequency == "A");
          this.variableComponents = this.salarydetails.headDetails.filter((x:any)=>x.salaryType =="V");
          this.calculateGrossTotals();
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
    });
  }

  calculateGrossTotals(){
    this.salarydetails.totalIncome = 0;
    this.salarydetails.totalDeductions = 0;
    this.salarydetails.totalOtherBenefits = 0;
    this.salarydetails.totalReimbursements = 0;
    
    for(var i=0; i < this.salarydetails.headDetails.length; i++){
      var head = this.salarydetails.headDetails[i];          
          if(head.salaryType == "I"){          
            this.salarydetails.totalIncome += head.annualAmount;
            this.totalCTC += head.annualAmount;
            if(head.frequency == "M"){
              this.monthlyTotal += head.amount;
              this.monthlyAnnualTotal += head.annualAmount;
            }
          }
          else if(head.salaryType == "D")
            this.salarydetails.totalDeductions += head.annualAmount;        
          else if(head.salaryType == "R"){
            this.salarydetails.totalReimbursements += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
           else if(head.salaryType == "B"){
            this.salarydetails.totalOtherBenefits += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
          else if(head.salaryType == "V"){
            this.variableTotal += head.annualAmount;
          }
    }    
    this.salarydetails.totalCTC = this.salarydetails.totalIncome + this.salarydetails.totalReimbursements + this.salarydetails.totalOtherBenefits;
  }
  diffDays: any;
  GetResignationDetails(id)
  {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RESIGNATION_DATE_GET_BYEMPID, id).then((data: any) => {
      if (data) {
        this.resignationDetails = data;
        this.lastWorkingDate = this.getDateFormate(this.resignationDetails.lastWorkingDate);
        this.resignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
        this.actualLastDate = this.resignationDetails.expectedLastWorkingDate == null ? this.lastWorkingDate : this.getDateFormate(this.resignationDetails.expectedLastWorkingDate);
        this.diffDays=this.calculateDiff(this.lastWorkingDate,this.actualLastDate);
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  
  calculateTotals(){
    this.details.totalEarningsEligible = 0;
    this.details.totalDeductionsEligible = 0;
    this.details.totalEarningsPayable = 0;
    this.details.totalDeductionsPayable = 0;
    this.details.totalEarnings=0;
    this.details.totalDeductions=0;
    this.details.netPayable=0;

    for(var i=0; i < this.headList.length; i++){
      var settlementHead = this.headList[i].type;
      
      if(settlementHead !=undefined){

          if(settlementHead== "Earnings"){
            this.details.totalEarningsPayable += this.headList[i].payableAmount;
            this.details.totalEarningsEligible += this.headList[i].eligibleAmount;
          }
          else if(settlementHead== "Deductions")
          {
            this.details.totalDeductionsPayable += this.headList[i].payableAmount;
            this.details.totalDeductionsEligible += this.headList[i].eligibleAmount;
          }
        }
      }


      this.details.totalPayable=this.details.totalEarningsPayable-this.details.totalDeductionsPayable;
      this.details.totalEligible=this.details.totalEarningsEligible-this.details.totalDeductionsEligible;
      this.details.netPayable=this.details.totalPayable;

    }

    calculateDiff(fromDate,toDate) {
      var date1:any = new Date(fromDate);
      var date2:any = new Date(toDate);
      var diffDays:any = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
  
      return diffDays > 0 ? diffDays : 0;
  }

  goBack()
  {
    this.location.back();
  }
  
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "/" + ("00" + (d1.getMonth() + 1)).slice(-2) + "/" +
      ("00" + d1.getDate()).slice(-2);
  }
  
  showPrevious() {
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  showNext() {
    this.tabIndex++;
    this.currentTab = this.tabsList[this.tabIndex];
  }
 

  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

}


