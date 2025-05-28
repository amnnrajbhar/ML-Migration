import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FNFDetails } from '../../fnf/initiate-fnf/fnfdetails.model';
import { FNFSettlement } from '../../fnf/initiate-fnf/fnfsettlement.model';
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
  selector: 'app-edit-fnf',
  templateUrl: './edit-fnf.component.html',
  styleUrls: ['./edit-fnf.component.css'],
  providers:[Util]
})
export class EditFnfComponent implements OnInit {
  editAllowed: boolean = true;
  currentUser!: AuthData;
  employeeId: any;
  fnfId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = false;
  isEditable: boolean = true;
  isRejected: boolean = false;
  isApproved:boolean = false;
  isSubmitted:boolean = false;
  isPayment:boolean=false;
  isIssued:boolean=false;
  fnfStatus :string;
  fnfDetails= {} as FNFDetails;
  employeeDetails :any={};
  DateToday :Date ;
  objectType: string = "FNF";
  files: any[] = [];
  currentTab: string = "initiate";
  tabIndex: number = 0;
  tabsList: string[] = ["initiate","submit", "payment", "issue","attachments"];
  types = [{ type: "Earnings" }, { type: "Deductions" }];  
  modes = [{ mode: "Cheque" }, { mode: "DD" }];  
  issuemodes = [{ issuemode: "In Person" }, { issuemode: "Courier" }];  
  count = 0;
  heads = [{ head: "Salary" }, { head: "Leave" }, { head: "Bonus" }, { head: "LTA" }, { head: "LWP" },{ head: "Income Tax" }, { head: "EPF" }, { head: "Miscellaneous" }, { head: "Notice Period Deductions" }];  
  headList: any[] = [];
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  resignationDate: any;
  actualLastDate: any;
  details: any = {};
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
      this.employeeId = this.route.snapshot.paramMap.get('id')!;  
      this.fnfId = this.route.snapshot.paramMap.get('id2')!;  
      if (!this.employeeId || this.employeeId <= 0)
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
        console.log(this.fnfDetails.status);
        if (this.fnfDetails.status== "Pending For Approval")
        {
          toastr.error("FNF Is Pending For Approval");
          this.router.navigate(['/HR/fnf/initiate-fnf-list']);
        }
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
         this.count=this.settlementDetails.length;
         this.headList=this.settlementDetails;
         this.calculateTotals();
         this.fnfId = this.fnfDetails.fnfId;
         this.employee.id=this.fnfDetails.submittedToId;
         $("#employeeId").val(this.fnfDetails.submittedToId);
         let empId = $('#employeeId').val();
         console.log(empId);
         this.employee.fullname=this.fnfDetails.submittedToName;
         if (this.fnfDetails.submittedDate==undefined)
         {
           this.fnfDetails.submittedDate=this.DateToday;
         }
         if (this.fnfDetails.chequeDate==undefined)
         {
           this.fnfDetails.chequeDate=this.DateToday;
         }
         if (this.fnfDetails.issueDate==undefined)
         {
           this.fnfDetails.issueDate=this.DateToday;
         }
         if (this.fnfDetails.receiptDate==undefined)
         {
           this.fnfDetails.receiptDate=this.DateToday;
         }
         if (this.fnfDetails.status== "Pending For Approval")
        {
          toastr.error("FNF Is Pending For Approval");
          this.router.navigate(['/HR/fnf/view-fnf-list']);
        }
        if(this.fnfDetails.status=="Rejected")
        {
         this.isEditable=true;
        }
        else if(this.fnfDetails.status=="Submitted")
        {
         this.isEditable=true;
        }
         else if(this.fnfDetails.status!="Pending For Approval" )
         {
           this.isApproved=true;
           this.isEditable = false;
           this.isVisible=false;
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
         if(this.fnfDetails.status=="Issued" || this.fnfDetails.status=="Email Sent")
         {
          this.isEditable=false;
         }
        
         this.fnfStatus= this.fnfDetails.status;

      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error(error);
    });
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
  
  calculateDiff(fromDate,toDate) {
    var date1:any = new Date(fromDate);
    var date2:any = new Date(toDate);
    var diffDays:any = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));

    return diffDays;
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
    let empId = $('#employeeId').val();
    console.log(empId);
    this.tabIndex++;
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
  isEmailValid:boolean=false;
  validateEmail(email:any)
  {
    const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

    this.isEmailValid = expression.test(email);
    
    console.log('e-mail is ' + (this.isEmailValid  ? 'correct' : 'incorrect'));
  }
  submit()
  {
    let empId = $('#employeeId').val();
    if (empId>0 )
    {
    this.fnfDetails.submittedToId=empId;
    }

    if (this.currentTab=='issue')
    {
      this.validateEmail(this.fnfDetails.issuingPersonEmail);
      if (this.isEmailValid==false && this.fnfDetails.modeOfIssue=='In Person')
      {
        toastr.error("Enter Valid Email Id");
        return;
      }
    }
    if (this.isApproved && this.isSubmitted && this.isPayment)
    {
      if(this.fnfDetails.modeOfIssue == undefined || this.fnfDetails.modeOfIssue == null){
        toastr.error('Select Mode of Issue.');
        return;
      }
      if (this.getDateFormate(this.fnfDetails.issueDate)>this.getDateFormate(this.DateToday) || this.fnfDetails.issueDate==undefined)
      {
        toastr.error('Issued Date Cannot Be Greater Than Current Date Or Null');
        return;
      }
      this.fnfDetails.status="Issued";
      this.updateFNFDetails();
      return;      
    }
    if (this.isApproved && this.isSubmitted)
    {
      if (this.getDateFormate(this.fnfDetails.receiptDate)>this.getDateFormate(this.DateToday) || this.fnfDetails.receiptDate==undefined)
      {
        toastr.error('Receipt Date Cannot Be Greater Than Current Date Or Null');
        return;
      }
      if (this.fnfDetails.modeOfPayment == undefined || this.fnfDetails.modeOfPayment==null)
      {
        toastr.error('Select mode of payment.');
        return;
      }
      this.fnfDetails.status="Payment Received";
      this.updateFNFDetails();
      return;
    }
    else if (this.isApproved)
    {
      if (this.getDateFormate(this.fnfDetails.submittedDate)>this.getDateFormate(this.DateToday) || this.fnfDetails.submittedDate==undefined)
      {
        toastr.error('Submission Date Cannot Be Greater Than Current Date Or Null');
        return;
      }
      this.fnfDetails.status="Submitted To Accounts";      
      this.updateFNFDetails();
      return;
    }
   
    this.fnfDetails.fnfSettlement=this.headList;
    
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
      else
      {
        this.saveFNFDetails();
      }
  }  
  updateFNFDetails()
  {
   let connection: any;
   let data:any;
   let msg:any;
   if (this.isApproved)
   {
     msg = 'Submitted To Accounts successfully';
   }
   if (this.isPayment)
   {
     msg = 'Payment details Updated';
   }
   if (this.isIssued)
   {
     msg = 'Issued To Candidate';
   }
   if(confirm("Would you like to Update details?"))
   {
   this.isLoading = true;
   this.fnfDetails.employeeId=this.employeeId;
   this.fnfDetails.createdById=this.currentUser.uid;
   this.fnfDetails.modifiedById=this.currentUser.uid;
   this.fnfDetails.createdDate = new Date();
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
           this.router.navigate(['/HR/fnf/view-fnf-list'])   
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
 
 }
   saveFNFDetails()
   {
    let connection: any;
    let data:any;
    
   
    if(confirm("Do you want to submit fnf?"))
    {
      this.isLoading = true;
    this.fnfDetails.employeeId=this.employeeId;
    this.fnfDetails.createdById=this.currentUser.uid;
    this.fnfDetails.createdDate = new Date();
    this.fnfDetails.modifiedDate=new Date();
    this.fnfDetails.netAmt = this.details.netPayable;
    
    
    connection = this.httpService.HRpost(APIURLS.FNF_UPDATE, this.fnfDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details updated successfully');
            //this.fnfDetails.fnfId = data.fnfId;
            //this.fnfId = data.fnfId;   
            this.submitForApproval(this.fnfId);        
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
  
  }
  public onChange(event: any): void {
    this.calculateTotals();
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
    
  

  submitForApproval(id){        
    var request: any = {};
    request.fnfId = id;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");  
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.FNF_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for approval.");  
        this.router.navigate(['/HR/fnf/view-fnf-list'])   
      
      }else if(!data.success){
        toastr.error(data.message); 
      }else
        toastr.error("Error occurred.");
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error(error);
    });    
  }

  employee:any={};
  lastReportingkeydown = 0;
  getEmployeeName($event) {
    let text = $('#employeeName').val();

    if (text.length >= 2) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST +"/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#employeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else{
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else{
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }
  onTabClick(index) {
    if (index==4)
    {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    }
  }

}


