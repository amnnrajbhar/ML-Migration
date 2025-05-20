import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { RoomRackBin } from './RoomRackBin.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import * as _ from "lodash";
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
import { DocCreate } from '../DocCreate/DocCreate.model';
declare var jQuery: any;
export class actionItemModel {
  location: string;
  category: string;
  room: string;
  rack: string;
  bin: string;
}
@Component({
  selector: 'app-RoomRackBin',
  templateUrl: './RoomRackBin.component.html',
  styleUrls: ['./RoomRackBin.component.css']
})
export class RoomRackBinComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) desigForm: NgForm;
  public filteredItems = [];

  public tableWidget: any;
  public tableWidget1: any;

  selParentId: any;
  RoomRackBinList: any[];
  RoomRackBinList1: any = [];
  desgList: any;
  parentList: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  RoomRackBinItem: RoomRackBin = new RoomRackBin();
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
  oldRoomRackBinItem: RoomRackBin = new RoomRackBin();// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  locListCon = [];
  locListCon1 = [];
  Barcode: string;
  DOCNO: string;

  filterLocation: string = '';
  filterBarcode: string = '';
  filterBoxNo: string = '';

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#categTable');
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

  private initDatatable1(): void {
    let exampleId: any = jQuery('#boxTable1');
    this.tableWidget1 = exampleId.DataTable({
      "order": []
    });
  }

  private reInitDatatable1(): void {
    if (this.tableWidget1) {
      this.tableWidget1.destroy()
      this.tableWidget1 = null
    }
    setTimeout(() => this.initDatatable1(), 0)
  }
  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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

  clearFilter() {
    this.filterBarcode = '';
    this.filterBoxNo = '';
  }



  locationAllList: any[] = [[]];
  locationList: any[] = [[]];
  locationCode: string;
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locationCode = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
        let temp = this.locationList.find(x => x.id == this.currentUser.baselocation);
        this.filterLocation = temp.code + ' - ' + temp.name;
        //this.getBoxBarcodeMasterList();
        this.getLocRackList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  LocRackList: any[] = [];
  RoomList: any[] = [];
  RackList: any[] = [];
  BinList: any[] = [];
  getLocRackList() {
    this.httpService.DLSgetByParam(APIURLS.BR_LOC_RACK_DETAILS_GETBYPARAM, this.locationCode).then((data: any) => {
      if (data.length > 0) {

        this.LocRackList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.LocRackList.sort((a, b) => { return collator.compare(a.name, b.name) });
        // this.CategoryList.filter(x=>x.location==this.locationCode);
        this.RoomList = this.LocRackList.filter((item, i, arr) => arr.findIndex((t) => t.room === item.room) === i);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.LocRackList = [];
    });

  }
  rowcount: number = 0;
  dynamicArray: any = [];
  newDynamic: any = {};
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, room: null, rack: "", bin: null, prefix: "", stored: "0" };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  GetRacMasterkList(room) {
    this.RackList = this.LocRackList.filter(x => x.room == room  ).filter((item, i, arr) => arr.findIndex((t) => t.rack === item.rack) === i);
  }
  GetBins(item) {
    this.BinList = this.LocRackList.filter(x => x.room == item.room && x.rack == item.rack && x.bin != null && x.bin != '');
  }

  Type: string = '';
  onAddRoomRackBin(isEdit: boolean, data: RoomRackBin, value: string) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();
    this.Type = '';
    this.Type = value;
    this.notFirst = true;
    this.dynamicArray = [];
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.RoomRackBinItem = new RoomRackBin();
    this.aduitpurpose = '';
    this.oldRoomRackBinItem = new RoomRackBin();
    if (this.isEdit) {
      Object.assign(this.oldRoomRackBinItem, data);
      this.RoomRackBinItem = Object.assign({}, data);
      // this.RoomList=this.LocRackList;
      this.RackList = this.LocRackList;
      this.BinList = this.LocRackList;

    }
    else {
      this.RoomRackBinItem = new RoomRackBin();
      this.rowcount = 1;
      let newDynamic = { id: this.rowcount, room: null, rack: "", bin: null, prefix: "", stored: "0" };
      this.dynamicArray.push(newDynamic);
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveRoomRackBin() {
    this.errMsg = "";
    this.errMsgPop1 = "";
    this.isLoadingPop = true;
    let connection: any;

    this.dynamicArray.forEach(element => {
      if (this.Type == 'Bin') {
        if (!this.LocRackList.some(s => s.room.toLowerCase() == element.room.toLowerCase() && s.rack.toLowerCase() == element.rack.toLowerCase() &&
          s.location.toLowerCase() == this.locationCode.toLowerCase() 
          && s.bin == element.bin)) {
          if (!this.isEdit) {
            this.auditType = "Create";
            this.RoomRackBinItem.room = element.room;
            this.RoomRackBinItem.rack = element.rack;
            this.RoomRackBinItem.bin = element.bin;
            this.RoomRackBinItem.prefix = element.prefix;
            this.RoomRackBinItem.location = this.locationCode;
            this.RoomRackBinItem.createdBy = this.currentUser.employeeId;
            this.RoomRackBinItem.createdDate = new Date().toLocaleString();
            connection = this.httpService.DLSpost(APIURLS.BR_LOC_RACK_DETAILS_MASTER_INSERT, this.RoomRackBinItem);
          }
          else {
            this.auditType = "Update";
            this.RoomRackBinItem.room = element.room;
            this.RoomRackBinItem.rack = element.rack;
            this.RoomRackBinItem.bin = element.bin;
            this.RoomRackBinItem.prefix = element.prefix;
            this.RoomRackBinItem.location = this.locationCode;
            this.RoomRackBinItem.modifiedBy = this.currentUser.employeeId;
            this.RoomRackBinItem.modifiedDate = new Date().toLocaleString();
            connection = this.httpService.DLSput(APIURLS.BR_LOC_RACK_DETAILS_MASTER_INSERT, this.RoomRackBinItem.id, this.RoomRackBinItem);
          }

          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.id>0) {
              this.errMsgPop1 = ' Room/Rack/Bin ' + this.RoomRackBinItem.room + ' created successfully!';
              let Id = !this.isEdit ? data.id : this.RoomRackBinItem.id;
              this.insertAuditLog(this.oldRoomRackBinItem, this.RoomRackBinItem, Id);
              // this.getLocRackList();
              swal({
                title: "Message",
                text: this.errMsgPop1,
                buttons: [false, true],
              })
              
            }
            else
              this.errMsgPop1 = ' Room/Rack/Bin ' + this.RoomRackBinItem.room + ' created successfully!';;

          }).catch(error => {
            this.isLoadingPop = false;
            if (this.Type != 'Bin') {
              this.errMsgPop1 = 'Error saving ' + this.RoomRackBinItem.room + ',' + this.RoomRackBinItem.rack + ',' + this.RoomRackBinItem.bin;
            }
            else {
              this.errMsgPop1 = 'Error saving ' + this.RoomRackBinItem.room + ',' + this.RoomRackBinItem.rack;
            }
          });
        }
        else {
          this.isLoadingPop = false;
          this.errMsgPop1 = element.room + ',' + element.rack + ',' + element.bin + ' ==> Room/Rack/Bin combination already exists';
          swal({
            title: "Message",
            text: this.errMsgPop1,
            buttons: [false, true],
          })
          return;
        }
      }
      else {
        if (!this.LocRackList.some(s => s.room.toLowerCase() == element.room.toLowerCase() && s.rack.toLowerCase() == element.rack.toLowerCase() &&
          s.location.toLowerCase() == this.locationCode.toLowerCase())) {
          if (!this.isEdit) {
            this.auditType = "Create";
            this.RoomRackBinItem.room = element.room;
            this.RoomRackBinItem.rack = element.rack;
            this.RoomRackBinItem.bin = element.bin;
            this.RoomRackBinItem.prefix = element.prefix;
            this.RoomRackBinItem.location = this.locationCode;
            this.RoomRackBinItem.createdBy = this.currentUser.employeeId;
            this.RoomRackBinItem.createdDate = new Date().toLocaleString();
            connection = this.httpService.DLSpost(APIURLS.BR_LOC_RACK_DETAILS_MASTER_INSERT, this.RoomRackBinItem);
          }
          else {
            this.auditType = "Update";
            this.RoomRackBinItem.room = element.room;
            this.RoomRackBinItem.rack = element.rack;
            this.RoomRackBinItem.bin = element.bin;
            this.RoomRackBinItem.prefix = element.prefix;
            this.RoomRackBinItem.location = this.locationCode;
            this.RoomRackBinItem.modifiedBy = this.currentUser.employeeId;
            this.RoomRackBinItem.modifiedDate = new Date().toLocaleString();
            connection = this.httpService.DLSput(APIURLS.BR_LOC_RACK_DETAILS_MASTER_INSERT, this.RoomRackBinItem.id, this.RoomRackBinItem);
          }

          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.id>0) {
              this.errMsgPop1 = ' Room/Rack/Bin ' + this.RoomRackBinItem.room + ' created successfully!';
              let Id = !this.isEdit ? data.id : this.RoomRackBinItem.id;
              this.insertAuditLog(this.oldRoomRackBinItem, this.RoomRackBinItem, Id);
              // this.getLocRackList();
              swal({
                title: "Message",
                text: this.errMsgPop1,
                buttons: [false, true],
              })
            }
            else
              this.errMsgPop1 = ' Room/Rack/Bin ' + this.RoomRackBinItem.room + ' created successfully!';;

          }).catch(error => {
            this.isLoadingPop = false;
            if (this.Type == 'Bin') {
              this.errMsgPop1 = 'Error saving ' + this.RoomRackBinItem.room + ',' + this.RoomRackBinItem.rack + ',' + this.RoomRackBinItem.bin;
            }
            else {
              this.errMsgPop1 = 'Error saving ' + this.RoomRackBinItem.room + ',' + this.RoomRackBinItem.rack;
            }
          });
        }
        else {
          this.isLoadingPop = false;
          this.errMsgPop1 = element.room + ',' + element.rack + ' ==> Room and Rack Already Exists';
          swal({
            title: "Message",
            text: this.errMsgPop1,
            buttons: [false, true],
          })
          return;
        }
      }

      this.getLocRackList();
    });
    jQuery("#myModal").modal('hide');
    //this.errMsgPop1 = ' Box '+this.RoomRackBinItem.room +' created successfully!';
   
  }
  deleteRoomRackBin(data: RoomRackBin): void {
    this.RoomRackBinItem = new RoomRackBin();
    this.aduitpurpose = '';
    this.oldRoomRackBinItem = new RoomRackBin();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.RoomRackBinItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.RoomRackBinItem.modifiedBy = this.currentUser.employeeId;
        this.RoomRackBinItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_BOX_DETAILS_INSERT_API, this.RoomRackBinItem.id, this.RoomRackBinItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.RoomRackBinItem, this.oldRoomRackBinItem, this.RoomRackBinItem.id);
            this.getLocRackList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting RoomRackBin..';
        });
      }
    });
  }

  //AuditLogging
  masterName: string = 'RoomRackBin'; // Change MasterName
  insertAuditLog(oldObj: RoomRackBin, newObj: RoomRackBin, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();


    oldObject.bin = oldObj.bin;
    oldObject.location = oldObj.location;
    oldObject.room = oldObj.room;
    oldObject.rack = oldObj.rack;

    newObject.bin = newObj.bin;
    newObject.location = newObj.location;
    newObject.room = newObj.room;
    newObject.rack = newObj.rack;

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
    auditlog.keyValue = newObj.room ? newObj.room : oldObj.room;
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
