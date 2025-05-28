import { Component, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AuthData } from '../../../../auth/auth.model';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { DomSanitizer } from '@angular/platform-browser'
import { SharedVar } from '../sharedvar';
import swal from 'sweetalert';
import { TemporaryProfile } from '../temporaryprofile.model';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
  providers: [Util, AppointmentService],
})
export class AddressComponent implements OnInit {
@ViewChild(NgForm, { static: false }) addressForm!: NgForm;

  @Input() employeeId!: number;
  @Input() profileDetails: TemporaryProfile;
  @Input() editAllowed!: boolean;
  @Input() profileId!: number;
  @Output() dataSaved: EventEmitter<any> = new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> = new EventEmitter();
  @Output() addressValues: EventEmitter<TemporaryProfile> = new EventEmitter();

  isLoading = false;
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
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  addressList: any[] = [];
  addressLists: any[] = [];
  profileDetailsList: any = {};
  profileUpdate = false;
  statusList = [
    { type: "Update", color: "info" },
    { type: "Delete", color: "danger" },
    { type: "Add", color: "success" },
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService,
    private route: ActivatedRoute, private service: AppointmentService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    this.service.getAddressTypes().then((data: any) => { this.addressTypes = data });
    this.service.getStates().then((data: any) => { this.states = data; });
    this.service.getCountries().then((data: any) => {
      this.countryList = data;
      this.selectedCountry = this.countryList.find((x:any)  => x.id == 100);
    });

    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getData(this.employeeId);
    }
    if (this.profileId > 0) {
      this.profileUpdate = true;
      this.getProfileData(this.profileId);
    }
  }


  getValues(): TemporaryProfile {
    this.profileDetails.employeeId = this.employeeId;
    this.profileDetails.addressDetails = this.addressLists;
    return (this.profileDetails);
  }


  getProfileData(id:any) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetailsList = data;
        this.profileDetailsList.addressDetails = this.profileDetailsList.addressDetails.filter((x:any)  => x.action != "None");
        for (var item of this.profileDetailsList.addressDetails) {
          item.statusColor = this.statusList.find((x:any)  => x.type == item.action).color;
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  getData(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_ADDRESS, id).then((data: any) => {
      if (data) {
        this.addressList = data;
        this.addressLists = this.addressList;
        //console.log(this.addressList);
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
  onAddLineClick() {
    this.item.addressType = this.selectedAddressType.addressType;
    this.item.addressTypeId = this.selectedAddressType.id;
    this.item.stateId = this.selectedState.id;
    this.item.stateName = this.selectedState.bezei;
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.item.action = "Add";

    //var data = Object.assign({}, this.item);
    this.addressList.push(this.item);
    // this.addressLists.push(this.item);
    // console.log(this.addressList);
    this.count++;
    if (this.item.addressTypeId == 1) {
      if (this.item.sameMailingAddress == true) {
        let item2 = Object.assign({}, this.item);
        item2.addressTypeId = 3;
        item2.addressType = "mailing address";
        var item3 = this.addressList.find((x:any)  => x.addressTypeId == 3);
        if (item3 != null)
          item3 = item2;
        else
          this.addressList.push(item2);

        console.log(this.addressList);
        this.count++;
      }
    }

    this.clearInput();
  }

  EditLine(item:any, index:any) {
    this.selectedAddressType = this.addressTypes.find((x:any)  => x.id == item.addressTypeId);
    this.selectedState = this.states.find((x:any)  => x.id == item.stateId);
    this.selectedCountry = this.countryList.find((x:any)  => x.id == item.countryId);

    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateClick() {
    this.item.addressType = this.selectedAddressType.addressType;
    this.item.addressTypeId = this.selectedAddressType.id;
    this.item.stateId = this.selectedState.id;
    this.item.stateName = this.selectedState.bezei;
    this.item.countryId = this.selectedCountry.id;
    this.item.countryName = this.selectedCountry.landx;
    this.item.action = "Update";
    this.addressList[this.editIndex] = this.item;
    if (this.item.addressTypeId == 1) {
      if (this.item.sameMailingAddress) {
        let item2 = Object.assign({}, this.item);
        item2.addressTypeId = 3;
        item2.addressType = "mailing address";
        var item3 = this.addressList.find((x:any)  => x.addressTypeId == 3);
        if (item3 != null)
          item3 = item2;
        else
          this.addressList.push(item2);
      }

    }

    this.clearInput();
  }

  onStateChange() {
    if (this.selectedState.id == 1649)  // Nepal
    {
      this.selectedCountry = this.countryList.find((x:any)  => x.id == 160); // Nepal
    }
    else
      this.selectedCountry = this.countryList.find((x:any)  => x.id == 100); // India
  }
  copyMailingAddress(event) {
    if (event.target.checked) {
      var mailingAddress = this.addressList.find((x:any)  => x.addressTypeId == 3);
      if (mailingAddress) {
        this.item = mailingAddress;
      }
    }
  }

  copyPermanentAddress(event) {
    if (event.target.checked) {
      var permanentAddress = this.addressList.find((x:any)  => x.addressTypeId == 1);
      if (permanentAddress) {
        this.item = permanentAddress;
      }
    }
  }

  RemoveLine(no) {
    if (no == this.editIndex && this.isEdit) {
      this.clearInput();
    } else if (no < this.editIndex) {
      this.editIndex--;
    }
    this.addressLists[no].action = "Delete";
    this.addressList.splice(no, 1);
    this.count--;
  }

  clearInput() {
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;
    this.selectedAddressType = null;
    this.selectedState = null;
    //this.selectedCountry = null;
    this.addressForm.form.markAsPristine();
    this.addressForm.form.markAsUntouched();
  }
}
