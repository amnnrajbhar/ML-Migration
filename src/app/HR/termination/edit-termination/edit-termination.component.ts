import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { Termination } from '../termination/termination.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import swal from 'sweetalert';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { TerminationUpdateRequest } from '../termination-list/terminationupdaterequest.model';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';

declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-edit-termination',
  templateUrl: './edit-termination.component.html',
  styleUrls: ['./edit-termination.component.css'],
  providers:[Util]
})
export class EditTerminationComponent implements OnInit {
  currentUser: AuthData;
  terminationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isRejected: boolean = false;
  isEditAllowed: boolean = false;
  isWithdrawAllowed: boolean = false;  
  terminationStatus :any;
  
  terminationDetails= {} as Termination;
  employeeDetails :any={};
  DateToday :Date ;
  DateLastWorkingDay :string ;
  currentTab:string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments","checklist","exitinterview", "history"];
  objectType: string = "Termination";
  fileList: any[] = [];
  noticePeriod: string;
  action: string;
  comments: string;
  reason = [{ type: "Misconduct" }, { type: "Terminated" }, { type: "Unauthorized Absenteeism" }, { type: "Data Integrity" }];  
  files: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, 
    private util: Util, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.terminationId = this.route.snapshot.paramMap.get('id')!;  
      this.GetTerminationDetailsById(this.terminationId);    
      
    }
  }

  GetTerminationDetailsById(id) {
    this.isLoading = true;
   
    this.httpService.HRget(APIURLS.TERMINATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
         this.terminationDetails=data;
         this.fileList = data.attachments;
         this.employeeId = data.employeeId;
         this.terminationStatus= this.terminationDetails.status;
         this.noticePeriod = this.terminationDetails.noticePeriod+' Month(s)';
         if (this.terminationStatus == "Submitted" || this.terminationStatus == "Pending For Approval") {
          this.isWithdrawAllowed = true;
        }
        else if (this.terminationStatus == "Rejected") {
          this.isEditAllowed = true;
          this.isRejected = true;
        }
        else {
          this.isEditAllowed = false;
          this.isWithdrawAllowed = false;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg= error;
    });
  }

onTabClick(index)
{
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  Back(){
    this.location.back();
  }

  withdraw() {
    this.comments = "";
    this.action = "Withdrawn";
  }


  performTask() {
    var confirmMsg = this.action == "Withdrawn" ? "Are you sure you want to withdraw this?"
      : "Are you sure you want to Accept Rejection?";

    $("#CommentsModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request = {} as TerminationUpdateRequest;
      request.id = this.terminationDetails.terminationId;
      request.comments = this.comments;
      request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      toastr.info("Updating...");
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.TERMINATION_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully " + this.action);
          this.router.navigate(['/HR/termination/termination-list']);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred.");
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error(error);
      });
    }
  }

  submit()
  {
    if (this.terminationDetails.terminationDate > new Date())
    {
      toastr.error("Service Withdrawn Date cannot be after Today's Date");
      return;
    }

    if (this.terminationDetails.terminationDate < new Date(this.terminationDetails.dateOfJoining))
    {
      toastr.error("Service Withdrawn Date cannot be before Date of Joining.");
      return;
    }
      for (const file of this.files) {
        var ext = file.name.split('.').pop();
        if(ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
        {
          toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
          return;
        }
        if(file.size > (2*1024*1024)){
          toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
          return;
        }      
      }
      this.editTerminationDetails();
      
  }  

   editTerminationDetails()
   {
    let connection: any;
    let data:any;
    
   
    if(confirm("Are you sure you want to submit this request?"))
    {
      this.isLoading = true;
      this.terminationDetails.terminationDate = this.util.getFormatedDateTime(this.terminationDetails.terminationDate);
      this.terminationDetails.employeeId=this.employeeId;
      this.terminationDetails.terminationId=this.terminationId;    
      this.terminationDetails.modifiedById=this.currentUser.uid;
    
    connection = this.httpService.HRpost(APIURLS.TERMINATION_UPDATE, this.terminationDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully');
           // this.terminationDetails.terminationId = data.terminationId;
           // this.terminationId = data.terminationId;            
           this.submitForApproval(this.terminationDetails.terminationId);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving service withdrawn details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving service withdrawn details. Error:' + error);
      });
   }
  
  }

  submitForApproval(id){        
    var request: any = {};
    request.terminationId = id;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");  
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.TERMINATION_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for approval.");  
        console.log(this.employeeId);        
        this.router.navigate(['/HR/termination/termination-list'])   
      
      }else if(!data.success){
        toastr.error(data.message); 
      }else
        toastr.error("Error occurred.");
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error(error);
    });    
  }

}