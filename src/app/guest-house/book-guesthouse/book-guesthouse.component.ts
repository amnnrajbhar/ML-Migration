import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import swal from 'sweetalert';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { GuestHouseInformation } from '../guesthouse-maintenance/guesthouse.model';
import { RoomFacility } from '../../bookmeetingroom/roomfacilities-master/roomfacility.model';
import { Facilities } from '../guesthouse-maintenance/facility.model';
import { BookGuestHouse } from './bookguesthouse.model';
import { BookingParticipants } from './bookingparticipants.model';
import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
declare var $: any;
@Component({
  selector: 'app-book-guesthouse',
  templateUrl: './book-guesthouse.component.html',
  styleUrls: ['./book-guesthouse.component.css']
})
export class BookGuesthouseComponent implements OnInit {
  @ViewChild(NgForm) calendarForm: NgForm;
  currentUser: AuthData;
  isLoading: boolean;
  urlPath: string = '';
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoadingPop: boolean = false;
  locationList = [];
  calendarMeeting = {} as BookGuestHouse;
  roomInformation = {} as GuestHouseInformation;
  roomsInfoList: GuestHouseInformation[] = [];
  baseLocation:number;
  type:string="GuestHouse";
  roomName: string;
  roomLocation: string;
  isEdit: boolean = false;
  min:Date=new Date();
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute, private _lightbox: Lightbox) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    this.min=new Date(this.min.getFullYear(),this.min.getMonth(),this.min.getDate());
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      //this.baseLocation = this.currentUser.baselocation;
      this.getLocationList();
      //this.getRoomsByLocation(this.baseLocation);
      this.getRoomfacilities();
      this.getCurrentEmployeeDetails();
    }
  }
  getLocationList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_GUESTHOUSE_LOCATION_ALL_API).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x=>x.isActive).sort((a,b)=>{if(a.name > b.name) return 1; if(a.name < b.name) return -1;  return 0;});
        if (this.locationList.length > 0) {
          let info = this.locationList[0];
          this.baseLocation=info.id;
          this.getRoomsByLocation(this.baseLocation);
        }
        this.isLoading = false;
      }
    }).catch(error => {
      this.locationList = [];
    });
  }

  onSelect(locId) {
    this.roomsInfoList = [];
    this.baseLocation=locId;
    this.getRoomsByLocation(locId);
    this.getRoomLocationById(locId);
  }

  getRoomsByLocation(lId: number) {
   let roomInfo:any;
   this.isLoading = true;
    this.httpService.getById(APIURLS.BR_GUESTHOUSE_MASTER_GetBYANY_API, lId).then((data: any) => {
      if (data) {
        this.roomsInfoList = data.filter(x=>x.isActive);
        roomInfo = this.roomsInfoList[0];

        this.roomName=roomInfo.name;

        this.showRoomDetails(roomInfo);
        //this.getBaseLocationAdmin();
        this.getBaseLocationAdmin(roomInfo.adminId);
      }
      this.isLoading = false;
    }).catch(error => {
      this.roomsInfoList = [];
      this.isLoading = false;
    });
  }
  getRoomLocationById(lId: number) {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.roomLocation = data ? data.code + '-' + data.name : '';
      }
    }).catch(error => {
      this.roomLocation = '';
    });
  }
  onSelectRoom(item: any) {
    //console.log(item);
    this.showRoomDetails(item);
  }
  showRoomDetails(item: any) {
    this.images = [];
    this.roomInformation = item;
    this.getSelectedfacilitiesById(item.id);
    this.getSelectedPicturesById(item.id);
    this.getBaseLocationAdmin(item.adminId);
  }

  //Get Selected Roomfacilities:
  getSelectedfacilitiesById(rid: number): void {
    let selectedFacilities: Facilities[] = [];
    let rmFacilities = [];
    this.httpService.getById(APIURLS.BR_GUESTHOUSE_FACILITIES_GetBYANY_API, rid).then((data: any) => {
      if (data) {
        selectedFacilities = data;
        for (let index = 0; index < selectedFacilities.length; index++) {
          let element = selectedFacilities[index];
          let facility = this.roomsFacilityList.find(x => x.id == element.fk_FacilityId);
          rmFacilities.push(facility);
        }
        this.selectedItems = rmFacilities;
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  roomsFacilityList: RoomFacility[] = [];
  selectedItems: RoomFacility[] = [];
  getRoomfacilities() {
    this.httpService.get(APIURLS.BR_MASTER_ROOM_FACILITY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomsFacilityList = data.filter(x => x.type == this.type);
      }
    }).catch(error => {
      this.roomsFacilityList = [];
    });
  }

  //Get Selected RoomPictures:
  images: any = [];
  getSelectedPicturesById(rid: number): void {
    this.httpService.getById(APIURLS.BR_GUESTHOUSE_PICTURES_GetBYANY_API, rid).then((data: any) => {
      if (data) {
        let selectedPictures = data;
        for (let i = 0; i < selectedPictures.length; i++) {
          let item = selectedPictures[i];
          const image = {
            id: 0,
            name: '',
            src: '',
            url: ''
          };
          image.id = item.id;
          image.name = item.fileName;
          image.src = item.path;
          image.url = item.path;
          this.images.push(image);
        }
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  open(index: number): void {
    this._lightbox.open(this.images, index);
  }

  close(): void {
    this._lightbox.close();
  }
  onBookEvent() {
    // this.router.navigate([this.roomInformation.id], { relativeTo: this.route });
    //this.router.navigate(['/book-room',this.roomInformation.id]);
    this.resetForm();
    this.getPurposeList();
    jQuery("#myModal").modal('show');
  }
  purposeList: any[] = [];
  selectedPurpose: any;
  getPurposeList() {
    this.httpService.get(APIURLS.BR_BOOK_PURPOSE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter(x=>x.type=="Guest House" && x.isActive).sort((a,b)=>{if(a.purpose > b.purpose) return 1; if(a.purpose < b.purpose) return -1;  return 0;});
      }
    }).catch(error => {
      this.purposeList = [];
    });
  }
  //reset form here..
  resetForm(): void {
    this.calendarMeeting = {} as BookGuestHouse;
    this.calendarMeeting.numberOfPerson = 1;
    this.selectedPurpose = null;
    this.errMsgPop = '';
    this.purposeList = [];
    this.person = [];
    this.showTable = false;
    this.recCount=0;
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
  }
  showTable: boolean = false;
  person: BookingParticipants[] = [];
  recCount: any;
  addPersonDetails() {
    this.showTable = true;
    var line_no = this.person.length;
    let genId: any = (line_no) ? this.person[this.person.length - 1].id : 0;
    let nextKraId = genId + 1;
    var person_temp = {} as BookingParticipants;
    person_temp.id = nextKraId;
    this.person.push(person_temp);
    this.recCount = this.person.length;
    return true;
  }
  personIds: any = [];
  deletedPersonIds = [];
  removePersonDetails(id: number, position: number) {
    if (this.person.length == 0)
      this.showTable = false;
    if (id != 0 && this.personIds.find(s => s == id)) this.deletedPersonIds.push(id);
    this.person.splice(position, 1);
    this.recCount--;
  }
  getCurrentEmployeeDetails() {
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, this.currentUser.uid).then((data: any) => {
      if (data) {
        let managerId = data.fkReportingManager;
        this.getCurrentUserManager(managerId);

      }
    }).catch(error => {
      console.log(error);
    });
  }
  managerInfo: any = {};
  getCurrentUserManager(mgrId: number) {
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, mgrId).then((data: any) => {
      if (data) {
        this.managerInfo = data;
      }
    }).catch(error => {
      this.managerInfo = {};
    });
  }
  adminInfo: any = [];
  getBaseLocationAdmin(adminId) {
    // let searchStr = this.baseLocation.toString() + ',' + '1004';//Room Location Admin
    // this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_BYPARAM_API, searchStr).then((data: any) => {
    //   if (data.length > 0) {
    //     this.adminInfo = data;
    //   }
    // }).catch(error => {
    //   this.adminInfo = [];
    // });
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, adminId).then((data: any) => {
      if (data) {
        this.adminInfo = data;
        //console.log(data);
      }
    }).catch(error => {
      this.adminInfo = {};
    });
  }
  onSaveMeeting() {

    let d1 = new Date(this.calendarMeeting.fromDate);
    let d2 = new Date(this.calendarMeeting.toDate);
    var dtStartTime = new Date(this.calendarMeeting.fromTime);
    var dtEndTime = new Date(this.calendarMeeting.toTime);

    let dtStartDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), dtStartTime.getHours(), dtStartTime.getMinutes());
    let dtEndDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), dtEndTime.getHours(), dtEndTime.getMinutes());

    if (dtStartDate < new Date()) {
      swal({
        title: "Message",
        text: "Cannot book room for past time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else if (dtEndDate <= dtStartDate) {
      swal({
        title: "Message",
        text: "End date/time should be grater than start date/time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else if (this.calendarMeeting.numberOfPerson <= 0) {
      swal({
        title: "Message",
        text: "Number of persons should be greater than zero",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else {
      let bookingId: number;
      let connection: any;
      if (!this.isEdit) {
        let formdate: string = d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
          ("00" + d1.getDate()).slice(-2);
        let todate: string = d2.getFullYear() + "-" + ("00" + (d2.getMonth() + 1)).slice(-2) + "-" +
          ("00" + d2.getDate()).slice(-2);
        this.calendarMeeting.fromDate = formdate;
        this.calendarMeeting.toDate = todate;
        var startTime = ("00" + dtStartDate.getHours()).slice(-2) + ":" +
          ("00" + dtStartDate.getMinutes()).slice(-2) + ":" +
          ("00" + dtStartDate.getSeconds()).slice(-2);
        var endTime = ("00" + dtEndDate.getHours()).slice(-2) + ":" +
          ("00" + dtEndDate.getMinutes()).slice(-2) + ":" +
          ("00" + dtEndDate.getSeconds()).slice(-2);
        this.calendarMeeting.fromTime = startTime;
        this.calendarMeeting.toTime = endTime;
        this.calendarMeeting.fkEmployeeId = parseInt(this.currentUser.employeeId);
        this.calendarMeeting.employeeNumber = this.currentUser.employeeId;
        this.calendarMeeting.fkRoomId = this.roomInformation.id;
        this.calendarMeeting.fkPurpose = this.selectedPurpose.id;
        this.calendarMeeting.empoloyeeLocation = this.currentUser.baselocation;
        this.calendarMeeting.roomLocation = this.baseLocation;// Room Location Id
        this.calendarMeeting.isApprovalReq = false;
        this.calendarMeeting.isCancelled = false;
        this.calendarMeeting.empName = this.currentUser.fullName;
        this.calendarMeeting.empEmail = this.currentUser.email;
        this.calendarMeeting.empDesignation = this.currentUser.designation;
        this.calendarMeeting.createdBy = this.currentUser.uid;
        this.calendarMeeting.createdDate = new Date().toLocaleString();
        //this.calendarMeeting.status = "Approved";
        this.calendarMeeting.roomName = this.roomName;
        this.calendarMeeting.roomLocationName = this.roomLocation;
        this.calendarMeeting.purpose = this.selectedPurpose.purpose;
        if (this.roomInformation.manager_Approval) {
          this.calendarMeeting.managerId = this.managerInfo.employeeId;
          this.calendarMeeting.managerName = this.managerInfo.firstName + ' ' + this.managerInfo.middleName + ' ' + this.managerInfo.lastName;
          this.calendarMeeting.managerEmail = this.managerInfo.email;
        }
        if (this.roomInformation.admin_Approval) {
            this.calendarMeeting.adminId = this.adminInfo.employeeId;
            this.calendarMeeting.adminName = this.adminInfo.firstName + ' ' + this.adminInfo.middleName + ' ' + this.adminInfo.lastName;
            this.calendarMeeting.adminEmail = this.adminInfo.email;
        }
        if (this.roomInformation.manager_Approval) {
          this.calendarMeeting.status = "Pending with Manager";
        }
        else if (this.roomInformation.admin_Approval) {
            this.calendarMeeting.status = "Pending with Admin";
        }
        connection = this.httpService.post(APIURLS.BR_GUESTHOUSE_BOOKING_API, this.calendarMeeting);
      }
      else {
        this.calendarMeeting.modifiedBy = this.currentUser.uid;
        this.calendarMeeting.modifiedDate = new Date().toLocaleString();
        bookingId = this.calendarMeeting.id;
        connection = this.httpService.put(APIURLS.BR_GUESTHOUSE_BOOKING_API, this.calendarMeeting.id, this.calendarMeeting);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          this.calendarMeeting.requestNo=data.requestNo;
          if (!this.isEdit) {
            bookingId = data.id;
          }
          this.saveAdditionalPersons(this.isEdit, bookingId);
          this.sendMail(this.calendarMeeting);
          jQuery('#myModal').modal('hide');
          if (this.isEdit)
            this.errMsgModalPop = 'Booking updated!';
          else
            this.errMsgModalPop = 'Booked successfully!';
          jQuery("#saveModal").modal('show');
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error in Booking';
      });
    }

  }
  saveAdditionalPersons(isedit: boolean, brmid: number): void {
    let connection: any;
    for (let per of this.person) {
      let bookingParticipant = {} as BookingParticipants;
      bookingParticipant.fK_BookingId = brmid;
      bookingParticipant.name = per.name;
      bookingParticipant.mobileCode = per.mobileCode;
      bookingParticipant.mobile = per.mobile;
      bookingParticipant.email = per.email;
      bookingParticipant.createdBy = this.currentUser.uid;
      bookingParticipant.createdDate = new Date().toLocaleString();
      connection = this.httpService.post(APIURLS.BR_GUESTHOUSE_BOOKINGPARTICIPANTS_API, bookingParticipant);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
        }
      }).catch(error => {
        this.errMsgPop = 'Error saving BOOKING PARTICIPANTS ...';
      });
    }
  }

  sendMail(bookingData: BookGuestHouse) {
    let connection: any;
    if (bookingData.status == "Pending with Manager" || bookingData.status == "Pending with Admin") {
      connection = this.httpService.sendPutMail(APIURLS.BR_SENDGUESTHOUSEEMAIL_API, "GH-1stLevelApproval", bookingData);
      connection.then((data: any) => {
        if (data == 200) {
        }
      }).catch(error => {
        this.errMsgPop = 'Error in sending mail..';
      });
    }
  }
  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
  isActiveTab(idx: number) {
    return idx === 0;
  }
}
