import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-self-retirement',
  templateUrl: './self-retirement.component.html',
  styleUrls: ['./self-retirement.component.css']
})
export class SelfRetirementComponent implements OnInit {
  currentUser!: AuthData;
  isLoading: boolean = false;
  retirementDetails= {} as any;
  retirementId: any;
  employeeId: any;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private fb: FormBuilder,
    private location: Location) { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.GetRetirementDetailsById(this.currentUser.hrEmployeeId);
    this.GetEmployeeRetirementDate(this.currentUser.hrEmployeeId);
    this.employeeId = this.currentUser.hrEmployeeId;
  }

  GetRetirementDetailsById(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.RETIREMENT_DETAILS_BY_EMPLOYEE_ID, id).then((data: any) => {
      if (data) {
         this.retirementDetails=data;
         this.retirementId = this.retirementDetails.retirementId;
         console.log(this.retirementId);
         
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error(error);
    });
  }

  
GetEmployeeRetirementDate(id:any) {
  this.isLoading = true;
 // this.isVisible=false;
  this.httpService.HRgetById(APIURLS.RETIREMENT_EMPLOYEE_GET_DATE, id).then((data: any) => {
    if (data) {           
      this.retirementDetails.dateOfRetirement = data.dateOfRetirement;
      this.retirementDetails.retirementClosureDate = data.retirementClosureDate;    
    }
    this.isLoading = false;
  }).catch((error)=> {
    this.isLoading = false;

  });
}

  selfRetirement()
  {
    let connection: any;
    let data:any;
    
   
    if(confirm("Are you sure you want to request retirement?"))
    {
      this.isLoading = true;
      let request: any = {};
      request.employeeId=this.currentUser.hrEmployeeId;
      request.dateOfRetirement = this.retirementDetails.dateOfRetirement;
      request.retirementClosureDate = this.retirementDetails.retirementClosureDate; 
      request.createdById=this.currentUser.uid;
      request.createdDate = new Date();
      request.extensionStartDate = new Date();
      request.extensionEndDate = new Date();
      request.retirementClosureDate = new Date();
      request.modifiedDate=new Date();    
      request.remarks = this.retirementDetails.remarks;
      request.hodApproval = true;
      request.reportingManagerApproval = true;
      connection = this.httpService.HRpost(APIURLS.RETIREMENT_CREATE, request);
      connection.then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          {   
            toastr.success('Details saved successfully');
              //this.retirementDetails.retirementId = data.retirementId;
              this.retirementId = data.retirementId;   
              this.submitForApproval(this.retirementId);        
          }
          else
          toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while saving retirement details. Error:' + err);
        })
        .catch((error)=> {
          this.isLoading = false;
          toastr.error('Error occured while saving retirement details. Error:' + error);
        });
    }
  }
  
  submitForApproval(id){        
    var request: any = {};
    request.retirementId = id;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");  
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.RETIREMENT_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for approval.");            
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

}
