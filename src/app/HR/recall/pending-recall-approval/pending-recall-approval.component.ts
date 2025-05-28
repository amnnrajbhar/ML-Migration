import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Recall } from '../recall/recall.model';
// import { JobChangeDetails } from '../recall/jobChangeDetails.Model';
import { EmployeeSalaryComponent } from '../employee-salary/employee-salary.component';
import { ReadonlyemployeeSalaryComponent } from '../readonlyemployee-salary/readonlyemployee-salary.component';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
import { Resignation } from '../../separation/resignation/resignation.model';
import { NewOffer } from '../../Offer/new-offer/newoffer.model';

declare var $: any;
declare var toastr: any;
declare var require: any;

@Component({
  selector: 'app-pending-recall-approval',
  templateUrl: './pending-recall-approval.component.html',
  styleUrls: ['./pending-recall-approval.component.css'],
  providers: [Util]
})
export class PendingRecallApprovalComponent implements OnInit {
  @ViewChild(ReadonlyemployeeSalaryComponent) employeeSalaryComponent: ReadonlyemployeeSalaryComponent;
  currentUser: AuthData;
  appraisalId: any;
  objectType: string = "Recall";
  employeeId: any;
  employeeRecallId: any;
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
  oldHOD: any;
  newHOD: any;
  oldRM: any;
  newRM: any;
  taskId: any;
  isLoading: boolean = false;
  comments:string;
  recallDetail: any = {};
  isJobDetailsChanged: boolean = false;
  errMsg: string = "";
  errMsgModalPop: string = "";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "jobchange", "salarychange", "attachments","history"];
  currentTab: string = "details";
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  monthlyComponents: any[] = [];
  monthlyTotal = 0;
  monthlyAnnualTotal = 0;
  annualComponents: any[] = [];
  variableComponents: any[] = [];
  onetimeComponents: any[] = [];
  headTypes = [{type:"I", value:"Income"}, {type:"D", value:"Deduction"}, {type:"R", value:"Reimbursement"}, {type:"O", value:"One Time"}, {type:"V", value:"Variable Pay"}, {type:"B", value:"Other Benefit"}];
  frequency = [{type:"M", value:"Monthly"}, {type:"Q", value:"Quarterly"}, {type:"H", value:"Half-Yearly"}, {type:"A", value:"Annually"}, {type:"D", value:"Daily"}, {type:"O", value:"One Time"}];
  recruitmentTypes = [{ type: "New Recruitment" }, {type: "Self Replacement" }, { type: "Replacement" }];
  fileList: any[] = [];
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private fb: FormBuilder,
    private util: Util,private location: Location) {
  }

  ngOnInit() {
    this.employeeRecallId = this.route.snapshot.paramMap.get('id')!;
    this.taskId = this.route.snapshot.paramMap.get('id2')!;
    this.employeeId = this.route.snapshot.paramMap.get('id3')!;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
    this.util.canApproveTask(this.taskId, this.currentUser.uid);
    this.getRecallDetails(this.employeeRecallId);
    this.GetResignationDetails(this.employeeId);
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }

  GetResignationDetails(id)
  {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RESIGNATION_DATE_GET_BYEMPID, id).then((data: any) => {
      if (data) {
        this.resignationDetails = data;
        if(this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != "" && this.resignationDetails.expectedLastWorkingDate != undefined)
          this.lastWorkingDate = this.getDateFormate(this.resignationDetails.expectedLastWorkingDate);
        else
          this.lastWorkingDate = this.getDateFormate(this.resignationDetails.lastWorkingDate);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });

  }
  allowanceDetails: any;
  getRecallDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.RECALL_GET_DETAILS_BY_ID, id).then((data: any) => {
      if (data) {
        this.recallDetail = data;
        this.allowanceDetails = data.allowanceText;
        this.fileList = data.attachments;
        this.employeeId = data.employeeId;
        if(this.recallDetail.recallSalaryHeadDetails && this.recallDetail.recallSalaryHeadDetails.length > 0){
          for(var item of this.recallDetail.recallSalaryHeadDetails){            
            item.salaryTypeName = this.headTypes.find(x => x.type == item.salaryType).value;
            item.frequencyName = this.frequency.find(x => x.type == item.frequency).value;
          }
          this.monthlyComponents = this.recallDetail.recallSalaryHeadDetails.filter(x=>x.salaryType=="I" && x.frequency == "M");
          this.annualComponents = this.recallDetail.recallSalaryHeadDetails.filter(x=>x.salaryType!="V" && x.frequency == "A");
          this.variableComponents = this.recallDetail.recallSalaryHeadDetails.filter(x=>x.salaryType =="V");
          this.onetimeComponents = this.recallDetail.recallSalaryHeadDetails.filter(x=>x.salaryType =="O" && x.frequency == "O");
          this.calculateTotals();
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "Role") != null)
        {
        this.oldRole = this.recallDetail.jobChangeDetails.find(x => x.type == "Role").oldValueText
        this.newRole = this.recallDetail.jobChangeDetails.find(x => x.type == "Role").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory") != null)
        {
        this.oldCategory = this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory").oldValueText
        this.newCategory = this.recallDetail.jobChangeDetails.find(x => x.type == "StaffCategory").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "State") != null)
        {
        this.oldState = this.recallDetail.jobChangeDetails.find(x => x.type == "State").oldValueText
        this.newState = this.recallDetail.jobChangeDetails.find(x => x.type == "State").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "Department") != null)
        {
        this.oldDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "Department").oldValueText
        this.newDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "Department").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "Designation") != null)
        {
        this.oldDesignation = this.recallDetail.jobChangeDetails.find(x => x.type == "Designation").oldValueText
        this.newDesignation = this.recallDetail.jobChangeDetails.find(x => x.type == "Designation").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup") != null)
        {
        this.oldPayGroup = this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup").oldValueText
        this.newPayGroup = this.recallDetail.jobChangeDetails.find(x => x.type == "PayGroup").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "Location") != null)
        {
        this.oldLocation = this.recallDetail.jobChangeDetails.find(x => x.type == "Location").oldValueText
        this.newLocation = this.recallDetail.jobChangeDetails.find(x => x.type == "Location").newValueText
        this.isJobDetailsChanged=true;
        }
        if(this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartment") != null)
        {
        this.oldSubDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartment").oldValueText
        this.newSubDepartment = this.recallDetail.jobChangeDetails.find(x => x.type == "SubDepartment").newValueText
        this.isJobDetailsChanged=true;
        }
          if (this.recallDetail.jobChangeDetails.find(x => x.type == "Plant") != null) {
              this.oldPlant = this.recallDetail.jobChangeDetails.find(x => x.type == "Plant").oldValueText
              this.newPlant = this.recallDetail.jobChangeDetails.find(x => x.type == "Plant").newValueText
              this.isJobDetailsChanged=true;
          }
          if (this.recallDetail.jobChangeDetails.find(x => x.type == "HOD") != null) {
            this.oldHOD = this.recallDetail.jobChangeDetails.find(x => x.type == "HOD").oldValueText
            this.newHOD = this.recallDetail.jobChangeDetails.find(x => x.type == "HOD").newValueText
            this.isJobDetailsChanged=true;
        }
        if (this.recallDetail.jobChangeDetails.find(x => x.type == "ReportingManager") != null) {
          this.oldRM = this.recallDetail.jobChangeDetails.find(x => x.type == "ReportingManager").oldValueText
          this.newRM = this.recallDetail.jobChangeDetails.find(x => x.type == "ReportingManager").newValueText
          this.isJobDetailsChanged=true;
      }
      
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onTabClick(index)
{
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
  console.log(this.currentTab);
}

  approve(){
    
    if(confirm("Are you sure you want to approve this?"))
    {
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.success("Approving...");
      this.httpService.HRpost(APIURLS.RECALL_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }else{
            toastr.success("Task Approved successfully.");
            this.location.back();
          }
        }
      }).catch(error => {
        toastr.error("Error occured.");
      });
    }
  }
  goBack() {
    this.location.back();
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
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.error("Rejecting...");
      this.httpService.HRpost(APIURLS.RECALL_REJECT_TASK, request).then((data: any) => {
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
      }).catch(error => {
        toastr.error(error);
      });
    }
  }

  
  totalCTC = 0;
  variableTotal=0;
  onetimeTotal=0;
  calculateTotals(){
    this.recallDetail.totalIncome = 0;
    this.recallDetail.totalDeductions = 0;
    this.recallDetail.totalOtherBenefits = 0;
    this.recallDetail.totalReimbursements = 0;
    
    for(var i=0; i < this.recallDetail.recallSalaryHeadDetails.length; i++){
      var head = this.recallDetail.recallSalaryHeadDetails[i];          
          if(head.salaryType == "I"){          
            this.recallDetail.totalIncome += head.annualAmount;
            this.totalCTC += head.annualAmount;
            if(head.frequency == "M"){
              this.monthlyTotal += head.amount;
              this.monthlyAnnualTotal += head.annualAmount;
            }
          }
          else if(head.salaryType == "D")
            this.recallDetail.totalDeductions += head.annualAmount;        
          else if(head.salaryType == "R"){
            this.recallDetail.totalReimbursements += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
           else if(head.salaryType == "B"){
            this.recallDetail.totalOtherBenefits += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
          else if(head.salaryType == "V"){
            this.variableTotal += head.annualAmount;
          }
          else if(head.salaryType == "O"){
            this.onetimeTotal += head.annualAmount;
          }
    }    
    this.recallDetail.totalCTC = this.recallDetail.totalIncome + this.recallDetail.totalReimbursements + this.recallDetail.totalOtherBenefits;
  }

}
