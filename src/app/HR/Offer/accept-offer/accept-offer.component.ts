import { OfferDetails } from '../../models/offerdetails.model';
import { AcceptRequest } from './acceptRequest.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { AppointmentService } from '../../Services/appointmentService.service';
declare var $: any;


@Component({
  selector: 'app-accept-offer',
  templateUrl: './accept-offer.component.html',
  styleUrls: ['./accept-offer.component.css'],
  providers: [Util, AppointmentService]
})
export class AcceptOfferComponent implements OnInit {

  offerId: any;
  guid: any;
  urlPath: string = '';
  successMsg: string = "";
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  showData: boolean = false;
  disableAction: boolean = false;
  offerDetails = {} as OfferDetails;
  acceptOffer = {} as AcceptRequest;

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient, private service: AppointmentService,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.offerId = this.route.snapshot.paramMap.get('id')!;
      this.guid = this.route.snapshot.paramMap.get('id2')!;      
      this.acceptOffer.accept = false;
      this.acceptOffer.reason = "";
      this.LoadOfferDetails(this.offerId);
    }
  }

  LoadOfferDetails(id:any) {
    this.isLoading = true;

    this.service.getData(APIURLS.CANDIDATE_GET_OFFER_BY_ID + "/" + id + "/" + this.guid).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        if(this.offerDetails.status != "Email Sent"){
          this.errMsg = "Offer is already accepted or withdrawn. Cannot fetch details.";
        }
        else
          this.showData = true;
      }
      else
        this.errMsg = "Offer details not found, please check the link.";

      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.errMsg = "Error occurred while fetching details, please check the link.";
      this.offerDetails = {} as OfferDetails;
    });
  }

  submit(accept) {
    let connection: any;
    this.acceptOffer.accept = accept;
    if (!this.acceptOffer.accept && this.acceptOffer.reason.length == 0) {
      swal("Please enter a reason for rejecting the offer.");
      return;
    }
    $("#ReasonModal").modal('hide');
    this.isLoading = true;
    this.acceptOffer.offerId = this.offerDetails.offerId;
    this.acceptOffer.guid = this.guid;
    this.acceptOffer.joiningDate = this.util.getFormatedDateTime(this.offerDetails.joiningDate);
    connection = this.service.postData(APIURLS.CANDIDATE_ACCEPT_OFFER, this.acceptOffer);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          this.successMsg = ' Thanks for confirming.';    
          this.disableAction = true;
        }
        else{
          this.errMsgModalPop = data.message;
          swal(this.errMsgModalPop);
        }        
      },
      (err) => {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while submitting the details. Error:' + err;
        swal(this.errMsgModalPop);
      })
      .catch((error)=> {
        this.isLoading = false;
        this.errMsgModalPop = 'Error occured while submitting the details. Error:' + error;
        swal(this.errMsgModalPop);
      });
  }

}
