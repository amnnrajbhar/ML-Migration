import { Component, Input, OnInit, ViewChild  } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OfferDetails } from '../../models/offerdetails.model';
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
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-confirm-joining',
  templateUrl: './confirm-joining.component.html',
  styleUrls: ['./confirm-joining.component.css'],
  providers: [Util]
})

export class ConfirmJoiningComponent implements OnInit {

  currentUser: AuthData;
  appointmentId: any;
  urlPath: string = '';
  successMsg: string = "";
  errMsg: string = "";
  isLoading: boolean = false;
  showData: boolean = false;
  disableAction: boolean = false;
  confirmJoining:any = {};
  offerId: any;
  objectType: string = "Appointment Letter";
  guid: any;
  offerDetails: any = {};
  fileItem: any = {};
  count: number = 0;
  fileList: any[] = [];
  currentTab:string = "personal";
  completedTabIndex: number = 0;
  tabIndex: number = 0;
  tabsList: string[] = ["personal","addresses","family","education","work_experience","languages","nomination","bank", "attachments", "joining_confirmation"];
  today= new Date();

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;      
      this.confirmJoining.joined = false;
      this.confirmJoining.joiningDate = new Date();
      this.today= new Date();
      this.GetAppointmentData();
    }
      
  }
  

  GetAppointmentData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_DETAILS_BY_ID + "/" + this.appointmentId).then((data: any) => {
      if(data && data.appointmentId > 0)
      {  
        this.showData = true;
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
    console.log('ins man');
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

  onPrevious(){
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

onNext(){
  $("#tab_"+this.currentTab).addClass("completed");
  this.tabIndex++;
  this.completedTabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

onDataLoaded(){
  $("#tab_"+this.currentTab).addClass("completed");
}

onTabClick(index){
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

  submit(){
    let connection: any;
    if (!this.confirmJoining.joined) {
      toastr.error("Please check the box to confirm the joining.");
      return;
    }    
    if(this.confirmJoining.joiningDate == ""){
      toastr.error("Please select the joined date.");
      return;
    }
    if(new Date(this.confirmJoining.joiningDate) > this.today)
    {
        toastr.error("Joined date cannot be greater than today.");
        return;
    } 
    this.confirmJoining.appointmentId = this.appointmentId;
    this.confirmJoining.confirmedById = this.currentUser.uid;
    this.confirmJoining.joiningDate = this.util.getFormatedDateTime(this.confirmJoining.joiningDate);
    
    toastr.info("Confirming the joining...");  
    this.isLoading = true;
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_CONFIRM_JOINING, this.confirmJoining);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {                    
          this.submitForVerification(this.appointmentId);
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

  
  submitForVerification(id){    
      this.isLoading = true;
      var request: any = {};
      request.appointmentId = id;      
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting for verification...");  
      this.httpService.HRpost(APIURLS.APPOINTMENT_SUBMIT_FOR_VERIFICATION, request)
      .then((data: any) => {
        this.isLoading = false;
        if(data == 200 || data.success)
        {       
          toastr.success("Successfully updated details and submitted for verfication.");  
          this.router.navigate(['HR/appointment/joining-list']);
        }else if(!data.success){
          toastr.error(data.message); 
        }else
        toastr.error("Error occurred.");
      }).catch(error => {
        this.isLoading = false;
        toastr.error(error);
      });
  }

  upload(files) {
    
    if (files.length === 0){
      toastr.error("Please select a file.");
      return;
    }      
    
    const formData = new FormData();  
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
      {
        toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if(file.size > (2*1024*1024)){
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
      formData.append(file.name, file);
      this.fileItem.fileName = file.name;
    }
    toastr.info("Uploading...");
    formData.append("offerId", this.offerId.toString() );
    formData.append("guid", this.guid );
    formData.append("type", "Joining Report" );    
    let connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_ATTACHMENT_DETAILS, formData);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.fileItem.attachmentId = data.id;
        this.onAddLineClick();
        toastr.success("Successfully uploaded the file.");
      }
    }).catch(error => {
      //console.log(error);
      toastr.error('Error uploading Files...'+ error);
    })
  }

  getFile(id, fileName){
    if(id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_ATTACHMENT_FILE+ "/" + this.offerId + "/" + this.guid+"/"+ id).then((data: any) => {
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
  
  onAddLineClick(){    
    this.fileList.push(this.fileItem);
    this.count++;
    this.fileItem = {};  
  }

}
