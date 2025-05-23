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
import { OfficialComponent } from '../official/official.component';
import { StatutoryComponent } from '../statutory/statutory.component';
import { SalaryComponent } from '../salary/salary.component';
import { AssetsComponent } from '../assets/assets.component';
import { PersonalComponent } from '../personal/personal.component';
import { AddressesComponent } from '../addresses/addresses.component';
import { EducationComponent } from '../education/education.component';
import { FamilyComponent } from '../family/family.component';
import { LanguagesComponent } from '../languages/languages.component';
import { BankDetailsComponent } from '../bank-details/bank-details.component';
import { WorkexperienceComponent } from '../workexperience/workexperience.component';
import { AttachmentsComponent } from '../attachments/attachments.component';
import { NominationComponent } from '../nomination/nomination.component';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-hr-entry',
  templateUrl: './hr-entry.component.html',
  styleUrls: ['./hr-entry.component.css'],
  providers: [Util]
})

export class HrEntryComponent implements OnInit {
  @ViewChild(OfficialComponent) officialDetails: OfficialComponent;
  @ViewChild(StatutoryComponent) statutoryDetails: StatutoryComponent;
  @ViewChild(SalaryComponent) salaryDetails: SalaryComponent;
  @ViewChild(AssetsComponent) assetsDetails: AssetsComponent;
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
  appointmentDetails : any ={};
  isLoading: boolean = false;
  showData: boolean = true;
  currentTab:string = "official";
  completedTabIndex: number = 0;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  successMsg: string = "";
  disableAction: boolean = false;
  tabIndex: number = 0;
  tabsList: string[] = ["official", "statutory", "salary", "assets", "personal","addresses","family","education","work_experience","languages","nomination","bank", "attachments"];

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient,

    private util: Util, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;      
      this.GetAppointmentData();
    }
  }
  
  
  GetAppointmentData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_DETAILS_BY_ID + "/" + this.appointmentId).then((data: any) => {
      if(data && data.appointmentId > 0)
      {  
        this.appointmentDetails = data;
        if (data.offerId > 0) {
        this.offerId = data.offerId;
        this.guid = data.offerGuid;
        // if(data.status != "Verified"){
        //   this.errMsg = "Details not verified yet, cannot enter details.";
        //   this.isLoading = false;
        //   return;
        // }
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
          this.errMsg = "Offer is withdrawn. Cannot enter details.";
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
    
  nextTabIndex=0;
  onTabClick(index){
    this.nextTabIndex = index;
    this.Save();    
  }

  onPrevious(){
    this.nextTabIndex = this.tabIndex-1;
    this.Save();
  }

  onNext(){
    this.nextTabIndex = this.tabIndex+1;
    this.Save();
  }
  
  goBack() {
    this.location.back();
  }

Save(){
  if(this.currentTab == "official"){
    this.officialDetails.saveData();    
    //this.showNext();
  }
  else if(this.currentTab == "statutory"){
    this.statutoryDetails.saveData();   
  }
  else if(this.currentTab == "salary"){
    this.salaryDetails.saveData();   
  }
  else if(this.currentTab == "assets"){
    this.assetsDetails.saveData();   
  }
  else if(this.currentTab == "personal"){
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
    //this.attachmentDetails.saveData();
  }  
}

onDataSaved(result){
  if(result == 200 || result.success){    
    this.showTab();
  }
  else
  toastr.error(result.message);
}

onDataLoaded(){
  $("#tab_"+this.currentTab).addClass("completed");
}

showTab(){
  $("#tab_"+this.currentTab).addClass("completed");
  
  this.tabIndex = this.nextTabIndex;  
  this.currentTab = this.tabsList[this.tabIndex];
}

onDone(){
  this.router.navigate(['/HR/appointment/list']);
}

onSubmit(){
  if (!this.attachmentDetails.validateAttachments())
    return;

  let connection: any; 
  if(!confirm("Are you sure you want to submit for approval?"))
    return;
    
  this.isLoading = true;
  toastr.info('Submitting...');
  var request: any = {};
  request.appointmentId = this.appointmentId;      
  request.submittedById = this.currentUser.uid;
  connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SUBMIT_FOR_APPROVAL, request);
  connection.then(
    (data: any) => {
      this.isLoading = false;
      if (data == 200 || data.success) {
        toastr.success("Successfully submitted for approval.");  
        this.router.navigate(['/HR/appointment/list']);
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
