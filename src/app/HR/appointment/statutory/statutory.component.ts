import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import swal from 'sweetalert';
declare var toastr: any;

@Component({
  selector: 'app-appointment-statutory',
  templateUrl: './statutory.component.html',
  styleUrls: ['./statutory.component.css'],
  providers: [AppointmentService, Util]
})
export class StatutoryComponent implements OnInit {
  @ViewChild('statutoryDetailsForm')
  private statutoryDetailsForm: NgForm;
  @Input() appointmentId: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  details:any = {};
  officialDetails: any = {};
  isLoading: boolean = false;
  currentUser: AuthData;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));     
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.isLoading = true;
      this.LoadData();
      this.getOfficialDetails();
    }
  }

  
  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_STATUTORY_DETAILS + "/" + this.appointmentId).then((data: any) => {
      if (data) {
        this.details = data;        
        if(data != null && data.appointmentStatutoryDetailsId > 0)
          this.dataLoaded.emit(data.appointmentStatutoryDetailsId);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.details = {};
    });
  }
  
  saveData(){
    
    if(!this.validate()) return;

    let connection: any;
    //this.isLoading = true;
    this.details.appointmentId = this.appointmentId;
    this.details.updatedById = this.currentUser.uid;
    this.details.dateOfJoining = this.util.getFormatedDateTime(this.details.dateOfJoining);
    if(this.details.dateOfConfirmation != "")
      this.details.dateOfConfirmation = this.util.getFormatedDateTime(this.details.dateOfConfirmation);
    
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_STATUTORY_DETAILS, this.details);
    
    toastr.info('Saving...');

    connection.then(
      (data: any) => {
        //this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');
            this.dataSaved.emit(data);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        //this.isLoading = false;
        toastr.error('Error occured while saving the details. Error:' + err);
      })
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving the details. Error:' + error);
      });
  }

  getOfficialDetails(){
    this.isLoading = false;
    if(this.appointmentId > 0){      
      this.isLoading = true;

      this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFICIAL_DETAILS + "/" + this.appointmentId)
      .then((data: any) => {
        if (data) {
          this.officialDetails = data;          
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching official details.");
      });
    }
  }

//   offerDetails: any;
//   getOfferData(){
//     let  conn;
//     this.isLoading = true;
    
//     conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFER_BY_APPOINTMENT_ID + "/" + this.appointmentId);

//     conn.then((data: any) => {
//       if (data) {
//         this.offerDetails = data;          
//       }
//       else
//         toastr.error("Offer details not found, please check the link.");

//       this.isLoading = false;
//     }).catch(error => {
//       this.isLoading = false;
//       toastr.error("Error occurred while fetching details, please check the link.");
//     });    
// }

  validate(){
    if(!this.statutoryDetailsForm.form.valid) 
    {
      toastr.error("Please enter all mandatory fields."); 
      return;
    }
    if(this.officialDetails && this.officialDetails.stateId > 0 && this.officialDetails.stateId !=1649 && !this.util.isValidPAN(this.details.panNo)){
      toastr.error("Please enter PAN number in ABCDE1234F format only.");
      return false;
    }
    
    if(this.officialDetails && this.officialDetails.stateId > 0 && this.officialDetails.stateId !=1649 && (!this.details.aadharNo || this.details.aadharNo.length != 12)){
      toastr.error("Please enter 12 digit Aadhar number.");
      return false;
    }
    return true;
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
