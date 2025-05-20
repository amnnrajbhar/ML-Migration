import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Termination } from './termination.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { TerminationUpdateRequest} from '../termination-list/terminationupdaterequest.model'
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-termination',
  templateUrl: './termination.component.html',
  styleUrls: ['./termination.component.css'],
  providers: [Util]
})
export class TerminationComponent implements OnInit {
  currentUser: AuthData;
  employeeId: any;
  terminationId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  terminationStatus :any;
  terminationDetails= {} as Termination;
  employeeDetails :any={};
  DateToday :Date ;
  DateLastWorkingDay :Date ;
  objectType: string = "Termination";
  reason = [{ type: "Misconduct" }, { type: "Terminated" }, { type: "Unauthorized Absenteeism" }, { type: "Data Integrity" }];  
  noticePeriod:string;
  files: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private fb: FormBuilder, private util: Util, private location: Location) {
    }

  ngOnInit() {
    this.DateToday=new Date();
    
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.route.snapshot.paramMap.get('id')!;  
      this.terminationDetails.hodApproval=true;
      this.terminationDetails.reportingManagerApproval=true;
      if (!this.employeeId || this.employeeId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/termination/termination-list']);
      }
      this.GetEmployeeDetails(this.employeeId);
    }
  }

  GetEmployeeDetails(id) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        this.noticePeriod = this.employeeDetails.noticePeriod+' Month(s)';
        this.terminationDetails.terminationDate = new Date();     
        this.GetTerminationDetailsById(this.employeeId);    
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  GetTerminationDetailsById(id) {
    this.isLoading = true;
    this.isVisible=true;
    this.httpService.HRget(APIURLS.TERMINATION_STATUS_GET_BYEMPID+"/"+id).then((data: any) => {
      if (data) {
         this.terminationDetails=data;
         this.terminationId = this.terminationDetails.terminationId;
         this.terminationStatus = this.terminationDetails.status;
         
         if (this.terminationStatus=="Withdrawn" || this.terminationStatus=="Accepted")
         {
          this.terminationDetails = {} as Termination;
          this.terminationDetails.terminationDate = new Date();   
          this.terminationDetails.hodApproval=true;
          this.terminationDetails.reportingManagerApproval=true;
          this.terminationId = 0;
          this.terminationStatus= "";
         }
         else if (this.terminationStatus=="Pending For Approval")
         {
          toastr.error("Termination is "+this.terminationStatus);
          this.router.navigate(['/HR/termination/termination-list']);
         }
         else if (this.terminationStatus=="Rejected" || this.terminationStatus=="Submitted")
         {
          this.router.navigate(['/HR/termination/edit-termination/'+this.terminationId]);
         }
         else{
          toastr.error("Termination is "+this.terminationStatus);
          this.router.navigate(['/HR/termination/select-employee']);
         }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
    });
  }

  goBack() {
    this.location.back();
  }
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "/" + ("00" + (d1.getMonth() + 1)).slice(-2) + "/" +
      ("00" + d1.getDate()).slice(-2);
  }
  
  selectFiles(event) {
    this.files = event.target.files;
  }

  submit()
  {
      if (this.terminationDetails.terminationDate > new Date())
      {
        toastr.error("Service Withdrawn Date cannot be after Today's Date");
        return;
      }

      if (this.terminationDetails.terminationDate < new Date(this.employeeDetails.dateOfJoining))
      {
        toastr.error("Service Withdrawn Date cannot be before Date of Joining.");
        return;
      }
      if(this.files.length <= 0){
        toastr.error("Please select atleast one attachment.");
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
      this.saveTerminationDetails();
      
  }  

   saveTerminationDetails()
   {
    let connection: any;
    let data:any;
    
   
    if(confirm("Are you sure you want to submit this service withdrawn request?"))
    {
      this.isLoading = true;    
      this.terminationDetails.terminationDate = this.util.getFormatedDateTime(this.terminationDetails.terminationDate);
      
    this.terminationDetails.employeeId=this.employeeId;
    this.terminationDetails.createdById=this.currentUser.uid;
    this.terminationDetails.createdDate = new Date();
    
    connection = this.httpService.HRpost(APIURLS.TERMINATION_CREATE, this.terminationDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully');
            this.terminationDetails.terminationId = data.terminationId;
            this.terminationId = data.terminationId;            
            this.addAttachments();
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

  addAttachments(){

    if(this.files.length > 0){
      
      const formData = new FormData();  
      var index =0;
      for (const file of this.files) {      
        formData.append("attachments["+index+"]", file);        
        index++;
      }
      this.isLoading = true;      
      toastr.info("Uploading attachment files ...");  
      this.httpService.HRpostAttachmentFile(APIURLS.TERMINATION_ADD_ATTACHMENTS+"/"+this.terminationDetails.terminationId, formData)
      .then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          { 
            toastr.success('Files uploaded successfully!');
            this.submitForApproval(this.terminationDetails.terminationId);
          }
          else
          toastr.error(data.message);
        })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while uploading attachments. Error:' + error);
        });
    }
    else
    {
      this.submitForApproval(this.terminationDetails.terminationId);
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
