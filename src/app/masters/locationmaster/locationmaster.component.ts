import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { Location } from './location.model';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { AuditLogChange } from '../auditlogchange.model';
import { AuditLog } from '../auditlog.model';
declare var jQuery: any;
declare var $: any;
export class actionItemModel {
  code: string;
  name: string;
  description: string;
}
@Component({
  selector: 'app-locationmaster',
  templateUrl: './locationmaster.component.html',
  styleUrls: ['./locationmaster.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class LocationMasterComponent implements OnInit {
  public tableWidget: any;
  @ViewChild(NgForm) locationMasterForm: NgForm;
  LocationMasterList: any[] = [[]];
  locationMasterItem: Location = new Location();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  currentUser: AuthData;
  oldlocationMasterItem: Location = new Location();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }


  clearForm() {
    this.locationMasterForm.resetForm();
    this.getLocationMasterList();
  }

  private initDatatable(): void {
    let exampleId: any = jQuery('#location');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    $('#location').on('click', '.toggleTest', function () {
      console.log('click');
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }


  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getLocationMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }


  onAddLocationMaster(isEdit: boolean, data: Location) {
    // this.clearForm();
    this.locationMasterForm.form.markAsPristine();
    this.locationMasterForm.form.markAsUntouched();
    this.locationMasterForm.form.updateValueAndValidity();
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.aduitpurpose = '';
    this.oldlocationMasterItem = new Location();
    this.isLoadingPop = true;
    if (this.isEdit) {
      Object.assign(this.oldlocationMasterItem, data);
      Object.assign(this.locationMasterItem, data);
    }
    else {
      this.locationMasterItem = new Location();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  getLocationMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.LocationMasterList = data.filter(x => x.isActive).sort((a,b)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;
        });
        // console.log(this.LocationMasterList);
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.LocationMasterList = [];
    });
  }

  validatedForm: boolean = true;


  closeSaveModal() {
    this.getLocationMasterList();
    jQuery("#saveModal").modal('hide');
  }
  onSaveLocationMaster() {
    this.errMsg = '';
    this.errMsgPop = '';
    this.isLoadingPop = true;
    let connection: any;
    this.validatedForm = true;
    let validCode = this.LocationMasterList.some(s => s.code == this.locationMasterItem.code && s.id != this.locationMasterItem.id);
    let validName = this.LocationMasterList.some(s => s.name == this.locationMasterItem.name && s.id != this.locationMasterItem.id);
    if (validCode) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Location code already exists.';
      this.getLocationMasterList();
    }
    else if (validName) {
      this.isLoadingPop = false;
      this.validatedForm = false;
      this.errMsgPop = 'Location name already exists.';
      this.getLocationMasterList();
    }
    else {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.locationMasterItem.isActive = true;
        this.locationMasterItem.createdBy = this.currentUser.uid;
       // this.locationMasterItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_LOCATION_MASTER_API, this.locationMasterItem);
      }
      else {
        this.auditType = "Update";
        this.locationMasterItem.modifiedBy = this.currentUser.uid;
      //  this.locationMasterItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_LOCATION_MASTER_API, this.locationMasterItem.id, this.locationMasterItem);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery('#myModal').modal('hide');
          this.errMsgPop1 = 'Location data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.locationMasterItem.id;
          this.insertAuditLog(this.oldlocationMasterItem, this.locationMasterItem, Id);
          this.getLocationMasterList();
        }
      }).catch(() => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Location..';
      });
    }
  }
  deleteLocationMaster(data: Location): void {
    this.aduitpurpose = '';
    this.oldlocationMasterItem = new Location();
    this.locationMasterItem = new Location();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.locationMasterItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.locationMasterItem.isActive = false;
        this.locationMasterItem.modifiedBy = this.currentUser.uid;
        this.locationMasterItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_LOCATION_MASTER_API, this.locationMasterItem.id, this.locationMasterItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.locationMasterItem, this.oldlocationMasterItem, this.locationMasterItem.id);
            this.getLocationMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Location..';
        });
      }
    });
  }
  //AuditLogging
  masterName: string = 'Locatoin Master'; // Change MasterName
  insertAuditLog(oldObj: Location, newObj: Location, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.code = oldObj.code;
    oldObject.name = oldObj.name;
    oldObject.description = oldObj.description;
    newObject.code = newObj.code;
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
    auditlog.keyValue=newObj.name?newObj.code+'-'+newObj.name:oldObj.code+'-'+oldObj.name;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog);
    connection.then((data: any) => {
      this.isLoadingPop = false;
    }).catch(() => {
      this.isLoadingPop = false;
    });
  }
  auditLogList: AuditLog[] = [];
  openAuditLogs(id) {
    jQuery("#auditModal").modal('show');
    let stringparms = this.masterName + ',' + id;
    this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch(() => {
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
    this.isLoading = false;

  }
  private reinitPOUPDatatable(): void {
    if (this.audittableWidget) {
      this.audittableWidget.destroy();
      this.audittableWidget = null;
    }
    setTimeout(() => this.initPOUPDatatable(), 0);
  }
}
