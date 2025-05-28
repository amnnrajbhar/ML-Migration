import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Retirement } from '../retirement-list/retirement.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { RetirementListFilter } from '../retirement-list/retirementlistfiltermodel';
import { MOMENT } from 'angular-calendar';
import moment from 'moment'
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-retirement-extension',
  templateUrl: './retirement-extension.component.html',
  styleUrls: ['./retirement-extension.component.css'],
  providers:[Util]
})
export class RetirementExtensionComponent implements OnInit {
  currentUser!: AuthData;
  employeeId: any;
  retirementId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isRejected: boolean = false;
  retirementStatus :any;
  retirementDetails= {} as Retirement;
  extensionDetails= {} as any;
  employeeDetails :any={};
  DateToday :Date ;
  RetirementDate:Date;
  DateLastWorkingDay :Date ;
  objectType: string = "Retirement";
  noticePeriod:string;
  files: any[] = [];
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "history"];
  statusList = [
    { type: "Active", color:"info" },    
    { type: "Extended", color:"success" },    
  ]
  applicableDate:Date;
  extensionMonths:any;
  extensionDate:any;

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
      this.retirementDetails.hodApproval=true;
      this.retirementDetails.reportingManagerApproval=true;
      if (!this.employeeId || this.employeeId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/retirement/retirement-list']);
      }
      this.GetEmployeeDetails(this.employeeId);
      this.GetEmployeeRetirementDate(this.employeeId);


    }
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
  this.applicableDate.setDate(this.applicableDate.getDate() - 1);
  this.applicableDate=new Date(this.applicableDate);
  this.retirementDetails.extensionEndDate=this.applicableDate;
}
  GetEmployeeDetails(id:any) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        this.DateLastWorkingDay = new Date(new Date().setMonth(new Date().getMonth() + parseInt(this.employeeDetails.noticePeriod)))
        this.noticePeriod = this.employeeDetails.noticePeriod+' Month(s)';
        
        //this.GetRetirementDetailsById(this.employeeId);    
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;

    });
  }

GetEmployeeRetirementDate(id:any) {
    this.isLoading = true;
   // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.RETIREMENT_EMPLOYEE_GET_DATE, id).then((data: any) => {
      if (data) {
        this.extensionDetails = data;
        this.retirementDetails.months=12;
        this.retirementDetails.dateOfRetirement=data.dateOfRetirement;
        this.retirementDetails.retirementClosureDate=data.retirementClosureDate;
        this.retirementDetails.extensionStartDate =data.extensionStartDate;
        this.applicableDate=new Date(data.extensionStartDate);
        this.applicableDate.setMonth(this.applicableDate.getMonth() + 12);
        this.applicableDate.setDate(this.applicableDate.getDate() - 1);
        this.applicableDate=new Date(this.applicableDate);
        this.retirementDetails.extensionEndDate=this.applicableDate;
        console.log(this.retirementDetails.extensionEndDate);   
        this.GetRetirementDetailsById(this.employeeId);      
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;

    });
  }

  GetRetirementDetailsById(id:any) {
    this.isLoading = true;
    this.isVisible=true;
    this.httpService.HRget(APIURLS.RETIREMENT_STATUS_GET_BYEMPID+"/"+id).then((data: any) => {
      if (data) {
         this.retirementDetails=data;
         this.retirementDetails.hodApproval=true;
         this.retirementDetails.reportingManagerApproval=true;
         this.retirementDetails.extensionStartDate =data.extensionEndDate;
         this.retirementDetails.retirementClosureDate=data.retirementClosureDate;
         this.applicableDate=new Date(data.extensionStartDate);
         this.applicableDate.setMonth(this.applicableDate.getMonth() + 12);
         this.applicableDate.setDate(this.applicableDate.getDate() - 1);
         this.applicableDate=new Date(this.applicableDate);
         this.retirementDetails.extensionEndDate=this.applicableDate;
         this.retirementDetails.retirementId =0;
         this.retirementDetails.remarks='';
         console.log(this.retirementDetails);
         this.retirementStatus= this.retirementDetails.status;
         
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error(error);
    });
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
  
  selectFiles(event) {
    this.files = event.target.files;
  }

  submit()
  {
      if (this.retirementDetails.extensionEndDate<this.DateToday)
      {
        toastr.error('Extended Date Cannot Be Less Than Current Date');
        return;
      }
      if (this.retirementDetails.remarks==undefined || this.retirementDetails.remarks=="")
      {
        toastr.error('Enter Remarks');
        return;
      }
      else
      {
      this.saveRetirementDetails();
      }
  }  

   saveRetirementDetails()
   {
    let connection: any;
    let data:any;
    
   
    if(confirm("Are you sure you want to submit service extension?"))
    {
      this.isLoading = true;
    this.retirementDetails.employeeId=this.employeeId;
    this.retirementDetails.createdById=this.currentUser.uid;
    this.retirementDetails.createdDate = new Date();
    this.retirementDetails.extensionStartDate = this.util.getFormatedDateTime(this.retirementDetails.extensionStartDate);
    this.retirementDetails.extensionEndDate = this.util.getFormatedDateTime(this.retirementDetails.extensionEndDate);
    this.retirementDetails.retirementClosureDate = this.util.getFormatedDateTime(this.retirementDetails.retirementClosureDate);
    this.retirementDetails.modifiedDate=new Date();    
    
    connection = this.httpService.HRpost(APIURLS.RETIREMENT_CREATE, this.retirementDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully');
            this.retirementDetails.retirementId = data.retirementId;
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
        console.log(this.employeeId);        
        this.router.navigate(['/HR/retirement/view-extension-list'])   
      
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
  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

}


