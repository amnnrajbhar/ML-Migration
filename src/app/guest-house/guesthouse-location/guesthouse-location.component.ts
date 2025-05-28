import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { GuesthouseLocation } from './guesthouselocation.model';
import swal from 'sweetalert';
import * as _ from "lodash";
import { AuditLog } from '../../masters/auditlog.model';
import { AuditLogChange } from '../../masters/auditlogchange.model';
declare var jQuery: any;
declare var $: any;
export class actionItemModel {
  name: string
}
@Component({
  selector: 'app-guesthouse-location',
  templateUrl: './guesthouse-location.component.html',
  styleUrls: ['./guesthouse-location.component.css']
})
export class GuesthouseLocationComponent implements OnInit {

@ViewChild(NgForm, { static: false }) locationForm!: NgForm;

  currentUser = {} as AuthData;
  urlPath: string = '';
  isEdit: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoadingPop: boolean = false;

  isLoading!: boolean;
  
  locationModel = {} as GuesthouseLocation;
  locationList: GuesthouseLocation[] = [];
  tableWidget: any;
  oldlocationModel: GuesthouseLocation = new GuesthouseLocation();// For aduit log
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
      this.getAllLocation();
    }
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let exampleId: any = jQuery('#locationTable');
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
  getAllLocation() {
    this.httpService.get(APIURLS.BR_GUESTHOUSE_LOCATION_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationList = data.filter((x:any)  => x.isActive);
      }
      this.reInitDatatable();
    }).catch((error)=> {
      this.locationList = [];
    });
  }

  onaddnewLocation(isedit: boolean, location: GuesthouseLocation): void {
    this.isEdit = isedit;
    this.locationModel = {} as GuesthouseLocation;
    this.errMsgPop = '';
    this.aduitpurpose = '';
    this.oldlocationModel = new GuesthouseLocation();
    this.locationForm.form.markAsPristine();
    this.locationForm.form.markAsUntouched();
    this.locationForm.form.updateValueAndValidity();
    if (isedit) {
      this.oldlocationModel = Object.assign({}, location);
      this.locationModel = Object.assign({}, location);
    }
    jQuery("#myModal").modal('show');
  }

  onSavelocation(): void {
    let connection: any;
    this.locationModel.isActive = true;
    let sametype = this.locationList.some(v => v.name.toLowerCase() == this.locationModel.name.toLowerCase() && v.id != this.locationModel.id);
    if (sametype) {
      this.isLoadingPop = false;
      this.errMsgPop = 'Location already exists..';
    }
    else {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.locationModel.createdBy = this.currentUser.uid;
        this.locationModel.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_GUESTHOUSE_LOCATION_API, this.locationModel);
      }
      else {
        this.auditType = "Update";
        this.locationModel.modifiedBy = this.currentUser.uid;
        this.locationModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_GUESTHOUSE_LOCATION_API, this.locationModel.id, this.locationModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery('#myModal').modal('hide');
          this.errMsgModalPop = 'Saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.locationModel.id;
          this.insertAuditLog(this.oldlocationModel, this.locationModel, Id);
          this.getAllLocation();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving location..';
      });
    }
  }
  deleteLocation(location: GuesthouseLocation): void {
    this.locationModel = {} as GuesthouseLocation;
    this.errMsgPop = '';
    this.aduitpurpose = '';
    this.oldlocationModel = new GuesthouseLocation();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        let connection: any;
        this.auditType = "Delete";
        this.locationModel = Object.assign({}, location);
        this.locationModel.isActive = false;
        this.locationModel.modifiedBy = this.currentUser.uid;
        this.locationModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_GUESTHOUSE_LOCATION_API, this.locationModel.id, this.locationModel);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgModalPop = 'Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.locationModel, this.oldlocationModel, this.locationModel.id);
            this.getAllLocation();
          }
        }).catch((error)=> {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting location..';
        });
      }
    });
  }
  //AuditLogging
  masterName: string = 'Guest House Location Master'; // Change MasterName
  insertAuditLog(oldObj: GuesthouseLocation, newObj: GuesthouseLocation, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.name;
    newObject.name = newObj.name;

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
