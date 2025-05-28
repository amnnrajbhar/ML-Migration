import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { BoxBarcode } from './BoxBarcode.model';
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
    location: string
    boxNo: string
    boxDescription: string
    boxBarcode1: string
    boxStatus: string
    room: string
    rack: string
    bin: string
}
@Component({
  selector: 'app-BoxBarcode',
  templateUrl: './BoxBarcode.component.html',
  styleUrls: ['./BoxBarcode.component.css']
})
export class BoxBarcodeComponent implements OnInit {
  searchTerm: FormControl = new FormControl();
@ViewChild(NgForm, { static: false }) desigForm!: NgForm;

  public filteredItems = [];

  public tableWidget: any;
  public tableWidget1: any;

  selParentId: any;
  BoxBarcodeList!: any[];
  BoxBarcodeList1: any = [];
  desgList: any;
  parentList!: any[];
  selParentRole: any = [];
  selParentRoleList: any;
  requiredField: boolean = true;
  boxbarcodeItem: BoxBarcode = new BoxBarcode();
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
  oldboxbarcodeItem: BoxBarcode = new BoxBarcode();// For aduit log
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  locListCon = [];
  locListCon1 = [];
  Barcode:string;
  DOCNO:string;

  filterLocation:string='';
  filterBarcode:string='';
  filterBoxNo:string='';

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
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
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

  clearFilter()
  {
    this.filterBarcode='';
    this.filterBoxNo='';
  }



  locationAllList: any[] = [[]];
  locationList: any[] = [[]];
  locationCode: string
  getLocationMaster() {
      this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
          if (data.length > 0) {
              this.locationAllList = data;
              this.locationList = data.filter((x:any)  => x.isActive);
              let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
              this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
              this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
              this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
              this.locationCode = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation).code;
              let temp=this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
              this.filterLocation=temp.code+' - '+temp.name;
              //this.getBoxBarcodeMasterList();
              this.getLocRackList();
          }
      }).catch((error)=> {
          this.isLoading = false;
          this.locationList = [];
      });
  }
  getBoxBarcodeMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    let searchStr=this.filterBarcode+'~'+this.filterBoxNo+'~'+this.locationCode;
    this.httpService.DLSgetByParam(APIURLS.BR_BOX_DETAILS_GET_LOC_API,searchStr).then((data: any) => {
      if (data.length > 0) {
        this.BoxBarcodeList = data.sort((a:any,b:any)=>{
                                    if(a.boxNo > b.boxNo) return 1;
                                    if(a.boxNo < b.boxNo) return -1;
                                    return 0;
                                });
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.BoxBarcodeList = [];
    });
  }
  LocRackList:any[]=[];
  RoomList:any[]=[];
  RackList:any[]=[];
  BinList:any[]=[];
  getLocRackList() {
    this.httpService.DLSgetByParam(APIURLS.BR_LOC_RACK_DETAILS_GETBYPARAM,this.locationCode).then((data: any) => {
        if (data.length > 0) {

            this.LocRackList = data;
            let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
            this.LocRackList.sort((a:any, b:any) => { return collator.compare(a.name, b.name) });
            // this.CategoryList.filter((x:any)=>x.location==this.locationCode);
            this.RoomList = this.LocRackList.filter((item, i, arr) => arr.findIndex((t) => t.room === item.room) === i);
        }
        this.isLoading = false;
    }).catch((error)=> {
        this.isLoading = false;
        this.LocRackList = [];
    });

}
    GetRacMasterkList(room)
    {
        this.RackList=this.LocRackList.filter((x:any)=>x.room==room).filter((item, i, arr) => arr.findIndex((t) => t.rack === item.rack) === i);
    }
    GetBins(item)
    {
        this.BinList=this.LocRackList.filter((x:any)=>x.room==item.room && x.rack==item.rack);
    }
  onAddBoxBarcode(isEdit: boolean, data: BoxBarcode) {
    this.desigForm.form.markAsPristine();
    this.desigForm.form.markAsUntouched();
    this.desigForm.form.updateValueAndValidity();

    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.boxbarcodeItem = new BoxBarcode();
    this.aduitpurpose='';
    this.oldboxbarcodeItem=new BoxBarcode();
    if (this.isEdit) {
      Object.assign(this.oldboxbarcodeItem, data);
      this.boxbarcodeItem = Object.assign({}, data);
     // this.RoomList=this.LocRackList;
      this.RackList=this.LocRackList;
      this.BinList=this.LocRackList;

    }
    else {
      this.boxbarcodeItem = new BoxBarcode();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }
  onSaveBoxBarcode() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    // if (!this.BoxBarcodeList.some((s:any) => s.boxNo.toLowerCase() == this.boxbarcodeItem.boxNo.toLowerCase() && s.boxBarcode1 == this.boxbarcodeItem.boxBarcode1
    //                                 && s.location==this.locationCode)) {
      if (!this.isEdit) {
        this.auditType="Create";
        this.boxbarcodeItem.location=this.locationCode;
        this.boxbarcodeItem.createdBy = this.currentUser.employeeId;
        this.boxbarcodeItem.createdDate = new Date().toLocaleString();
        connection = this.httpService.DLSpost(APIURLS.BR_BOX_DETAILS_INSERT_API, this.boxbarcodeItem);
      }
      else {
        this.auditType="Update";
        this.boxbarcodeItem.location=this.locationCode;
        this.boxbarcodeItem.modifiedBy = this.currentUser.employeeId;
        this.boxbarcodeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.DLSput(APIURLS.BR_BOX_DETAILS_INSERT_API, this.boxbarcodeItem.id, this.boxbarcodeItem);
      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = ' Box '+this.boxbarcodeItem.boxNo +' created successfully!';
          jQuery("#saveModal").modal('show');
          let Id=!this.isEdit?data.id:this.boxbarcodeItem.id;
          this.insertAuditLog(this.oldboxbarcodeItem,this.boxbarcodeItem,Id);
          this.getBoxBarcodeMasterList();
        }
        else
          this.errMsgPop = data;

      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving department data..';
      });
   // }
    // else {
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'BoxBarcode name already exists';
    // }
  }
  deleteBoxBarcode(data: BoxBarcode): void {
    this.boxbarcodeItem = new BoxBarcode();
    this.aduitpurpose='';
    this.oldboxbarcodeItem=new BoxBarcode();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.boxbarcodeItem, data);
        let connection: any;
        this.auditType="Delete";
        this.boxbarcodeItem.modifiedBy = this.currentUser.employeeId;
        this.boxbarcodeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_BOX_DETAILS_INSERT_API, this.boxbarcodeItem.id, this.boxbarcodeItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.boxbarcodeItem,this.oldboxbarcodeItem,this.boxbarcodeItem.id);
            this.getBoxBarcodeMasterList();
          }
        }).catch((error) => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting BoxBarcode..';
        });
      }
    });
  }
  dynamicArray:any[]=[];
  getBoxDetails(box)
  {
    this.errMsg = "";
    this.dynamicArray=[];
    this.DocList=[];
   // this.isLoading = true;
    this.boxbarcodeItem=Object.assign({},box);
    this.httpService.DLSgetByParam(APIURLS.BR_BOX_DETAILS_GET_ADD_API,box.boxNo.trim()).then((data: any) => {
      if (data.length > 0) {
        this.dynamicArray = data;
      }
      jQuery("#BoxViewModel").modal('show');
      this.reInitDatatable1();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.dynamicArray = [];
    });
  }
  DocList:any[]=[];
  getDocDetails()
  {
    this.errMsg = "";
    this.isLoading = true;
    var srcstring=this.DOCNO+','+this.Barcode;
    //this.boxbarcodeItem=Object.assign({},box);
    this.httpService.DLSgetByParam(APIURLS.BR_DOC_CREATE_GETBYPARAM,srcstring).then((data: any) => {
      if (data.length > 0) {
        this.DocList = data;
      }
    //  jQuery("#BoxViewModel").modal('show');
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.DocList = [];
    });
  }
    ClearDoc()
    {
        this.Barcode='';
        this.DOCNO='';
    }

    removeDoc(item)
    {
        let connection:any;
        this.DocCreateModel=Object.assign({},item);
        this.DocCreateModel.boxNo='';
        this.DocCreateModel.boxBarcode='';
        this.DocCreateModel.boxDescription='';
        this.boxbarcodeItem.modifiedBy = this.currentUser.employeeId;
        this.boxbarcodeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.DLSput(APIURLS.BR_DOC_CREATE_MASTER_INSERT, this.DocCreateModel.id, this.DocCreateModel);
      
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          jQuery("#myModal").modal('hide');
          swal({
            title:"Message",
            text: "Document Removed Successfully",
            icon: "success",
            dangerMode: false,
            buttons: [false, true],
          })
          if (this.dynamicArray.length > 0) {
            const index = this.dynamicArray.indexOf(item);
            this.dynamicArray.splice(index, 1);
          }
         // this.getBoxDetails(this.boxbarcodeItem.boxNo);
        }
      
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error removing from box..';
      });
    }
    DocCreateModel={} as DocCreate;
    updateDoc(box)
    {
        let connection:any;
        this.DocCreateModel=Object.assign({},this.DocList[0]);
        this.DocCreateModel.boxNo=box.boxNo;
        this.DocCreateModel.boxBarcode=box.boxBarcode1;
        this.DocCreateModel.boxDescription=box.boxDescription;
        this.DocCreateModel.docRack=box.rack;
        this.DocCreateModel.docRoom=box.room;
        this.DocCreateModel.docBin=box.bin;        
        this.DocCreateModel.boxNo=box.boxNo;
        this.boxbarcodeItem.modifiedBy = this.currentUser.employeeId;
        this.boxbarcodeItem.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.DLSput(APIURLS.BR_DOC_CREATE_MASTER_INSERT, this.DocCreateModel.id, this.DocCreateModel);
      
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data.length == null) {
          jQuery("#BoxViewModel").modal('hide');
          this.errMsgPop1 = ' Document Added to the Box '+ box.boxNo +' Successfully';
          jQuery("#saveModal").modal('show');      
         // this.getBoxBarcodeMasterList();
        }
        else
          this.errMsgPop = data;

      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error adding to box..';
      });
    }

  //AuditLogging
  masterName:string='BoxBarcode'; // Change MasterName
  insertAuditLog(oldObj: BoxBarcode, newObj: BoxBarcode, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();

    oldObject.boxNo = oldObj.boxNo;
    oldObject.bin = oldObj.bin;
    oldObject.boxBarcode1= oldObj.boxBarcode1;
    oldObject.boxDescription = oldObj.boxDescription;
    oldObject.location=oldObj.location;
    oldObject.room = oldObj.room;
    oldObject.rack = oldObj.rack;

    newObject.boxNo = newObj.boxNo;
    newObject.bin = newObj.bin;
    newObject.boxBarcode1= newObj.boxBarcode1;
    newObject.boxDescription = newObj.boxDescription;
    newObject.location=newObj.location;
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
    auditlog.keyValue=newObj.boxNo?newObj.boxNo:oldObj.boxNo;
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
