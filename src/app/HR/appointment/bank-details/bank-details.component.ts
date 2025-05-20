import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { Util } from '../../Services/util.service';
import swal from 'sweetalert';
declare var toastr: any;

@Component({
  selector: 'app-appointment-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css'],
  providers: [AppointmentService, Util]
})
export class BankDetailsComponent implements OnInit {
  @ViewChild('bankDetailsForm')
  private bankDetailsForm: NgForm;
  @Input() appointmentId: number;
  @Input() offerId: number;
  @Input() guid: string;
  @Input() editAllowed: boolean = true;
  @Input() showSalaryAccountDetails: boolean = false;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  details:any = {};
  accountTypeList: any[] = [];
  currencyList: any[] = [];
  banksList: any[] = [];
  isLoading: boolean = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
    this.service.getAccountTypes().then((data:any)=>{this.accountTypeList = data.filter(x=>x.account == "Savings");});    
    if(this.showSalaryAccountDetails)
    {  
      this.getCurrencies();
      this.getBanksList();
    }
      this.LoadData();
  }

  LoadData() {
    this.isLoading = true;
    let conn: any;
    if(this.appointmentId > 0)
    conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_BANK_DETAILS + "/" + this.appointmentId);
    else
    conn = this.service.getData(APIURLS.CANDIDATE_GET_BANK_DETAILS + "/" + this.offerId + "/" + this.guid);

    conn.then((data: any) => {
      if (data) {
        this.details = data;
        if(this.details.currencyId == null || this.details.currencyId == undefined || this.details.currencyId <= 0)
          this.details.currencyId = 79;   // default INR
          
        if(data != null && data.appointmentId > 0){
          this.details.confirmAccountNo = this.details.accountNo;
          this.dataLoaded.emit("loaded");
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.details = {};
    });
  }

  submitted = false;
  saveData(){
    this.submitted = true;
    if(!this.bankDetailsForm.form.valid || this.details.confirmAccountNo != this.details.accountNo) 
    {
      toastr.error("Please enter all mandatory fields.");
      return;
    }
   
    let connection: any;
    //this.isLoading = true;
    this.details.appointmentId = this.appointmentId;
    this.details.offerId = this.offerId;
    this.details.offerGuid = this.guid;
        
    if(this.appointmentId > 0)
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_BANK_DETAILS, this.details);
    else
    connection = this.service.postData(APIURLS.CANDIDATE_SAVE_BANK_DETAILS, this.details);
        
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
        toastr.error('Error occured while saving bank details. Error:' + err);
      })
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving bank details. Error:' + error);
      });
  }

  
  getCurrencies() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_CURRENCIES).then((data: any) => {
      if (data.length > 0) {
        this.currencyList = data.sort((a,b)=>{if(a.waers > b.waers) return 1; if(a.waers < b.waers) return -1; return 0;});
      }
    }).catch(error => {
      this.currencyList = [];
    });
  }

  getBanksList() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_BANK_LIST).then((data: any) => {
      if (data.length > 0) {
        data = data.filter(x=>x.bankCountry == "IN");
        this.banksList = data.sort((a,b)=>{if(a.name > b.name) return 1; if(a.name < b.name) return -1; return 0;});
      }
    }).catch(error => {
      this.banksList = [];
    });
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
