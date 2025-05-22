import { Component, Input, OnInit, ViewChild  } from '@angular/core';
import { Location } from '@angular/common';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { AppointmentService } from '../../Services/appointmentService.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { WorkexperienceComponent } from '../workexperience/workexperience.component';
import { AttachmentsComponent } from '../attachments/attachments.component';
import { NominationComponent } from '../nomination/nomination.component';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-view-full',
  templateUrl: './view-full.component.html',
  styleUrls: ['./view-full.component.css'],
  providers: [Util, AppointmentService]
})

export class ViewFullComponent implements OnInit {
  
  offerId: any;
  objectType: string = "Appointment Letter";
  appointmentId: any;
  guid: any;
  offerDetails: any = {};
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
    private util: Util, private service: AppointmentService, private location: Location) { }

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
        if(data.offerId > 0)
        {
        this.offerId = data.offerId;
        this.guid = data.offerGuid;        
        this.LoadOfferDetails();
        }
        else
        {
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

  onPrevious(){
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

  onBack(){
    this.location.back();
  }

onNext(){
  this.showNext();
}

onDataLoaded(){
  $("#tab_"+this.currentTab).addClass("completed");
}

showNext(){
  this.tabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

onDone(){
  this.router.navigate(['/HR/appointment/list']);
}

onTabClick(index){  
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

}
