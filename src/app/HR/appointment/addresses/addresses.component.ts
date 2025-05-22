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
  selector: 'app-appointment-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css'],
  providers: [AppointmentService]
})
export class AddressesComponent implements OnInit {
@ViewChild(NgForm, { static: false }) addressForm: NgForm;

  @Input() appointmentId: number = 0;
  @Input() offerId: number;
  @Input() guid: string;  
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  
  isLoading = false;
  addressList: any[] = [];
  item: any = {};
  addressTypes: any[] = [];
  states: any[] = [];
  countryList: any[] = [];
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedAddressType: any = null;
  selectedState: any = null;
  selectedCountry: any = null;
  personalDetails: any = {};

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
    this.service.getAddressTypes().then((data:any)=>{this.addressTypes = data});
    this.service.getStates().then((data:any)=>{this.states = data;});
    this.service.getCountries().then((data:any)=>{
      this.countryList = data;
      this.selectedCountry = this.countryList.find(x=>x.id == 100);
    });
    
    this.LoadData();
  }
  
  LoadData() {
    this.isLoading = true;
    
    let connection: any;

    if(this.appointmentId > 0)
      connection = this.httpService.HRget(APIURLS.APPOINTMENT_GET_ADDRESS_DETAILS + "/" + this.appointmentId);
    else 
        connection = this.service.getData(APIURLS.CANDIDATE_GET_ADDRESS_DETAILS + "/" + this.offerId + "/" + this.guid);
    
    connection.then((data: any) => {
      if (data && data.length > 0) {
        this.dataLoaded.emit("loaded");
        this.addressList = data;
        this.count = data.length;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.addressList = [];
    });
  }
  
  saveData(){
    let connection: any;
    //this.isLoading = true;
    let data: any = {};
    data.appointmentId = this.appointmentId;
    data.offerId = this.offerId;
    data.offerGuid = this.guid;
    data.list = this.addressList;
    
    if(!this.isValid())
      return;

    for(var d of data.list){
      if(d.fromDate != "")
        d.fromDate = this.util.getFormatedDateTime(d.fromDate);
        if(d.toDate != "")
        d.toDate = this.util.getFormatedDateTime(d.toDate);
    }
    if(this.appointmentId > 0)
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_ADDRESS_DETAILS, data);
    else
      connection = this.service.postData(APIURLS.CANDIDATE_SAVE_ADDRESS_DETAILS, data);

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
        toastr.error('Error occured while saving address details. Error:' + err);
      })
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving address details. Error:' + error);
      });
  }

  isValid(){
    var valid = true;
    var mandatoryTypes = [{type:"mailing address"}, {type: "permanent address"}];
    for(var type of mandatoryTypes){
      if(!this.addressList.some(x=>x.addressType.toLowerCase() == type.type)){
        valid = false;
      }
    }    
    if(!valid)
    toastr.error("Please add Mailing Address and Permanent Address. These are mandatory.");
    return valid;
  }

  onAddLineClick(){    
    this.item.addressType = this.selectedAddressType.addressType;
    this.item.addressTypeId = this.selectedAddressType.id;
    this.item.stateId = this.selectedState.id;
    this.item.stateName = this.selectedState.bezei;
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    //var data = Object.assign({}, this.item);
    this.addressList.push(this.item);
    this.count++;
    if(this.item.addressTypeId == 1){
      if(this.item.sameMailingAddress){
        let item2 = Object.assign({}, this.item);
        item2.addressTypeId=3;
        item2.addressType="mailing address";
        var item3 = this.addressList.find(x=>x.addressTypeId == 3);
        if(item3 != null)    
          item3 = item2;
        else
          this.addressList.push(item2);    
        this.count++;
      }
    }
    
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedAddressType = this.addressTypes.find(x=>x.id==item.addressTypeId);
    this.selectedState = this.states.find(x=>x.id==item.stateId);
    this.selectedCountry = this.countryList.find(x=>x.id==item.countryId);

    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateClick(){
    this.item.addressType = this.selectedAddressType.addressType;
    this.item.addressTypeId = this.selectedAddressType.id;
    this.item.stateId = this.selectedState.id;
    this.item.stateName = this.selectedState.bezei;
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.addressList[this.editIndex] = this.item;
    if(this.item.addressTypeId == 1){
      if(this.item.sameMailingAddress){
        let item2 = Object.assign({}, this.item);
        item2.addressTypeId = 3;
        item2.addressType = "mailing address";
        var item3 = this.addressList.find(x=>x.addressTypeId == 3);
        if(item3 != null)    
          item3 = item2;
        else
          this.addressList.push(item2);   
      }
    }
    this.clearInput();
  }
  
onStateChange(){
    if(this.selectedState.id == 1649)  // Nepal
    {
      this.selectedCountry = this.countryList.find(x=>x.id==160); // Nepal
    }
    else 
      this.selectedCountry = this.countryList.find(x=>x.id==100); // India
}

  copyMailingAddress(event){
    if(event.target.checked){
      var mailingAddress = this.addressList.find(x=>x.addressTypeId == 3);
      if(mailingAddress){
        this.item = mailingAddress;
      }
    }
  }

  copyPermanentAddress(event){
    if(event.target.checked){
      var permanentAddress = this.addressList.find(x=>x.addressTypeId == 1);
      if(permanentAddress){
        this.item = permanentAddress;
      }
    }
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.addressList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.selectedAddressType = null;
    this.selectedState = null;
    //this.selectedCountry = null;
    this.addressForm.form.markAsPristine();
    this.addressForm.form.markAsUntouched();
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
