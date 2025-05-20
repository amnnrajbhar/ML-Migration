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
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appointment-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css'],
  providers: [Util, AppointmentService]
})
export class AcceptComponent implements OnInit {

  appointmentId: any;
  guid: any;
  details:any = {};
  isLoading: boolean = false;
  showData: boolean = false;
  urlPath: string = '';
  errMsg: string = "";
  successMsg: string = "";
  disableAction: boolean = false;
  acceptDetails:any = {};

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: Http,
    private util: Util, private service: AppointmentService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;
      this.guid = this.route.snapshot.paramMap.get('id2')!;      
      this.GetAppointmentData();
    }
  }

  
  GetAppointmentData() {
    this.isLoading = true;

    this.service.getData(APIURLS.CANDIDATE_GET_APPOINTMENT_LETTER_FOR_PRINT + "/" + this.appointmentId + "/" + this.guid).then((data: any) => {
        if(data != null && data.status != "Letter Sent"){          
          this.disableAction = true;
          this.errMsg = 'Details not available or it is already accepted.';  
          this.isLoading = false;
        }
        else if(data != null){
          this.details = data;
          this.showData = true;
        }  
    }).catch(error => {
      this.isLoading = false;
      swal("Error occurred while fetching details.");
    });
  }
  
  
  submit(accept) {
    let connection: any;
    this.acceptDetails.accept = accept;
    if (!this.acceptDetails.accept && this.acceptDetails.reason.length == 0) {
      toastr.error("Please enter a reason for rejecting the Appointment.");
      return;
    }
    this.isLoading = true;
    this.acceptDetails.appointmentId = this.appointmentId;
    this.acceptDetails.guid = this.guid;
    
    connection = this.service.postData(APIURLS.CANDIDATE_ACCEPT_APPOINTMENT, this.acceptDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          this.successMsg = 'Thanks for confirming.';    
          this.disableAction = true;
          this.showData = false;
        }
        else{
          swal(data.message);
        }        
      },
      (err) => {
        this.isLoading = false;
        swal("Error occurred: "+err);
      })
      .catch(error => {
        this.isLoading = false;
        swal("Error occurred: "+error);
      });
  }
}
