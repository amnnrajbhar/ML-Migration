import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { BookPurpose } from './bookpurpose.model';
import swal from 'sweetalert';
import { AuditLog } from '../../masters/auditlog.model';
import { AuditLogChange } from '../../masters/auditlogchange.model';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash"
export class actionItemModel {
  type: string;
  purpose: string;
}
@Component({
  selector: 'app-booking-purpose',
  templateUrl: './booking-purpose.component.html',
  styleUrls: ['./booking-purpose.component.css']
})
export class BookingPurposeComponent implements OnInit {
  @ViewChild(NgForm) meetingroomForm: NgForm;
  currentUser = {} as AuthData;
  urlPath: string = '';
  isEdit: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoadingPop: boolean = false;

  isLoading: boolean;
  
  purposeModel = {} as BookPurpose;
  purposeList: BookPurpose[] = [];
  tableWidget: any;
  oldpurposeModel: BookPurpose = new BookPurpose();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getAllpurpose();
    }
  }
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
  getAllpurpose() {
    this.httpService.get(APIURLS.BR_BOOK_PURPOSE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter(x => x.isActive);
      }
      this.reInitDatatable();
    }).catch(error => {
      this.purposeList = [];
    });
  }
  selectedService: any;
  serviceTypeList = [
    { type: "Room Booking" },
    { type: "Guest House" },
    { type: "Cab Request" },
  ]
  onaddnewPurpose(isedit: boolean, purpose: BookPurpose): void {
    this.isEdit = isedit;
    this.purposeModel = {} as BookPurpose;
    this.errMsgPop = '';
    this.aduitpurpose = '';
    this.oldpurposeModel = new BookPurpose();
    this.selectedService = null;
    this.meetingroomForm.form.markAsPristine();
    this.meetingroomForm.form.markAsUntouched();
    this.meetingroomForm.form.updateValueAndValidity();
    if (isedit) {
      this.oldpurposeModel = Object.assign({}, purpose);
      this.purposeModel = Object.assign({}, purpose);
      this.selectedService = this.serviceTypeList.find(x => x.type == purpose.type);
    }
    jQuery("#myModal").modal('show');
  }

  onSavePurpose(): void {
    let connection: any;
    this.purposeModel.isActive = true;
    let sametype = this.purposeList.some(v => v.purpose.toLowerCase() == this.purposeModel.purpose.toLowerCase() && v.type.toLowerCase() == this.selectedService.type.toLowerCase() && v.id != this.purposeModel.id);
    if (sametype) {
      this.isLoadingPop = false;
      this.errMsgPop = 'Purpose already exists..';
    }
    else {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.purposeModel.createdBy = this.currentUser.uid;
        this.purposeModel.createdDate = new Date().toLocaleString();
        this.purposeModel.type = this.selectedService.type;
        connection = this.httpService.post(APIURLS.BR_BOOK_PURPOSE_MASTER_API, this.purposeModel);
      }
      else {
        this.auditType = "Update";
        this.purposeModel.modifiedBy = this.currentUser.uid;
        this.purposeModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_BOOK_PURPOSE_MASTER_API, this.purposeModel.id, this.purposeModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        // console.log(data);
        if (data == 200 || data.id > 0) {
          // console.log(data);
          jQuery('#myModal').modal('hide');
          this.errMsgModalPop = 'Saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.purposeModel.id;
          this.insertAuditLog(this.oldpurposeModel, this.purposeModel, Id);
          this.getAllpurpose();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Purpose..';
      });
    }
  }
  deletePurpose(purpose: BookPurpose): void {
    this.purposeModel = {} as BookPurpose;
    this.aduitpurpose = '';
    this.oldpurposeModel = new BookPurpose();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        let connection: any;
        this.auditType = "Delete";
        this.purposeModel = Object.assign({}, purpose);
        this.purposeModel.isActive = false;
        this.purposeModel.modifiedBy = this.currentUser.uid;
        this.purposeModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_BOOK_PURPOSE_MASTER_API, this.purposeModel.id, this.purposeModel);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgModalPop = 'Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.purposeModel, this.oldpurposeModel, this.purposeModel.id);
            this.getAllpurpose();
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Purpose..';
        });
      }
    });
  }
  //AuditLogging
  masterName: string = 'Purpose master'; // Change MasterName
  insertAuditLog(oldObj: BookPurpose, newObj: BookPurpose, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.type = oldObj.type;
    oldObject.purpose = oldObj.purpose;

    newObject.type = newObj.type;
    newObject.purpose = newObj.purpose;

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
    auditlog.keyValue=newObj.purpose?newObj.type+'/'+newObj.purpose:oldObj.type+'/'+oldObj.purpose;
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
