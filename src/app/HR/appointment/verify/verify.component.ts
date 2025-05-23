import { Component, Input, OnInit, ViewChild  } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { OfferDetails } from '../../models/offerdetails.model';
import { PersonalComponent } from '../personal/personal.component';
import { AddressesComponent } from '../addresses/addresses.component';
import { EducationComponent } from '../education/education.component';
import { FamilyComponent } from '../family/family.component';
import { LanguagesComponent } from '../languages/languages.component';
import { BankDetailsComponent } from '../bank-details/bank-details.component';
import { WorkexperienceComponent } from '../workexperience/workexperience.component';
import { AttachmentsComponent } from '../attachments/attachments.component';
import { NominationComponent } from '../nomination/nomination.component';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
  providers: [Util]
})
export class VerifyComponent implements OnInit {
  @ViewChild(PersonalComponent) personalDetails: PersonalComponent;
  @ViewChild(AddressesComponent) addressDetails: AddressesComponent;
  @ViewChild(EducationComponent) educationDetails: EducationComponent;
  @ViewChild(FamilyComponent) familyDetails: FamilyComponent;
  @ViewChild(LanguagesComponent) languageDetails: LanguagesComponent;
  @ViewChild(BankDetailsComponent) bankDetails: BankDetailsComponent;
  @ViewChild(WorkexperienceComponent) workDetails: WorkexperienceComponent;
  @ViewChild(AttachmentsComponent) attachmentDetails: AttachmentsComponent;
  @ViewChild(NominationComponent) nominationComponent: NominationComponent;

  offerId: any;
  objectType: string = "Appointment Letter";
  appointmentId: any;
  guid: any;
  offerDetails: any = {};
  isLoading: boolean = false;
  showData: boolean = true;
  currentTab:string = "personal";
  completedTabIndex: number = 0;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  successMsg: string = "";
  disableAction: boolean = false;
  tabIndex: number = 0;
  tabsList: string[] = ["personal","addresses","family","education","work_experience","languages","nomination","bank", "attachments", "verify"];

  confirmVerified: any = {};  
  taskId: any;
  
  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;
      this.taskId = this.route.snapshot.paramMap.get('id2')!;
      this.util.canApproveTask(this.taskId, this.currentUser.uid);
      this.confirmVerified.verified = false;
      this.GetAppointmentData();
    }
  }

  GetAppointmentData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_DETAILS_BY_ID + "/" + this.appointmentId).then((data: any) => {
      if(data && data.appointmentId > 0)
      {  
       
        if(data.status != "Pending Verification"){
          this.errMsg = "Verification not allowed, cannot edit details.";
          this.isLoading = false;
          return;
        }
        if (data.offerId > 0) {
        this.offerId = data.offerId;
        this.guid = data.offerGuid;
        this.LoadOfferDetails();
      }
      else {
        this.isLoading = false;
      }
      }
      else{
        this.isLoading = false;
        toastr.error("Appointment details not found.");
      }
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details.");
    });
  }

  LoadOfferDetails() {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, this.offerId).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        if(this.offerDetails.status == "Withdrawn"){
          this.errMsg = "Offer is withdrawn. Cannot edit details.";
          this.showData = false;
        }
        else
          this.showData = true;
      }
      //else
        //this.errMsg = "Offer details not found.";

      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.errMsg = "Error occurred while fetching details, please check the link.";
      this.offerDetails = {} as OfferDetails;
    });
  }

  
  action = "";
  onPrevious(){
    this.action="Previous";
    this.saveData();     
  }

onNext(){  
  this.action="Next";
  this.saveData(); 
}

onBack()
{
    this.router.navigate(['/HR/offer/pending-tasks']);
}

saveData(){
  if(this.currentTab == "personal"){
    this.personalDetails.saveData(null);    
  }
  else if(this.currentTab == "addresses"){
    this.addressDetails.saveData();
  }
  else if(this.currentTab == "family"){
    this.familyDetails.saveData();
  }
  else if(this.currentTab == "education"){
    this.educationDetails.saveData();
  }
  else if(this.currentTab == "work_experience"){
    this.workDetails.saveData();
  }
  else if(this.currentTab == "languages"){
    this.languageDetails.saveData();
  }
  else if(this.currentTab == "nomination"){
    this.nominationComponent.saveData();
  }
  else if(this.currentTab == "bank"){
    this.bankDetails.saveData();
  }
  else if(this.currentTab == "attachments"){
    this.attachmentDetails.saveData(); 
  }  
  else if (this.currentTab == "verify")
  this.onDataSaved(200);
}

onDataSaved(result){
  if(result == 200 || result.success){
    if(this.action=="Next")
      this.showNext();
    else if(this.action=="Previous")
      this.showPrevious();
    else
    {
      $("#tab_"+this.currentTab).addClass("completed");
      this.currentTab = this.tabsList[this.tabIndex];
    }
    this.action="";
  }
  else
  toastr.error(result.message);
}

onDataLoaded(){
  $("#tab_"+this.currentTab).addClass("completed");
}

showPrevious(){
  $("#tab_"+this.currentTab).addClass("completed");
  this.tabIndex--;
  this.completedTabIndex--;
  this.currentTab = this.tabsList[this.tabIndex];
}
showNext(){
  $("#tab_"+this.currentTab).addClass("completed");
  this.tabIndex++;
  this.completedTabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

onDone(){
  this.router.navigate(['/HR/offer/pending-tasks']);
}
  
onTabClick(index){    
  this.tabIndex = index;  
  this.saveData();    
}

  submit(){
    let connection: any;
    if (!this.confirmVerified.verified) {
      toastr.error("Please check the box to confirm the verification.");
      return;
    }
    this.isLoading = true;
    this.confirmVerified.appointmentId = this.appointmentId;
    this.confirmVerified.taskId = this.taskId;
    this.confirmVerified.verifiedById = this.currentUser.uid;
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_UPDATE_VERIFIED, this.confirmVerified);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success('Thanks for verifying details.');          
          this.router.navigate(['HR/offer/pending-tasks']);
        }
        else{
          toastr.error(data.message);
        }        
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while submitting the details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while submitting the details. Error:' + error);
      });
  }

}
