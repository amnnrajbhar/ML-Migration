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
import { RepositoryDomains } from './RepositoryDomains.model';
declare var jQuery: any;
export class actionItemModel {
  name: string
  description: string
  softwareid:number;
}
@Component({
  selector: 'app-RepositoryDomains',
  templateUrl: './RepositoryDomains.component.html',
  styleUrls: ['./RepositoryDomains.component.css']
})
export class RepositoryDomainsComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
@ViewChild(NgForm, { static: false }) desigForm!: NgForm;

  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  RepositoryDomainsList: any[]=[];
  RepositoryDomainsList1: any = [];
  desgList: any;
  parentList!: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  RepositoryDomains: RepositoryDomains = new RepositoryDomains();
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
  oldRepositoryDomains: RepositoryDomains = new RepositoryDomains();// For aduit log
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
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
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.getRepositoryDomainsList();
    this.getsoftwareMasterList();
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

  softwareList:any;
  getsoftwareMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data
      }
     // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.softwareList = [];
    });
  }

  
  getRepositoryDomainsList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.RepositoryDomainsList=[];
    this.httpService.get(APIURLS.BR_REPOSITORY_DOMAINS_API).then((data: any) => {
      if (data.length > 0) {
        this.RepositoryDomainsList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.RepositoryDomainsList = [];
    });
  }
  getsoftName(id)
  {
    let name=this.softwareList.find(x=>x.id == id);
    return name ? name.name:'';
  }
  onAddRepositoryDomains(isEdit: boolean, data: RepositoryDomains) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.RepositoryDomains = new RepositoryDomains();
    this.aduitpurpose='';
    this.oldRepositoryDomains=new RepositoryDomains();
    if (this.isEdit) {
      Object.assign(this.oldRepositoryDomains, data);
      this.RepositoryDomains = Object.assign({}, data);
    }
    else {
      this.RepositoryDomains = new RepositoryDomains();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveRepositoryDomains() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
   // if (!this.RepositoryDomainsList.some((s:any) => s.name.toLowerCase() == this.RepositoryDomains.name.toLowerCase() && s.id != this.RepositoryDomains.id)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.RepositoryDomains.isActive = true;
        this.RepositoryDomains.createdBy = this.currentUser.employeeId;
       // this.RepositoryDomains.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_REPOSITORY_DOMAINS_INSERT_API, this.RepositoryDomains);
      }
      else {
        this.auditType="Update";
        this.RepositoryDomains.modifiedBy = this.currentUser.employeeId;
        //this.RepositoryDomains.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_REPOSITORY_DOMAINS_INSERT_API, this.RepositoryDomains.id, this.RepositoryDomains);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' RepositoryDomains data saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.RepositoryDomains.id;
          this.insertAuditLog(this.oldRepositoryDomains,this.RepositoryDomains,Id);
          this.getRepositoryDomainsList();
        }
        else
          this.errMsgPop = data;

      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
    //}
    // else {
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'RepositoryDomains name already exists';
    // }
  }
 

  deleteRepositoryDomains(data: RepositoryDomains): void {
    this.RepositoryDomains = new RepositoryDomains();
    this.aduitpurpose='';
    this.oldRepositoryDomains=new RepositoryDomains();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.RepositoryDomains, data);
        let connection: any;
        this.auditType="Delete";
        this.RepositoryDomains.isActive = false;
        this.RepositoryDomains.modifiedBy = this.currentUser.employeeId;
        this.RepositoryDomains.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_REPOSITORY_DOMAINS_INSERT_API, this.RepositoryDomains.id, this.RepositoryDomains);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.RepositoryDomains,this.oldRepositoryDomains,this.RepositoryDomains.id);
            this.getRepositoryDomainsList();
          }
        }).catch((error) => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting Designation..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='RepositoryDomains'; // Change MasterName
  insertAuditLog(oldObj: RepositoryDomains, newObj: RepositoryDomains, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.name = oldObj.name;
    oldObject.description = oldObj.description;
    oldObject.softwareid=oldObj.fkSoftwareId;


    newObject.name = newObj.name;
    newObject.description = newObj.description;
    newObject.softwareid=newObj.fkSoftwareId;

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
