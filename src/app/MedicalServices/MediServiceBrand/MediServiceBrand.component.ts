import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from  '../../masters/auditlog.model';
import * as _ from "lodash";
import { MediServiceBrand } from './MediServiceBrand.model';
declare var jQuery: any;
export class actionItemModel {
  name: string;
  description: string;
}
@Component({
  selector: 'app-MediServiceBrand',
  templateUrl: './MediServiceBrand.component.html',
  styleUrls: ['./MediServiceBrand.component.css']
})
export class MediServiceBrandComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  MediServiceBrandList: any[];
  MediServiceBrandList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  MediServiceBrand: MediServiceBrand = new MediServiceBrand();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  notFirst = true;
  currentUser = {} as AuthData;
  oldMediServiceBrand: MediServiceBrand = new MediServiceBrand();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#desigTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getMediServiceBrandList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  getMediServiceBrandList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.MediServiceBrandList=[];
    this.httpService.get(APIURLS.BR_MED_SERVICE_BRAND_API).then((data: any) => {
      if (data.length > 0) {
        this.MediServiceBrandList = data.filter(x => x.isActive).sort((a,b)=>{
                                    if(a.name > b.name) return 1;
                                    if(a.name < b.name) return -1;
                                    return 0;
                                });
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.MediServiceBrandList = [];
    });
  }

  onAddMediServiceBrand(isEdit: boolean, data: MediServiceBrand) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.MediServiceBrand = new MediServiceBrand();
    this.aduitpurpose='';
    this.oldMediServiceBrand=new MediServiceBrand();
    if (this.isEdit) {
      Object.assign(this.oldMediServiceBrand, data);
      this.MediServiceBrand = Object.assign({}, data);
    }
    else {
      this.MediServiceBrand = new MediServiceBrand();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveMediServiceBrand() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
   // if (!this.MediServiceBrandList.some(s => s.name.toLowerCase() == this.MediServiceBrand.name.toLowerCase() && s.id != this.MediServiceBrand.id)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.MediServiceBrand.isActive = true;
        this.MediServiceBrand.createdBy = this.currentUser.employeeId;
        this.MediServiceBrand.createdOn = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_BRAND_INSERT_API, this.MediServiceBrand);
      }
      else {
        this.auditType="Update";
        this.MediServiceBrand.modifiedBy = this.currentUser.employeeId;
        this.MediServiceBrand.modifiedOn = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MED_SERVICE_BRAND_INSERT_API, this.MediServiceBrand.id, this.MediServiceBrand);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' MediServiceBrand data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.MediServiceBrand.id;
          this.insertAuditLog(this.oldMediServiceBrand,this.MediServiceBrand,Id);
          this.getMediServiceBrandList();
        }
        else
          this.errMsgPop = data;

      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
    //}
    // else {
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'MediServiceBrand name already exists';
    // }
  }
  deleteMediServiceBrand(data: MediServiceBrand): void {
    this.MediServiceBrand = new MediServiceBrand();
    this.aduitpurpose='';
    this.oldMediServiceBrand=new MediServiceBrand();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.MediServiceBrand, data);
        let connection: any;
        this.auditType="Delete";
        this.MediServiceBrand.isActive = false;
        this.MediServiceBrand.modifiedBy = this.currentUser.employeeId;
        this.MediServiceBrand.modifiedOn = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MED_SERVICE_BRAND_INSERT_API, this.MediServiceBrand.id, this.MediServiceBrand);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.MediServiceBrand,this.oldMediServiceBrand,this.MediServiceBrand.id);
            this.getMediServiceBrandList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting MediServiceBrand..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='MediServiceBrand'; // Change MasterName
  insertAuditLog(oldObj: MediServiceBrand, newObj: MediServiceBrand, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.brandCode;
    oldObject.description = oldObj.brandDesc;

    newObject.name = newObj.brandCode;
    newObject.description = newObj.brandDesc;

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
    auditlog.keyValue=newObj.brandCode?newObj.brandCode:oldObj.brandCode;
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
