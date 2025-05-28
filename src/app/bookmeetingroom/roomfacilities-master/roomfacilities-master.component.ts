import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { RoomFacility } from './roomfacility.model';
import swal from 'sweetalert';
import { AuditLog } from '../../masters/auditlog.model';
import { AuditLogChange } from '../../masters/auditlogchange.model';
import * as _ from "lodash";
declare var jQuery: any;
declare var $: any;
export class actionItemModel {
  name: string
  description: string
}
@Component({
  selector: 'app-roomfacilities-master',
  templateUrl: './roomfacilities-master.component.html',
  styleUrls: ['./roomfacilities-master.component.css']
})
export class RoomfacilitiesMasterComponent implements OnInit {
@ViewChild(NgForm, { static: false }) meetingroomForm!: NgForm;

  currentUser = {} as AuthData;
  urlPath: string = '';
  isEdit: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoadingPop: boolean = false;
  isLoading!: boolean;
  roomFacilityModel = {} as RoomFacility;
  roomsFacilityList: RoomFacility[] = [];
  tableWidget: any;
  type: string = "RoomBooking";
  oldroomFacilityModel: RoomFacility = new RoomFacility();// For aduit log
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getRoomFacilities();
    }

  }
  //Table sorting code start
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let exampleId: any = jQuery('#roomsTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }
  //Table sorting code end
  //Bind data to table..
  getRoomFacilities() {
    this.httpService.get(APIURLS.BR_MASTER_ROOM_FACILITY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomsFacilityList = data.filter((x:any)  => x.type == this.type && x.isActive);
      }
      this.reInitDatatable();
    }).catch((error)=> {
      this.roomsFacilityList = [];
    });
  }
  //Modal Popup
  onaddnewFacility(isedit: boolean, roomFacility: RoomFacility): void {
    this.isEdit = isedit;
    this.roomFacilityModel = {} as RoomFacility;
    this.errMsgPop = '';
    this.aduitpurpose = '';
    this.oldroomFacilityModel = new RoomFacility();
    this.meetingroomForm.form.markAsPristine();
    this.meetingroomForm.form.markAsUntouched();
    this.meetingroomForm.form.updateValueAndValidity();
    if (isedit) {
      this.oldroomFacilityModel = Object.assign({}, roomFacility);
      this.roomFacilityModel = Object.assign({}, roomFacility);
    }
    jQuery("#myModal").modal('show');
  }
  //Save and Update here
  onSaveRoomFacility(): void {
    let connection: any;
    this.roomFacilityModel.isActive = true;
    let sametype = this.roomsFacilityList.some(v => v.name.toLowerCase() == this.roomFacilityModel.name.toLowerCase() && v.type.toLowerCase() == this.type.toLowerCase() && v.id != this.roomFacilityModel.id);
    if (sametype) {
      this.isLoadingPop = false;
      this.errMsgPop = 'Facility already exists..';
    }
    else {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.roomFacilityModel.type = this.type;
        this.roomFacilityModel.createdBy = this.currentUser.uid;
        this.roomFacilityModel.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_ROOM_FACILITY_API, this.roomFacilityModel);
      }
      else {
        this.auditType = "Update";
        this.roomFacilityModel.modifiedBy = this.currentUser.uid;
        this.roomFacilityModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_ROOM_FACILITY_API, this.roomFacilityModel.id, this.roomFacilityModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery('#myModal').modal('hide');
          this.errMsgModalPop = 'Facility saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.roomFacilityModel.id;
          this.insertAuditLog(this.oldroomFacilityModel, this.roomFacilityModel, Id);
          this.getRoomFacilities();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Room Facility..';
      });
    }
  }
  //Delete
  deleteRoomFacility(roomFacility: RoomFacility): void {
    this.roomFacilityModel = {} as RoomFacility;
    this.errMsgPop = '';
    this.aduitpurpose = '';
    this.oldroomFacilityModel = new RoomFacility();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        let connection: any;
        this.auditType = "Delete";
        this.roomFacilityModel = Object.assign({}, roomFacility);
        this.roomFacilityModel.isActive = false;
        this.roomFacilityModel.modifiedBy = this.currentUser.uid;
        this.roomFacilityModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_ROOM_FACILITY_API, this.roomFacilityModel.id, this.roomFacilityModel);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgModalPop = 'Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.roomFacilityModel, this.oldroomFacilityModel, this.roomFacilityModel.id);
            this.getRoomFacilities();
          }
        }).catch((error)=> {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Room Facility..';
        });
      }
    });
  }
  //AuditLogging
  masterName: string = 'Room Facility Master'; // Change MasterName
  insertAuditLog(oldObj: RoomFacility, newObj: RoomFacility, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.name;
    oldObject.description = oldObj.description;
    newObject.name = newObj.name;
    newObject.description = newObj.description;

    let beforekey = Object.keys(oldObject);
    let aftrekey = Object.keys(newObject);
    var biggestKey = 0;
    if (beforekey.length > 0)
      var biggestKey = beforekey.length;
    else
      var biggestKey = aftrekey.length;
    let auditlogchangeList: AuditLogChange[] = [];
    for (var i = 0; i < biggestKey; i++) {
      if (this.auditType == "Update") {
        if (_.isEqual(beforekey[i], aftrekey[i]) && !_.isEqual(oldObject[beforekey[i]], newObject[aftrekey[i]])) {
          let auditlog: AuditLogChange = new AuditLogChange();
          auditlog.fieldname = beforekey[i];
          auditlog.oldvalue = oldObject[beforekey[i]];
          auditlog.newvalue = newObject[aftrekey[i]];
          auditlogchangeList.push(auditlog);
        }
      }
      else if (this.auditType == "Create") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = aftrekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
      else if (this.auditType == "Delete") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = beforekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
    }
    let connection: any;
    let auditlog: AuditLog = new AuditLog();
    auditlog.auditDateTime = new Date().toLocaleString();
    auditlog.aduitUser = this.currentUser.fullName;
    auditlog.auditType = this.auditType;
    auditlog.masterName = this.masterName;
    auditlog.tableId = id;
    auditlog.keyValue=newObj.name?newObj.name:oldObj.name;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog);
    connection.then((data: any) => {
      this.isLoadingPop = false;
    }).catch((error) => {
      this.isLoadingPop = false;
    });
  }
  auditLogList: AuditLog[] = [];
  openAuditLogs(id:any) {
    jQuery("#auditModal").modal('show');
    let stringparms = this.masterName + ',' + id;
    this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch((error) => {
    });

  }
  objParser(val) {
    return JSON.parse(val);
  }
  public audittableWidget: any;
  private initPOUPDatatable(): void {
    let exampleId: any = jQuery('#auditTable');
    this.audittableWidget = exampleId.DataTable({
      "order": [[0, "desc"]],
      "lengthChange": false,
      "pageLength": 5,
      "searching": false,
      "columnDefs": [
        {
          render: function (data, type, full, meta) {
            return "<div style='word-break: break-all;height:7em;overflow-x:hidden;'>" + data + "</div>";
          },
          targets: 5
        }
      ]
    });
    this.isLoadingPop = false;

  }
  private reinitPOUPDatatable(): void {
    if (this.audittableWidget) {
      this.audittableWidget.destroy();
      this.audittableWidget = null;
    }
    setTimeout(() => this.initPOUPDatatable(), 0);
  }
}
