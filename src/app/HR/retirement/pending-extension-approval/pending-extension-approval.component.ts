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
  selector: 'app-pending-extension-approval',
  templateUrl: './pending-extension-approval.component.html',
  styleUrls: ['./pending-extension-approval.component.css'],
  providers:[Util]
})
export class PendingExtensionApprovalComponent implements OnInit {
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
  extensionMonths:any;
  DateToday :Date ;
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private fb: FormBuilder,
    private util: Util,private location: Location) {
  }

  ngOnInit() {
    this.DateToday=new Date();
    this.employeeRetirementId = this.route.snapshot.paramMap.get('id')!;
    this.taskId = this.route.snapshot.paramMap.get('id2')!;
    this.employeeId = this.route.snapshot.paramMap.get('id3')!;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
    this.util.canApproveTask(this.taskId, this.currentUser.uid);
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
        this.employeeId = data.employeeId;
      
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  extensionDetails= {} as any;
  applicableDate:Date;
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
    this.router.navigate(['/HR/retirement/pending-extension-list']);
  }

  approve(){
    
    if(confirm("Are you sure you want to approve this?"))
    {
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.success("Approving...");
      this.httpService.HRpost(APIURLS.RETIREMENT_APPROVE_TASK, request).then((data: any) => {
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

  saveRetirementDetails()
  {
   let connection: any;
   let data:any;
   
  
   if(confirm("Are you sure you want to approve this?"))
   {
     this.isLoading = true;
     
     if (this.retirementDetails.extensionEndDate<this.DateToday)
      {
        toastr.error('Extended Date Cannot Be Less Than Current Date');
        return;
      }

   this.retirementDetails.employeeId=this.employeeId;
   this.retirementDetails.modifiedById=this.currentUser.uid;
   this.retirementDetails.createdDate = new Date();
   this.retirementDetails.modifiedDate=new Date();
   this.retirementDetails.extensionStartDate = this.util.getFormatedDateTime(this.retirementDetails.extensionStartDate);
   this.retirementDetails.extensionEndDate = this.util.getFormatedDateTime(this.retirementDetails.extensionEndDate);
   this.retirementDetails.retirementClosureDate = this.util.getFormatedDateTime(this.retirementDetails.retirementClosureDate);
   
   connection = this.httpService.HRpost(APIURLS.RETIREMENT_UPDATE, this.retirementDetails);
   connection.then(
     (data: any) => {
       this.isLoading = false;       
       if (data == 200 || data.success) 
       {   
         toastr.success('Details saved successfully');
           this.retirementDetails.retirementId = data.retirementId;  
           this.approve();        
       }
       else
       toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
     },
     (err) => {
       this.isLoading = false;
       toastr.error('Error occured while approving. Error:' + err);
     })
     .catch(error => {
       this.isLoading = false;
       toastr.error('Error occured while approving. Error:' + error);
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
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      toastr.error("Rejecting...");
      this.httpService.HRpost(APIURLS.RETIREMENT_REJECT_TASK, request).then((data: any) => {
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
  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  getExtensionDate(event :any)
  {
    if (this.retirementDetails.months == undefined)
    {
       this.retirementDetails.months = 0;
    }
    this.extensionMonths=this.retirementDetails.months;
    this.applicableDate=new Date(this.retirementDetails.extensionStartDate);
    this.applicableDate=new Date(this.applicableDate.setMonth(this.applicableDate.getMonth() + parseInt(this.extensionMonths)));
    //this.retirementDetails.extendedDate=this.applicableDate;
    this.applicableDate.setDate(this.applicableDate.getDate() - 1);
    this.applicableDate=new Date(this.applicableDate);
    this.retirementDetails.extensionEndDate=this.applicableDate;
  }

}
