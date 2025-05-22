import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { NgForm, FormControl } from '@angular/forms';
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
  selector: 'app-appointment-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css'],
  providers: [AppointmentService, Util]
})
export class PersonalComponent implements OnInit {
  @ViewChild('personalDetailsForm2')
  private personalDetailsForm2: NgForm;
  @Input() appointmentId: number;
  @Input() offerId: number;
  @Input() guid: string;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  currentUser: AuthData;
  details:any = {};
  offerDetails:any;
  maritalStatusList: any[] = [];
  religionList: any[] = [];
  nationalityList: any[] = [];
  countryList: any[] = [];
  relationTypeList: any[]=[];
  isLoading: boolean = false;
  submitted = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
    this.service.getMaritalStatus().then((data:any)=>{this.maritalStatusList = data;});
    this.service.getReligions().then((data:any)=>{this.religionList = data;});
    this.service.getNationality().then((data:any)=>{this.nationalityList = data;});
    this.service.getCountries().then((data:any)=>{this.countryList = data;});
    this.service.getRelationTypes().then((data:any)=>{this.relationTypeList = data;});
    this.details.countryOfBirthId = 100;    
    this.details.nationalityId = 30;
    this.LoadData();   
    this.LoadOfferDetails();   
  }

  LoadData() {
    
    let conn: any;
    if(this.offerId > 0){
      this.isLoading = true;
      conn = this.service.getData(APIURLS.CANDIDATE_GET_PERSONAL_DETAILS + "/" + this.offerId + "/" + this.guid);
    }      
    else if (this.appointmentId > 0 ){
      this.isLoading = true;
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_PERSONAL_DETAILS + "/" + this.appointmentId);
    }      
    
    if(conn)
    {
      conn.then((data: any) => {
        if (data) {
          this.details = data;
          this.appointmentId = data.appointmentId;
          var dob = new Date(this.details.dateOfBirth);
          if(dob.getFullYear() == new Date().getFullYear())
            this.details.dateOfBirth = "";
          if(this.details.nationalityId <= 0)
            this.details.nationalityId = 30;
          if(this.details.countryOfBirthId <= 0)
            this.details.countryOfBirthId = 100;

          if(data != null)
            this.dataLoaded.emit(data.status);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
        this.details = {};
      });
    }
  }

  saveData(officialDetails){
    
    if(!this.Validate(officialDetails)) return;

    let connection: any;
    this.isLoading = true;
    this.details.appointmentId = this.appointmentId;
    this.details.offerId = this.offerId;
    this.details.offerGuid = this.guid;
    this.details.dateOfBirth = this.util.getFormatedDateTime(this.details.dateOfBirth);
    
    // if(this.details.passportIssueDate != "")
    //   this.details.passportIssueDate = this.util.getFormatedDateTime(this.details.passportIssueDate);
    // if(this.details.passportExpiryDate != "")
    //   this.details.passportExpiryDate = this.util.getFormatedDateTime(this.details.passportExpiryDate);
    if(this.offerId > 0)
      connection = this.service.postData(APIURLS.CANDIDATE_SAVE_PERSONAL_DETAILS, this.details);
    else{
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
      this.details.modifiedById = this.currentUser.uid;
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_PERSONAL_DETAILS, this.details);
    }
    toastr.info('Saving...');

    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');
            this.appointmentId = data.id;
            this.dataSaved.emit(data);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving personal details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving personal details. Error:' + error);
      });
  }

  LoadOfferDetails() {
    if(this.offerId > 0){    
      this.isLoading = true;
      this.service.getData(APIURLS.CANDIDATE_GET_OFFER_BY_ID + "/" + this.offerId + "/" + this.guid).then((data: any) => {
        if (data) {
          this.offerDetails = data;          
        }
        else
        toastr.error("Offer details not found, please check the link.");

        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  Validate(officialDetails){
    this.submitted = true;
    if(!this.personalDetailsForm2.form.valid) 
    {
      toastr.error("Please enter all mandatory fields.");     
      console.log(this.personalDetailsForm2.form);
      return false;
    }
    if(this.details.physicallyChallenged == "Yes" && !this.details.physicallyChallengedDetails)
    {
      toastr.error("Please enter physically challenged details."); 
      return false;
    }
    if(this.offerDetails && this.offerDetails.stateId!=1649 && !this.util.isValidPAN(this.details.panNumber)){
      toastr.error("Please enter PAN number in ABCDE1234F format only.");
      return false;
    }
    if(officialDetails && officialDetails.stateId!=1649 && !this.util.isValidPAN(this.details.panNumber)){
      toastr.error("Please enter PAN number in ABCDE1234F format only.");
      return false;
    }
    if(this.offerDetails && this.offerDetails.stateId!=1649 && (!this.details.aadharNumber || this.details.aadharNumber.length != 12)){
      toastr.error("Please enter 12 digit Aadhar number.");
      return false;
    }
    if(officialDetails && officialDetails.stateId!=1649 && (!this.details.aadharNumber || this.details.aadharNumber.length != 12)){
      toastr.error("Please enter 12 digit Aadhar number.");
      return false;
    }
    if((new Date().getFullYear() - new Date(this.details.dateOfBirth).getFullYear())<18)
    {
      toastr.error("Age should be more than 18 years, please correct the Date of Birth.");
      return false;
    }
    if(this.offerDetails && this.offerDetails.stateId!=1649 && this.offerDetails.pfApplicable == "Yes" && this.offerDetails.totalExperience > 0 
    && (!this.details.pfNo || !this.details.uanNumber)){
      toastr.error("PF No and UAN is required, please enter PF No and UAN No.");
      return false;
    }
    if(this.offerDetails && this.offerDetails.stateId!=1649 && this.offerDetails.esiApplicable == "Yes" && this.offerDetails.totalExperience > 0 
    && !this.details.esiNo){
      toastr.error("ESI No is required, please enter ESI No.");
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
