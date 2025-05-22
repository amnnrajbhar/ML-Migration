import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { SoftwareRoles } from './SofwareRoles.model';
declare var jQuery: any;
export class actionItemModel {
  role: string;
  sequenceNo: number;
  softwareid:number;
  isbold:boolean;
}
@Component({
  selector: 'app-SofwareRoles',
  templateUrl: './SofwareRoles.component.html',
  styleUrls: ['./SofwareRoles.component.css']
})
export class SoftwareRolesComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;

  @ViewChild('myInput') myInputVariable: ElementRef;

  public filteredItems = [];

  public tableWidget: any;
  selParentId: any;
  softwareList: any[];
  softwareRolesList: any[];
  softwareList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  software: SoftwareRoles = new SoftwareRoles();
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
  oldsoftware: SoftwareRoles = new SoftwareRoles();// For aduit log
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
    this.getsoftwareMasterList();
    this.getsoftwareRolesMasterList();
    this.getLocationMaster();
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

  locationList:any[]=[];
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationList = data.filter(x => x.isActive);
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  getsoftwareMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data.filter(x => x.isActive).sort((a,b)=>{
                                    if(a.name > b.name) return 1;
                                    if(a.name < b.name) return -1;
                                    return 0;
                                });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareList = [];
    });
  }
  Getsoftwares()
  {
    this.softwareList1 = this.softwareList.filter(x=>x.location == this.software.location);
  }

  getsoftName(id)
  {
    let name=this.softwareList.find(x=>x.id == id);
    return name ? name.name:'';
  }


  getsoftwareRolesMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareRolesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_ROLES_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareRolesList = data.filter(x => x.isActive).sort((a,b)=>{
                                    if(a.name > b.name) return 1;
                                    if(a.name < b.name) return -1;
                                    return 0;
                                });
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareRolesList = [];
    });
  }

  onAddSoftwareRole(isEdit: boolean, data: SoftwareRoles) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.software = new SoftwareRoles();
    this.aduitpurpose='';
    this.oldsoftware=new SoftwareRoles();
    if (this.isEdit) {
      Object.assign(this.oldsoftware, data);
      this.software = Object.assign({}, data);
    }
    else {
      this.software = new SoftwareRoles();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSavesoftwareRole() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
   // if (!this.softwareList.some(s => s.name.toLowerCase() == this.software.role.toLowerCase() && s.id != this.software.id)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.software.isActive = true;
        this.software.createdBy = this.currentUser.employeeId;
        // this.software.createdOn = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_SOFTWARE_ROLES_INSERT_API, this.software);
      }
      else {
        this.auditType="Update";
        this.software.lastModifiedBy = this.currentUser.employeeId;
        // this.software.lastModifiedOn = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_SOFTWARE_ROLES_INSERT_API, this.software.id, this.software);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' software role saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.software.id;
          this.insertAuditLog(this.oldsoftware,this.software,Id);
          this.getsoftwareRolesMasterList();
        }
        else
          this.errMsgPop = data;

      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving software role data..';
      });
   // }
    // else {
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'software role  already exists';
    // }
  }
  deletesoftwarerole(data: SoftwareRoles): void {
    this.software = new SoftwareRoles();
    this.aduitpurpose='';
    this.oldsoftware=new SoftwareRoles();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.software, data);
        let connection: any;
        this.auditType="Delete";
        this.software.isActive = false;
        this.software.lastModifiedBy = this.currentUser.employeeId;
        this.software.lastModifiedOn = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_SOFTWARE_ROLES_INSERT_API, this.software.id, this.software);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.software,this.oldsoftware,this.software.id);
            this.getsoftwareMasterList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting software role..';
        });
      }
    });
  }
  //AuditLogging
  masterName:string='softwareRoles'; // Change MasterName
  insertAuditLog(oldObj: SoftwareRoles, newObj: SoftwareRoles, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.role = oldObj.role;
    oldObject.sequenceNo = oldObj.sequenceNo;
    oldObject.softwareid = oldObj.sid;
    oldObject.isbold = oldObj.isBold;

    newObject.role = newObj.role;
    newObject.sequenceNo = newObj.sequenceNo;
    newObject.softwareid = newObj.sid;
    newObject.isbold = newObj.isBold;


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
    auditlog.keyValue=newObj.role?newObj.role:oldObj.role;
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
 //excel upload methods
 isSubmitting: boolean;
 errorlist: string;
 uploadfiles(files: File) {
  // this.id='VM001';
  this.file = files[0];
}
 formData: FormData = new FormData();
 file: File; successMsg: string = "";
  upload(): any {
    let connection: any;
    this.isSubmitting = true;
    this.isLoading = true;
    this.formData = new FormData();
    this.formData.append('file', this.file);
    connection = this.httpService.ExcelUploadForSoftwareRoles(APIURLS.UPLOAD_SOFTWARE_ROLES, this.currentUser.employeeId, this.formData);
    connection.then((data: any) => {
      if (data) {

        if (data[0].type == 'E') {
          this.isLoading = false;
          this.errorlist = 'Error List';
          data.forEach(element => {
            this.errorlist = this.errorlist + '\n' + element.message;

          });

          alert(this.errorlist);
          this.reset();
          return;
        }
        else {
          let reqNoList: any[] = [];
          let reqnumber: string = '';
          if (data.length > 0) {
            reqNoList = data.filter(x => x.id > 0);
          }
          reqNoList.forEach(element => {
            reqnumber = reqnumber + "\n" + element.requestNo;
          });

          this.isLoading = false;
          swal({
            title: "Message",
            text: "Excel uploaded successfully ",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.reset(); 
      }

    }).catch(error => {
      this.isLoading = false;
      this.errMsgPop = 'Error uploading file ..';
    });
  }

  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }
}
