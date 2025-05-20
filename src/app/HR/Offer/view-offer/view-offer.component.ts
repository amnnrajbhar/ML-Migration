import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Location } from '@angular/common';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { OfferDetails } from '../../models/offerdetails.model';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var require: any;

@Component({
  selector: 'app-view-offer',
  templateUrl: './view-offer.component.html',
  styleUrls: ['./view-offer.component.css']
})
export class ViewOfferComponent implements OnInit {
  offerId: any;
  objectType: string = "Offer Letter";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  offerDetails = {} as OfferDetails;
  isEdit: boolean = false;
  fileList: any[] = [];
  secondSignatoryRequired = false;

  currentTab:string = "salary";
  tabIndex: number = 0;
  tabsList: string[] = ["salary", "additionalInfo", "breakup", "checklist", "attachments"];

  statusList = [
    { type: "Initial", color:"info" },
    { type: "Updated", color:"info" },
    { type: "Pre-joining Email Sent", color:"primary" },
    { type: "Pre-joining Completed", color:"success" },
    { type: "Pending For Approval", color:"info"},    
    { type: "Approved", color:"warning" },            
    { type: "Rejected", color:"danger" },        
    { type: "Pending For Exception Approval", color:"info"},    
    { type: "Exception Rejected", color:"danger" },        
    { type: "Exception Approved", color:"warning" },        
    { type: "Email Sent", color:"warning" },
    { type: "Accepted", color:"primary" },
    { type: "Not Accepted", color:"danger" },   
    { type: "Withdrawn", color:"danger" },
    { type: "Archived", color:"danger" }, 
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.offerId = this.route.snapshot.paramMap.get('id')!;      
      this.LoadOfferDetails(this.offerId);
    }
  }

  LoadOfferDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        //this.fileList = data.attachments;
        if(data.secondSignatoryId > 0){
          this.secondSignatoryRequired = true;
        }
        this.offerDetails.statusColor = this.statusList.find(x=>x.type == data.status).color;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.offerDetails = {} as OfferDetails;
    });
  }

  getFile(id, fileName){
    if(id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_FILE+ "/" + this.offerId + "/"+ id).then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }
  
      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }

  
onPrevious(){    
  this.showPrevious();     
}

onNext(){     
    this.showNext(); 
  }

onTabClick(index){    
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

showPrevious(){
  this.tabIndex--;
  this.currentTab = this.tabsList[this.tabIndex];
}
showNext(){
  this.tabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

  cancel() {
    this.location.back();
  }
  onDataLoaded(){
    $("#tab_"+this.currentTab).addClass("completed");
  }
}
