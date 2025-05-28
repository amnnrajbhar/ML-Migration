import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FNFDetails } from '../initiate-fnf/fnfdetails.model';
import { CompleteFNFTaskRequest } from '../pending-fnf-list/completeFNFTaskRequest.model'
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
  selector: 'app-pending-fnf-approval',
  templateUrl: './pending-fnf-approval.component.html',
  styleUrls: ['./pending-fnf-approval.component.css'],
  providers:[Util]
})
export class PendingFnfApprovalComponent implements OnInit {
  editAllowed: boolean = true;
  currentUser!: AuthData;
  employeeId: any;
  fnfId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  fnfStatus :any;
  fnfDetails= {} as FNFDetails;
  employeeDetails :any={};
  actualLastDate: any;
  DateToday :Date ;
  objectType: string = "FNF";
  files: any[] = [];
  currentTab: string = "initiate";
  tabIndex: number = 0;
  tabsList: string[] = ["initiate","attachments"];
  types = [{ type: "Earnings" }, { type: "Decductions" }];  
  count = 0;
  heads = [{ head: "Salary" }, { head: "Leave" }, { head: "Bonus" }, { head: "LTA" }, { head: "LWP" }, { head: "Income Tax" }, { head: "EPF" }, { head: "Miscellaneous" }, { head: "Notice Period Deductions" }];  
  headList: any[] = [];
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  resignationDate: any;
  details: any = {};
  taskId: any;
  comments:any;
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
    this.DateToday=new Date();
    
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.fnfId = this.route.snapshot.paramMap.get('id')!;  
      this.taskId = this.route.snapshot.paramMap.get('id2')!;  
      this.employeeId = this.route.snapshot.paramMap.get('id3')!;       
      this.util.canApproveTask(this.taskId, this.currentUser.uid); 
      if (!this.employeeId || this.employeeId <= 0 || this.fnfId <= 0 || this.taskId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/fnf/pending-fnf-list']);
      }
      this.GetEmployeeDetails(this.employeeId);
      this.GetResignationDetails(this.employeeId);
      this.LoadData();
      if (this.fnfId>0)
      {
        this.GetFNFDetailsById(this.fnfId);
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

  isApproved:boolean = false;
  settlementDetails: any[] = [];
  GetFNFDetailsById(id:any) {
    this.isVisible=true;
    this.httpService.HRget(APIURLS.FNF_GET_DETAILS_BY_ID+"/"+id).then((data: any) => {
      if (data) {
         this.fnfDetails=data;
         this.settlementDetails=data.fnfSettlementDetailsViewModel;
         this.headList=this.settlementDetails;
         this.count = this.headList.length;
         console.log(this.count);
         this.calculateTotals();
         this.fnfId = this.fnfDetails.fnfId;
         if(this.fnfDetails.status=="Approved")
         {
           this.isApproved=true;
           this.isVisible=false;
           this.isLoading=false;
         }
         console.log(this.fnfDetails);
         this.fnfStatus= this.fnfDetails.status;
         
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error(error);
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
  calculateTotals(){
    this.details.totalEarningsEligible = 0;
    this.details.totalDeductionsEligible = 0;
    this.details.totalEarningsPayable = 0;
    this.details.totalDeductionsPayable = 0;
    this.details.totalEarnings=0;
    this.details.totalDeductions=0;
    this.details.netPayable=0;
    console.log(this.headList);
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
      //console.log(this.details.totalDeductionsPayable);
      console.log(this.details.totalEarningsEligible);
      this.details.totalPayable=this.details.totalEarningsPayable-this.details.totalDeductionsPayable;
      this.details.totalEligible=this.details.totalEarningsEligible-this.details.totalDeductionsEligible;
      this.details.netPayable=this.details.totalPayable;

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
  approve(){
    
   
    if (this.count<=0)
    {
      toastr.error('Enter Details');
      return;
    } 
    if(this.checkDuplicates()){
      toastr.error("Duplicate Heads not allowed.");
      return;
    }
    if (this.fnfDetails.payableDays==undefined || this.fnfDetails.payableDays==0)
    {
      toastr.error('Enter Payable Days');
      return;
    }

    if(confirm("Are you sure you want to approve/update this?"))
    {
      this.updateFNFDetails();
      var request = {} as CompleteFNFTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.success("Approving...");
      this.httpService.HRpost(APIURLS.FNF_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }else{
            toastr.success("Task Approved successfully.");
            this.location.back();
          }
        }
      }).catch((error)=> {
        toastr.error("Error occured.");
      });
    }
  }
  reject() {

    this.comments = "";
  }

  rejectTask(){     
    if (this.comments==undefined || this.comments=='')
    {
      toastr.error("Enter Reason For Rejection");
      return;
    }   
    if(confirm("Are you sure you want to reject this?"))
    {
      var request = {} as CompleteFNFTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.error("Rejecting...");
      this.httpService.HRpost(APIURLS.FNF_REJECT_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }
          else{
            toastr.success("Task Rejected successfully.");
            $("#ReasonModal").modal("hide");
            this.location.back();
          }
        }
      }).catch((error)=> {
        toastr.error(error);
      });
    }
  }
  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  onAddLineClick(){    
    this.headList.push({});
    console.log(this.headList);
    this.count++;
  }

  RemoveLine(no){
    this.headList.splice(no,1);
    console.log(this.headList);
    this.count--;
    this.calculateTotals();
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  checkDuplicates(){
    var foundDuplicate = false;
    for(var i=0; i < this.headList.length; i++){
      if(this.headList.findIndex(x=>x.head == this.headList[i].head) != i){
        foundDuplicate = true;
      }
    }
    return foundDuplicate;
  }

  updateFNFDetails()
  {
   let connection: any;
   let data:any;
   let msg:any;


   this.isLoading = true;
   this.fnfDetails.fnfSettlement=this.headList;
   this.fnfDetails.employeeId=this.employeeId;
   this.fnfDetails.modifiedById=this.currentUser.uid;
   this.fnfDetails.modifiedDate =new Date();   
   
   connection = this.httpService.HRpost(APIURLS.FNF_UPDATE, this.fnfDetails);
   connection.then(
     (data: any) => {
       this.isLoading = false;       
       if (data == 200 || data.success) 
       {   
         toastr.success(msg);
           this.fnfDetails.fnfId = data.fnfId;
           this.fnfId = data.fnfId;   
       }
       else
       toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
     },
     (err) => {
       this.isLoading = false;
       toastr.error('Error occured while saving fnf details. Error:' + err);
     })
     .catch((error)=> {
       this.isLoading = false;
       toastr.error('Error occured while saving fnf details. Error:' + error);
     });
  
 }
 public onChange(event: any): void {
  this.calculateTotals();
}
}


