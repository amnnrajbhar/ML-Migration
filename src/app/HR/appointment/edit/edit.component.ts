import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
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
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  providers: [Util]
})
export class EditComponent implements OnInit {
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
  currentTab: string = "personal";
  completedTabIndex: number = 0;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  successMsg: string = "";
  disableAction: boolean = false;
  tabIndex: number = 0;
  tabsList: string[] = ["personal", "addresses", "family", "education", "work_experience", "languages", "nomination", "bank", "attachments"];

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: Http,
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
      if (data && data.appointmentId > 0) {

        if (data.status != "Details Submitted") {
          this.errMsg = "Edit not allowed, cannot edit details.";
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
      else {
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
        if (this.offerDetails.status == "Withdrawn") {
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

  onPrevious() {
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

  onNext() {
    if (this.currentTab == "personal") {
      this.personalDetails.saveData(null);
    }
    else if (this.currentTab == "addresses") {
      this.addressDetails.saveData();
    }
    else if (this.currentTab == "family") {
      this.familyDetails.saveData();
    }
    else if (this.currentTab == "education") {
      this.educationDetails.saveData();
    }
    else if (this.currentTab == "work_experience") {
      this.workDetails.saveData();
    }
    else if (this.currentTab == "languages") {
      this.languageDetails.saveData();
    }
    else if (this.currentTab == "nomination") {
      this.nominationComponent.saveData();
    }
    else if (this.currentTab == "bank") {
      this.bankDetails.saveData();
    }
    else if (this.currentTab == "attachments") {
      //this.attachmentDetails.saveData();
    }
  }

  onDataSaved(result) {
    if (result == 200 || result.success) {
      this.showNext();
    }
    else
      toastr.error(result.message);
  }

  onDataLoaded() {
    $("#tab_" + this.currentTab).addClass("completed");
  }

  showNext() {
    $("#tab_" + this.currentTab).addClass("completed");
    this.tabIndex++;
    this.completedTabIndex++;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  onDone() {
    this.router.navigate(['/HR/appointment/list']);
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    let connection: any;
    let data: any = {};
    this.isLoading = true;
    data.offerId = this.offerDetails.offerId;
    data.offerGuid = this.guid;
    data.submittedById = this.currentUser.uid;

    toastr.info('Submitting...');

    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SUBMIT_DETAILS, data);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success('Submitted successfully!');
          this.router.navigate(['/HR/appointment/list']);
          this.disableAction = true;
        }
        else {
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

  onTabClick(index) {

    if (index <= this.completedTabIndex && !this.disableAction) {
      this.tabIndex = index;
      this.currentTab = this.tabsList[this.tabIndex];
    }
  }

}

