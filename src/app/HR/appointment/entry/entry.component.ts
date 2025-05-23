import { Component, Input, OnInit, ViewChild  } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { AppointmentService } from '../../Services/appointmentService.service';
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css'],
  providers: [Util, AppointmentService]
})
export class EntryComponent implements OnInit {
  @ViewChild(PersonalComponent) personalDetails: PersonalComponent;
  @ViewChild(AddressesComponent) addressDetails: AddressesComponent;
  @ViewChild(EducationComponent) educationDetails: EducationComponent;
  @ViewChild(FamilyComponent) familyDetails: FamilyComponent;
  @ViewChild(LanguagesComponent) languageDetails: LanguagesComponent;
  @ViewChild(WorkexperienceComponent) workDetails: WorkexperienceComponent;
  @ViewChild(BankDetailsComponent) bankDetails: BankDetailsComponent;
  @ViewChild(AttachmentsComponent) attachmentDetails: AttachmentsComponent;
  @ViewChild(NominationComponent) nominationComponent: NominationComponent;
  
  safeURL: SafeResourceUrl;
  offerId: any;
  guid: any;
  offerDetails: any = {};
  isLoading: boolean = false;
  showData: boolean = false;
  confirmSubmit: boolean = false;
  completedTabIndex: number = 0;
  currentTab:string = "personal";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  successMsg: string = "";
  disableAction: boolean = false;
  tabIndex: number = 0;
  tabsList: string[] = ["personal","addresses","family","education","work_experience","languages","nomination","bank", "attachments"];

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient,

    private util: Util, private service: AppointmentService,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/WovwuOFBUuY');
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.offerId = this.route.snapshot.paramMap.get('id')!;
      this.guid = this.route.snapshot.paramMap.get('id2')!;      
      this.CheckAppointmentData();        
    }
  }
    
  CheckAppointmentData() {
    this.isLoading = true;

    this.service.getData(APIURLS.CANDIDATE_GET_PERSONAL_DETAILS + "/" + this.offerId + "/" + this.guid).then((data: any) => {
        if(data != null && data.appointmentId > 0 && data.status != "Entry In Progress"){
          this.disableAction = true;
          this.showData = false;    
          this.successMsg = ' Details already submitted.';  
          this.isLoading = false;
        }
        else{
          this.LoadOfferDetails();    
        }
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details.");
    });
  }

  LoadOfferDetails() {
    this.isLoading = true;

    this.service.getData(APIURLS.CANDIDATE_GET_OFFER_BY_ID + "/" + this.offerId + "/" + this.guid).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        if(this.offerDetails.status == "Initial" || this.offerDetails.status == "Withdrawn" || this.offerDetails.status == "Archived"
        || this.offerDetails.status == "Rejected" || this.offerDetails.status == "Pre-joining Completed" || this.offerDetails.status == "Not Accepted"){
          this.errMsg = "Offer is not accepted or withdrawn. Cannot enter details.";
        }
        else {
          this.showData = true;          
          $("#EntryHelpModal").modal("show");
        }
      }
      else
        this.errMsg = "Offer details not found, please check the link.";

      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.errMsg = "Error occurred while fetching details, please check the link.";
      this.offerDetails = {} as OfferDetails;
    });
  }
  
  onPrevious(){
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

onNext(){
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
    //this.attachmentDetails.saveData();
  }  
}

onDataSaved(result){
  if(result == 200 || result.success){
    this.showNext();
  }
  else
  toastr.error(result.message);
}

onDataLoaded(status){
  if(status != undefined && status != null && status != "Entry In Progress" && status != "loaded"){    
    return;
  }
  $("#tab_"+this.currentTab).addClass("completed");
}

showNext(){
  $("#tab_"+this.currentTab).addClass("completed");
  this.tabIndex++;
  this.completedTabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

onSubmit(){
  if (!this.attachmentDetails.validateAttachments())
    return;

  let connection: any;
  let data: any = {};
  
  data.offerId = this.offerDetails.offerId;
  data.offerGuid = this.guid;
  if(!this.confirmSubmit){
    toastr.error("Please check the declaration check box to submit the details.");
    return;
  }
  if(!confirm("Once submitted you won't be able to edit the details. Are you sure you want to sumbit?"))
    return;
    
  this.isLoading = true;
  toastr.info('Submitting...');

  connection = this.service.postData(APIURLS.CANDIDATE_SUBMIT_DETAILS, data);
  connection.then(
    (data: any) => {
      this.isLoading = false;
      if (data == 200 || data.success) {
        this.successMsg = ' Thank you for submitting the details.';  
        toastr.success(this.successMsg);  
        this.disableAction = true;
        this.showData = false;
      }
      else{
        this.errMsgModalPop = data.message;
        toastr.error(this.errMsgModalPop);
      }        
    },
    (err) => {
      this.isLoading = false;
      this.errMsgModalPop = 'Error occured while submitting the details. Error:' + err;
      toastr.error(this.errMsgModalPop);
    })
    .catch(error => {
      this.isLoading = false;
      this.errMsgModalPop = 'Error occured while submitting the details. Error:' + error;
      toastr.error(this.errMsgModalPop);
    });
}

onTabClick(index){
  if(this.disableAction || index <= this.tabIndex ){
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }
}
 

}
