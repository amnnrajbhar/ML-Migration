import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { Location } from '@angular/common';
import { AuthData } from '../../../../auth/auth.model';
import { APIURLS } from '../../../../shared/api-url';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { OfferDetails } from '../../../models/offerdetails.model';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var require: any;

@Component({
  selector: 'app-joining-update',
  templateUrl: './joining-update.component.html',
  styleUrls: ['./joining-update.component.css']
})
export class JoiningUpdateComponent implements OnInit {
  @Input() offerId: any;
  objectType: string = "Offer Letter";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  offerDetails = {} as OfferDetails;
  isEdit: boolean = false;
  checklistItems: any[] = [];

  checklistItemId: number = 0;
  comments: string;
  action: string;

  statusList = [
    { type: "Pending", color:"warning" },
    { type: "Completed", color:"success"},
    { type: "Not Applicable", color:"info" },    
    { type: "Cancelled", color:"danger" }    
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.offerId = this.route.snapshot.paramMap.get('id')!;      
      this.LoadOfferDetails();
    }
  }

  LoadOfferDetails() {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, this.offerId).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        this.getChecklistData();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.offerDetails = {} as OfferDetails;
    });
  }

  getChecklistData(){
    this.isLoading = true;    
      this.httpService.HRget(APIURLS.OFFER_GET_SPOC_CHECKLIST_ITEMS+"/"+ this.offerId+"/"+this.currentUser.uid).then((data: any) => {
      if (data) {
        this.checklistItems = data;
        for(var item of this.checklistItems){
          item.statusColor = this.statusList.find(x=>x.type == item.status).color;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.offerDetails = {} as OfferDetails;
    });
  }

  complete(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Completed";
  }
  
  notApplicable(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Not Applicable";
  }

  UpdateChecklist() {

    if(this.action == "Not Applicable" && this.comments == ""){
      swal("Please enter comments.");
      return;
    }
 

    $("#CommentsModal").modal('hide');
    
      var request:any = {};
      request.checklistItemId = this.checklistItemId;
      request.comments = this.comments;
      request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      swal("Updating...");
      this.httpService.HRpost(APIURLS.CHECKLIST_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {          
          this.getChecklistData();
          swal("Successfully updated.");
        } else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
      }).catch(error => {
        swal(error);
      });
  }
  
  cancel() {
    this.location.back();
  }

}
