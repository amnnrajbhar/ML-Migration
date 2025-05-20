import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Resignation } from './resignation.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { ResignationUpdateRequest} from '../resignation-list/resignationupdaterequest.model'
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-resignation',
  templateUrl: './resignation.component.html',
  styleUrls: ['./resignation.component.css'],
  providers: [Util]  
})

export class ResignationComponent implements OnInit {
  currentUser: AuthData;
  employeeId: any;
  resignationId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  resignationStatus :any;
  resignationDetails= {} as Resignation;
  employeeDetails :any={};
  DateToday :Date ;
  DateLastWorkingDay :Date ;
  objectType: string = "Resignation";
  reason = [{ type: "Personal" },{ type: "Better Opportunities" }, { type: "Relocation" }, { type: "Studies" }, { type: "Retiring" }];  
  noticePeriod: string;
  files: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private fb: FormBuilder,
    private util: Util, private location: Location) {
    }

  ngOnInit() {
    this.DateToday = new Date();

    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.route.snapshot.paramMap.get('id')!;  
      this.resignationDetails.hodApproval=true;
      this.resignationDetails.reportingManagerApproval=true;
      if (!this.employeeId || this.employeeId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/separation/resignation-list']);
      }
      this.GetEmployeeDetails(this.employeeId);
      this.onDateOfResignationChange();
    }
  }

  GetEmployeeDetails(id) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;        
        this.noticePeriod = this.employeeDetails.noticePeriod+' Month(s)';
        this.resignationDetails.resignationDate = new Date();
        if(data.employeeCategoryId == 2){
          this.resignationDetails.hodApproval=false;
          this.resignationDetails.reportingManagerApproval=false;
        }
        console.log(this.resignationDetails.resignationDate);
        this.onDateOfResignationChange();
        this.GetResignationDetailsById(this.employeeId);    
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;

    });
  }

  GetResignationDetailsById(id) {
    this.isLoading = true;
    this.isVisible=true;
    this.httpService.HRget(APIURLS.RESIGNATION_STATUS_GET_BYEMPID+"/"+id).then((data: any) => {
      if (data) {
         this.resignationDetails = data;
         this.resignationId = this.resignationDetails.resignationId;
         console.log(this.resignationId);
         this.resignationStatus = this.resignationDetails.status;
         
         if (this.resignationStatus=="Withdrawn" || this.resignationStatus=="Accepted")
         {
          this.resignationDetails = {} as Resignation;
          this.resignationId = 0;
          this.resignationStatus= "";
          this.resignationDetails.resignationDate = new Date();
          this.resignationDetails.hodApproval=true;
          this.resignationDetails.reportingManagerApproval=true;
          if(this.employeeDetails.employeeCategoryId == 2){
            this.resignationDetails.hodApproval=false;
            this.resignationDetails.reportingManagerApproval=false;
          }
          this.onDateOfResignationChange();
         }
         else if (this.resignationStatus=="Rejected")
         {
          this.router.navigate(['/HR/separation/edit-resignation/'+this.resignationId]);
         }
         else{
          toastr.error("Resignation is "+this.resignationStatus);
          this.router.navigate(['/HR/separation/select-employee']);
         }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
    });
  }

  onDateOfResignationChange(){
    if(this.resignationDetails && this.resignationDetails.resignationDate ){  
      
      var lastWorkingDate = new Date(this.resignationDetails.resignationDate.toString());
      lastWorkingDate.setMonth((lastWorkingDate.getMonth()*1) + (this.employeeDetails.noticePeriod * 1));            
      this.resignationDetails.lastWorkingDate = lastWorkingDate;
    }
    else
    {
      var lastWorkingDate = new Date();
      lastWorkingDate.setMonth((lastWorkingDate.getMonth()*1) + (this.employeeDetails.noticePeriod * 1));            
      this.resignationDetails.lastWorkingDate = lastWorkingDate;
    }
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
    if(this.resignationDetails.resignationDate == null || this.resignationDetails.resignationDate == undefined){
      toastr.error("Please select the resignation date."); return;
    }
    if(this.resignationDetails.reason == "" || this.resignationDetails.reason == null || this.resignationDetails.reason == undefined){
      toastr.error("Please select the reason."); return;
    }
    if(this.resignationDetails.reasonDetail == "" || this.resignationDetails.reasonDetail == null || this.resignationDetails.reasonDetail == undefined){
      toastr.error("Please enter the detailed reason."); return;
    }
    if (this.resignationDetails.resignationDate > new Date())
    {
      toastr.error("Resignation Date cannot be after Today's Date.");
      return;
    } 
    if (this.resignationDetails.resignationDate < this.employeeDetails.dateOfJoining)
    {
      toastr.error('Resignation Date cannot be before Joining Date.');
      return;
    }     
      if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      && this.resignationDetails.expectedLastWorkingDate < this.resignationDetails.resignationDate)
      {
        toastr.error('Requested Relieving Date cannot be before Date of Resignation');
        return;
      }
     
      if (this.resignationDetails.actualLastWorkingDate != null && this.resignationDetails.actualLastWorkingDate != undefined 
        && this.resignationDetails.actualLastWorkingDate < this.resignationDetails.resignationDate)
      {
        toastr.error('Actual Relieving Date cannot be before Date of Resignation');
        return;
      }
      // if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      //   && this.resignationDetails.expectedLastWorkingDate < new Date()) {
      //   toastr.error('Expected Relieving Date Cannot Be Less Than Current Date');
      //   return;
      // } 
      // if (this.resignationDetails.expectedLastWorkingDate != null && this.resignationDetails.expectedLastWorkingDate != undefined 
      //   && this.resignationDetails.expectedLastWorkingDate > this.resignationDetails.lastWorkingDate)
      //   {
      //     toastr.error('Expected Relieving Date cannot be after Last Working day.');
      //     return;
      //   }
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
      if ((this.resignationDetails.reasonExpectedDateChange == undefined || this.resignationDetails.reasonExpectedDateChange == '') && this.resignationDetails.expectedLastWorkingDate)
      {
        toastr.error('Enter Reason For Expected Relieving Date Change'); return;
      }
    if(this.resignationDetails.reportingManagerApproval==true || this.resignationDetails.hodApproval==true){
      if(!confirm("Are you sure you want to submit for Reporting Manager / HOD Approval?")) 
        return;
    } 
      this.saveResignationDetails();     
  }  

   saveResignationDetails()
   {
    let connection: any;
    let data:any;
       
    if(confirm("Are you sure you want to submit resignation?"))
    {
      this.isLoading = true;
    this.resignationDetails.employeeId = this.employeeId;
    this.resignationDetails.createdById = this.currentUser.uid;
    this.resignationDetails.resignationDate = this.util.getFormatedDateTime(this.resignationDetails.resignationDate);
    this.resignationDetails.lastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.lastWorkingDate);
    this.resignationDetails.expectedLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.expectedLastWorkingDate);
    this.resignationDetails.actualLastWorkingDate = this.util.getFormatedDateTime(this.resignationDetails.actualLastWorkingDate);
    this.resignationDetails.createdDate = new Date();
    //this.resignationDetails.resignationDate = new Date(Date.UTC(this.resignationDetails.resignationDate.getFullYear(),this.resignationDetails.resignationDate.getMonth(),this.resignationDetails.resignationDate.getDate()));
    
    connection = this.httpService.HRpost(APIURLS.RESIGNATION_CREATE, this.resignationDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully');
            this.resignationDetails.resignationId = data.resignationId;
            this.resignationId = data.resignationId;            
            this.addAttachments();
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving resignation details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving resignation details. Error:' + error);
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
      this.httpService.HRpostAttachmentFile(APIURLS.RESIGNATION_ADD_ATTACHMENTS+"/"+this.resignationDetails.resignationId, formData)
      .then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          { 
            toastr.success('Files uploaded successfully!');
            this.submitForApproval(this.resignationDetails.resignationId);
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
      this.submitForApproval(this.resignationDetails.resignationId);
    }
  }

  submitForApproval(id){        
    var request: any = {};
    request.resignationId = id;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");  
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.RESIGNATION_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for approval.");  
        console.log(this.employeeId);        
        this.router.navigate(['/HR/separation/resignation-list'])   
      
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

  Back(){
    this.location.back();
  }
}
