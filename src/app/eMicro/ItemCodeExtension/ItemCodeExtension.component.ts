import { AuthData } from '../../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Payroll } from '../../masters/employee/employee-payroll.model';
import { Role } from '../../profile/add-role/add-role.model';
import { debug } from 'util';
import { Location } from '../../masters/employee/location.model';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { ItemCodeExtension } from '../ItemCodeExtension/ItemCodeExtension.model';
import { ProcessMaster } from '../Masters/ProcessMaster/ProcessMaster.model';
import { MaterialGroup } from '../Masters/MaterialGroup/MaterialGroup.model';
import { StorageLocation } from '../Masters/StorageLocation/StorageLocation.model';
import { MaterialType } from '../../masters/material/materialtype.model';
import { UOM } from '../../masters/uom/uom.model';
import { DmfGrade } from '../Masters/dmfgrademaster/dmfgrademaster.model';
import { PharmaGrade } from '../Masters/PharmacopeialGrade/PharmacopeialGrade.model';
import { PurchaseGroup } from '../Masters/PurchaseGroup/PurchaseGroup.model';
import { Transactions } from '../ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { StorageCondition } from '../Masters/storagecondition/storagecondition.model';
import { TempCondition } from '../Masters/tempcondition/tempcondition.model';
import { Country } from '../Masters/Country/Country.model';
import { stringify } from 'querystring';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';
declare var require: any;

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-ItemCodeExtension',
  templateUrl: './ItemCodeExtension.component.html',
  styleUrls: ['./ItemCodeExtension.component.css']
})
export class ItemCodeExtensionComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
  // @ViewChild(NgForm  , { static: false })dataForm: NgForm;
  // @ViewChild(NgForm  , { static: false })PMForm: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKForm: NgForm;
  // @ViewChild(NgForm  , { static: false })RMNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })PMNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })FGNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })LCNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })OSENGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })PPCNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })RMForm: NgForm;
  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;
  searchTermBaseLoc = new FormControl();
  public filteredItemsBaseLoc = [];
  searchTermMgr = new FormControl();
  public filteredItemsMgr = [];
  searchTermRMgr = new FormControl();
  public filteredItemsRMgr = [];
  public tableWidget: any;

  locListCon = [];
  locListCon1 = [];

  isLoading: boolean = false;
  errMsg: string = "";
  errMsg1: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;

  formData: FormData = new FormData();
  file: File; successMsg: string = "";
  path: string = '';
  locationList: any[] = [[]];
  locationList1: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;

  ItemCodeExtensionModel = {} as ItemCodeExtension;
  ItemCodeRequestModel = {} as ItemCodeRequest;
  ItemCodeRequestModelList: ItemCodeRequest[] = [];

  ItemCodeExtensionlist: ItemCodeExtension[] = [];
  materialtype: string;
  comments: string;
  filterMaterialCode: string = null;
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  ItemCodeExtensionFilter: ItemCodeExtension[] = [];
  emailid: string;
  requestdate: Date;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string;


  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;

  ItemCodeExtensionModeldata = {} as ItemCodeExtension;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //  this.baseLocation = this.currentUser.baselocation;
    this.emailid = this.currentUser.email;
    this.userid = this.currentUser.employeeId;
    this.requestdate = new Date(this.today);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);

    // if (chkaccess == true) {
    this.pageNo = 1;
    this.getAllEntries();
    this.getLocationMaster();
    this.getstoragelocationList();
    this.getMaterialMasterList();
    this.getMaterialGroupList();
    this.getUOMMasterList();
    // this.getlist();
    // }
    // else {
    //   this.router.navigate(["/unauthorized"]);
    // }
  }

  uploadedFile(event) {
    this.fileUploaded = event.target.files[0];
    this.readExcel();
  }

  readExcel() {
    let readFile = new FileReader();
    readFile.onload = (e) => {
      this.storeData = readFile.result;
      var data = new Uint8Array(this.storeData);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      this.worksheet = workbook.Sheets[first_sheet_name];
      this.jsonData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
      this.ItemCodeExtensionlist = this.jsonData;
      //this.jsonData = JSON.stringify(this.jsonData);  
      // console.log(this.jsonData);

    }
    readFile.readAsArrayBuffer(this.fileUploaded);
  }


  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }
  periodtype: any[] = [
    { id: 1, name: 'Days' },
    { id: 2, name: 'Months' }
  ];
  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Pending' },
    { id: 4, name: 'Rejected' },
    { id: 5, name: 'Completed' },
    { id: 6, name: 'Deleted' }
  ];
  approverstatuslist: any[] = [
    { id: 1, name: 'Reviewed' },
    { id: 2, name: 'Reviewed' },
    { id: 3, name: 'Reviewed' },
    { id: 4, name: 'Approved' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Created' },
    { id: 7, name: 'Closed' }
  ];

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  getFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2) + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }


  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filterMaterialCode = null;
    this.filterlocation = null;
    this.filterstatus = null;
    this.filterrequest = null;

  }


  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
  }

  isGoLoading: boolean = false;
  getAllEntries() {
    this.isLoading = true;
    this.isGoLoading = true;

    let td = new Date();
    let formatedFROMdate: string;
    let formatedTOdate: string;
    var filterModel: any = {};
    if (this.from_date == '' || this.from_date == null) {
      formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
      this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
    }
    else {
      let fd = new Date(this.from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        ("00" + fd.getDate()).slice(-2);
      this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

    }

    if (this.to_date == '' || this.to_date == null) {
      formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
        ("00" + td.getDate()).slice(-2);
      this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
    }
    else {
      let ed = new Date(this.to_date);
      formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
        ("00" + ed.getDate()).slice(-2);
      this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

    }
    filterModel.materialCode = this.filterMaterialCode;
    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    filterModel.approver = this.currentUser.employeeId;
    filterModel.pageNo=this.pageNo;
    filterModel.pageSize=this.pageSize;
    filterModel.type ="Request";

    this.httpService.post(APIURLS.BR_ITEMCODE_EXTENSION_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.ItemCodeExtensionFilter = data;
        this.totalCount = data[0].totalCount;
        this.totalPages = data[0].totalPages;
        this.ItemCodeExtensionFilter.reverse();
      }
     // this.reInitDatatable();
      this.isLoading = false;
      this.isGoLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.isGoLoading = false;
      this.ItemCodeExtensionFilter = [];
    });

  }


  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.locationList = [];
    });
  }

  storagelocationlist: StorageLocation[] = [];
  storagelocationlist1: StorageLocation[] = [];
  storagelocationlist2: StorageLocation[] = [];
  getstoragelocationList() {
    this.httpService.get(APIURLS.BR_MASTER_STORAGE_LOCATION_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.storagelocationlist = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.storagelocationlist.sort((a, b) => { return collator.compare(a.storageLocationId, b.storageLocationId) });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.storagelocationlist = [];
    });
  }

  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }

  resetForm() {
    this.ItemCodeExtensionModel = {} as ItemCodeExtension;
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.comments = "";
  }
  materialList: MaterialType[] = [];
  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter(x => x.isActive);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.materialList = [];
    });
  }
  materialgroupList: any[] = []
  getMaterialGroupList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //this.materialgroupList = data;
        this.materialgroupList = data.filter(x => x.stxt != null);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.materialgroupList.sort((a, b) => { return collator.compare(a.materialGroupId, b.materialGroupId) });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.materialgroupList = [];
    });
  }
  uomMasterList: any[] = []
  getUOMMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.uomMasterList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.uomMasterList.sort((a, b) => { return collator.compare(a.uom, b.uom) });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.uomMasterList = [];
    });
  }
  GetMaterialDetails(code) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_REQUEST_GETBY_PARAM_API, code).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //  this.ItemCodeRequestModel=data;
        this.ItemCodeRequestModelList = data;
        Object.assign(this.ItemCodeRequestModel, data);
        let value = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code)
        Object.assign(this.ItemCodeRequestModel, value);
        if (this.ItemCodeRequestModel.sapCodeExists == '1') {
          this.ItemCodeRequestModel.sapCodeExists = 'No';
        }
        else {
          this.ItemCodeRequestModel.sapCodeExists = 'Yes';
        }
        this.ItemCodeExtensionModel.plant1 = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code).locationId;
       // this.ItemCodeExtensionModel.hsnCode = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code).hsnCode;
        let strloc = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code);
        let type = this.materialList.find(x => x.id == +strloc.materialTypeId)
        this.storagelocationlist1 = this.storagelocationlist.filter(x => x.storageLocationId == strloc.storageLocationId &&  x.matType == type.type);
        //let type = this.materialList.find(x => x.id == +strloc.materialTypeId)
        this.storagelocationlist2 = this.storagelocationlist.filter(x => x.matType == type.type);
        let temp = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code);
        this.locationList1 = this.locationList.filter(x => x.id == temp.locationId);
        this.materialtype = this.materialList.find(x => x.id == +temp.materialTypeId).type;
        this.ItemCodeExtensionModel.materialTypeId = temp.materialTypeId;
        //this.ItemCodeExtensionModel.hsnCode=this.ItemCodeRequestModel.storageLocationId;
        //  this.ItemCodeExtensionModel.storageLocationId1=this.ItemCodeRequestModel.storageLocationId;
      }
      else {
        swal({
          title: "Message",
          text: "Entered Code Not Exists.Please enter another.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ItemCodeRequestModelList = [];
    });

  }

  ItemCodeRequestModelList1:any[]=[];
  GetItemCodeData(code) {
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_DATA, code).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //  this.ItemCodeRequestModel=data;
        this.ItemCodeRequestModelList1 = data;

          Object.assign(this.ItemCodeRequestModel, data);
        let value = this.ItemCodeRequestModelList1.find(x => x.sapCodeNo == code)
        Object.assign(this.ItemCodeRequestModel, value);
        
        if (this.ItemCodeRequestModelList1[0].sapCodeExists == '1') {
          this.ItemCodeRequestModel.sapCodeExists = 'No';
        }
        else {
          this.ItemCodeRequestModel.sapCodeExists = 'Yes';
        }
        this.ItemCodeRequestModel.materialGroupId=this.ItemCodeRequestModelList1[0].materialGroup;
        this.ItemCodeExtensionModel.materialTypeId=this.materialList.find(x => x.type == this.ItemCodeRequestModelList1[0].materialType).id.toString();
        this.ItemCodeRequestModel.unitOfMeasId=this.ItemCodeRequestModelList1[0].unitOfMeasId;
        this.ItemCodeRequestModel.storageLocationId=this.ItemCodeRequestModelList1[0].storageLoc;
       // this.ItemCodeExtensionModel.plant1 = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code).locationId;
       // this.ItemCodeExtensionModel.hsnCode = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code).hsnCode;
        let strloc = this.ItemCodeRequestModelList1.find(x => x.sapCodeNo == code);
        //let type = this.materialList.find(x => x.id == +strloc.materialTypeId)
        this.storagelocationlist1 = this.storagelocationlist.filter(x => x.storageLocationId == strloc.storageLoc &&  x.matType == this.ItemCodeRequestModelList1[0].materialType);
        //let type = this.materialList.find(x => x.id == +strloc.materialTypeId)
        this.storagelocationlist2 = this.storagelocationlist.filter(x => x.matType == this.ItemCodeRequestModelList1[0].materialType);
        let temp = this.ItemCodeRequestModelList1.find(x => x.sapCodeNo == code);
        //this.locationList1 = this.locationList.filter(x => x.id == temp.locationId);
        this.materialtype = this.materialList.find(x => x.type == this.ItemCodeRequestModelList1[0].materialType).type;
        //this.ItemCodeExtensionModel.materialTypeId = temp.materialTypeId;
        //this.ItemCodeExtensionModel.hsnCode=this.ItemCodeRequestModel.storageLocationId;
        //  this.ItemCodeExtensionModel.storageLocationId1=this.ItemCodeRequestModel.storageLocationId;
      }
      else {
        swal({
          title: "Message",
          text: "Entered Code Not Exists.Please enter another.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ItemCodeRequestModelList = [];
    });

  }


  transactionslist: Transactions[] = [];
  gettransactions(requestNo) {

    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter(x => x.processType == 'Item Code Extension' && x.approvalPriority != null);
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  Approverslist: WorkFlowApprovers[] = [];
  Aprlpriority: number;
  view: boolean = false;
  getApproversList(value) {
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.ItemCodeExtensionModel = Object.assign({}, value);
    console.log(this.ItemCodeExtensionModel);

    var loc = this.locationList.find(x => x.id == this.ItemCodeExtensionModel.extendedToPlant1);
    var mat = this.materialList.find(x => x.id == +this.ItemCodeExtensionModel.materialTypeId);
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);
    if (this.isEdit) {
      var keyvalue = loc.code + '~' + mat.type + '~' + this.ItemCodeExtensionModel.extendedStorageLocation1  + ',' + 2;
    }
    else {
      var keyvalue = loc.code + '~' +mat.type + '~' + this.ItemCodeExtensionModel.extendedStorageLocation1 + ',' + 2;
    }

    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        this.Approverslist = this.Approverslist.filter(x => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;

        let Appr1 = this.Approverslist.find(x => x.priority == 1 && x.approverId == empid || x.parllelApprover1 == empid || x.parllelApprover2 == empid || x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find(x => x.priority == 2 && x.approverId == empid || x.parllelApprover1 == empid || x.parllelApprover2 == empid || x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }

        let Appr3 = this.Approverslist.find(x => x.priority == this.ItemCodeExtensionModel.pendingPriority && (x.approverId == empid || x.parllelApprover1 == empid || x.parllelApprover2 == empid || 
          x.parllelApprover3 == empid || x.parllelApprover4 == empid));

        if (Appr3 != null || Appr3 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Review = true;
          this.Aprlpriority = Appr3.priority;
          this.ItemCodeRequestModel.sapCreatedBy = empid + '-' + empName;
          // this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();
          if (Appr3.role == 'Creator') {
            this.Creator = true;
          }
          else if (Appr3.role == 'Closure') {
            this.Creator = true;
            this.Closure = true
          }
          else {
            this.Closure = false;
          }
        }
        this.transactionslist.forEach((ad) => {
          let temp = this.Approverslist.find(x => x.priority == ad.approvalPriority && 
            (ad.doneBy == x.approverId || ad.doneBy== x.parllelApprover1 || ad.doneBy == x.parllelApprover2));
          if (temp != undefined) {
            if (ad.transactionType == 1) {
              if (temp.role == 'Creator') {
                ad.status = 'Completed'
              }
              else if (temp.role == 'Closure') {
                ad.status = 'Closed'
              }
              else if (temp.role == 'Approver') {
                ad.status = 'Approved'
              }
              else {
                ad.status = this.approverstatuslist.find(x => x.id == ad.approvalPriority).name;
              }
            }
            else if (ad.transactionType == 0) {
              ad.status = "Submitted";
            }
            else if (ad.transactionType == 3 || ad.transactionType == 4) {
              ad.status = ad.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
            }
            else {
              ad.status = ad.transactionType == 2 ? "Rejected" : "";
            }
           // ad.approverName = temp.approverName;
          //  ad.department = temp.department;
            ad.role = temp.role;
          }


        });
        this.Approverslist.forEach((ad) => {
          let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority && (x.doneBy == ad.approverId || x.doneBy== ad.parllelApprover1 || x.doneBy == ad.parllelApprover2));
          if (temp1 == undefined) {
            let trans = {} as Transactions;
            trans.doneBy = ad.approverId;
            trans.approvalPriority = ad.priority;
            trans.approverName = ad.approverName;
            trans.department = ad.department;
            trans.role = ad.role;
            this.transactionslist.push(trans);
          }

        });
        this.Approverslist = this.Approverslist.sort((a, b) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a, b) => {
          if (a.doneOn > b.doneOn) return 1;
          if (a.doneOn < b.doneOn) return -1;
          return 0;
        });

      }
      else {
        this.Approverslist = [];
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  empId: string;
  onClickNewRequest(isedit: boolean, ItemCodeExtension: ItemCodeExtension, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.resetForm();
    this.Approverslist = [];
    this.transactionslist = [];
    this.view = false;
    this.attachments = [];
    this.fileslist = [];
    this.isLoadingPop = false;
    this.ItemCodeRequestModelList=[];
    this.ItemCodeRequestModelList1=[];
    this.gettransactions(ItemCodeExtension.requestNo);

    if (ItemCodeExtension.attachments != null || ItemCodeExtension.attachments != undefined) {
      this.attachments = ItemCodeExtension.attachments.split(',');
    }

    if (isedit) {
      this.getApproversList(ItemCodeExtension);

      this.ItemCodeExtensionModel = Object.assign({}, ItemCodeExtension);
      this.empId = this.ItemCodeRequestModel.createdBy;

      this. GetItemCodeData(ItemCodeExtension.materialCode1);
    }
    else {
      this.ItemCodeExtensionModel = {} as ItemCodeExtension;
      this.empId = this.ItemCodeRequestModel.createdBy;

      if(ItemCodeExtension.requestNo != null && ItemCodeExtension.requestNo !="" && ItemCodeExtension.requestNo !=undefined)
      {
        this.getApproversList(ItemCodeExtension);
        this.GetItemCodeData(ItemCodeExtension.materialCode1);
      }
    }
    if (isprint) {
      jQuery("#printModal").modal('show');
    }
    else {
      jQuery('#myModal').modal('show');
      if (value == "View") {
        this.view = true;
      }
    }
  }

  isValid: boolean = false;
  validatedForm: boolean = true;

  onSaveEntry(status) {
    this.errMsg = "";
    let connection: any;
    if (this.Approverslist.length == 0) {
      swal({
        title: "Message",
        text: "Approvers are not defined for this type",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
    }
    else
    {
      if (!this.isEdit) {
        let temp = this.ItemCodeRequestModelList1.find(x => x.sapCodeNo == this.ItemCodeExtensionModel.materialCode1);
        this.ItemCodeExtensionModel.materialShortName = temp.materialShortName;
       // this.ItemCodeExtensionModel.materialTypeId = temp.materialTypeId;
        this.ItemCodeExtensionModel.createdBy = this.currentUser.employeeId;
      //  this.ItemCodeExtensionModel.requestDate = new Date().toLocaleString();
       // this.ItemCodeExtensionModel.createdDate = new Date().toLocaleString();
        if (this.files != null || this.files != undefined) {
          if (this.fileslist != null || this.fileslist != undefined) {
            // let file:any='';           
            let file: any = this.fileslist[0];
            for (let i = 1; i < this.fileslist.length; i++) {
              file = this.fileslist[i] + ',' + file;
            }
            this.ItemCodeExtensionModel.attachments = file;
          }
        }
        this.ItemCodeExtensionModel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
        this.ItemCodeExtensionModel.approveType = status == "Submit" ? "Submitted" : "Created";
        this.comments=this.ItemCodeExtensionModel.reason;
        connection = this.httpService.post(APIURLS.BR_ITEMCODE_EXTENSION_POST_API, this.ItemCodeExtensionModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = status == 'Save' ? 'Request '+''+data.requestNo+''+ ' saved successfully!' : 'Request ' +''+data.requestNo+''+' Submitted Successfully!';
          jQuery("#saveModal").modal('show');
          if (status == 'Submit') {
            this.Inserttransactions(data, 0);
            this.sendPendingMail('EPending',data);
          }
          this.id = data.requestNo; 
          this.uploadfile();
          this.getAllEntries();
          this.resetForm();
        }
      }).catch(error => {
        console.log(error);
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request: ' + error;
      });
    }
  }

  onSubmitEntry(ItemCodeExtension: ItemCodeExtension) {
    this.ItemCodeExtensionModel = {} as ItemCodeExtension;
    this.ItemCodeExtensionModel = Object.assign({}, ItemCodeExtension);
    this.errMsg = "";
    this.ItemCodeExtensionModel.modifiedBy = this.currentUser.employeeId;

    console.log(this.fileslist);
    console.log(this.attachments);

    if (this.files != null || this.files != undefined) {
      if (this.attachments != null || this.attachments != undefined) {
        let file: any = this.attachments[0];

        this.attachments.forEach((element, index) => {
          if (index != 0) {
            file = element + "," + file;
          }
        });

        this.fileslist.forEach(element => {
          file = element + "," + file;
        });

        this.ItemCodeExtensionModel.attachments = file;
      }
    }

    console.log(this.ItemCodeExtensionModel.attachments);

    this.ItemCodeExtensionModel.pendingApprover=this.Approverslist.find(x=>x.priority == 1).approverId;
    this.ItemCodeExtensionModel.approveType = "Submitted";
    this.comments = this.ItemCodeExtensionModel.reason;

    this.httpService.put(APIURLS.BR_ITEMCODE_EXTENSION_POST_API, this.ItemCodeExtensionModel.id, this.ItemCodeExtensionModel).then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request '+''+this.ItemCodeExtensionModel.requestNo +''+ ' Submitted Successfully!';
        jQuery("#saveModal").modal('show');
        this.id = this.ItemCodeExtensionModel.requestNo; 
        this.uploadfile();
        this.getAllEntries();
        this.Inserttransactions(this.ItemCodeExtensionModel, 0);
        this.sendPendingMail('EPending',this.ItemCodeExtensionModel);
        this.resetForm();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request ' + this.ItemCodeExtensionModel.requestNo + ": " + error;
    });
  }

  Role:any;
  onreview(status) {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;
    if (status == "Rejected") {
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.ItemCodeExtensionModel.pendingApprover = '';
    //  this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.Role=user.role; 
      this.ItemCodeExtensionModel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }


    this.ItemCodeExtensionModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeExtensionModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeExtensionModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeExtensionModel.approveType = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_EXTENSION_POST_API, this.ItemCodeExtensionModel.id, this.ItemCodeExtensionModel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');

        //var role=this.Approverslist.find(x=>x.role=='Approver')
        if(this.Role =="Approver")
        {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeExtensionModel.requestNo + '' + status + " Successfully!" : "Request " + this.ItemCodeExtensionModel.requestNo  + " Approved Successfully!";
        }
        else
        {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeExtensionModel.requestNo + '' + status + " Successfully!" : "Request " + this.ItemCodeExtensionModel.requestNo  + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
          this.sendPendingMail("EPending", this.ItemCodeExtensionModel)
        }
        this.sendMail(status, this.ItemCodeExtensionModel)
        this.Inserttransactions(this.ItemCodeExtensionModel, id)
        this.getAllEntries();
        this.resetForm();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request " + this.ItemCodeExtensionModel.requestNo + ": " + error : "Error Reviewing Request " + this.ItemCodeExtensionModel.requestNo + ": " + error;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == "ReverttoInitiator") {
      let usid = this.currentUser.employeeId;
      let user = this.Approverslist.find(x => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
        || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

      this.ItemCodeExtensionModel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
      this.ItemCodeExtensionModel.approveType = "Created";
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let uid = this.ItemCodeExtensionModel.modifiedBy;
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

      this.ItemCodeExtensionModel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority + 1).priority;
      this.ItemCodeExtensionModel.approveType = "InProcess";
    }

    this.ItemCodeExtensionModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeExtensionModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeExtensionModel.modifiedDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_ITEMCODE_EXTENSION_POST_API, this.ItemCodeExtensionModel.id, this.ItemCodeExtensionModel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request "+''+this.ItemCodeExtensionModel.requestNo+''+" Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        this.sendMail(status, this.ItemCodeExtensionModel)
        if (this.ItemCodeRequestModel.approveType != "Reverted to initiator") {
          this.sendPendingMail("EPending", this.ItemCodeExtensionModel)
        }
        this.Inserttransactions(this.ItemCodeExtensionModel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request " + this.ItemCodeExtensionModel.requestNo + ": " + error;
    });
  }

  onCreate() {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;

    let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
      || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

    let temp = this.Approverslist.find(x => x.priority == user.priority + 1);
    if (temp != null || temp != undefined) {
      this.ItemCodeExtensionModel.pendingApprover = temp.approverId;
      this.ItemCodeExtensionModel.approveType = 'InProcess';
    }
    else {
      this.ItemCodeExtensionModel.pendingApprover = 'No';
      this.ItemCodeExtensionModel.approveType = 'Completed';
    }
    this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    this.ItemCodeExtensionModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeExtensionModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeExtensionModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeExtensionModel.codeExtendedBy = this.currentUser.employeeId;
    // this.ItemCodeExtensionModel.codeExtendedOn = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_ITEMCODE_EXTENSION_POST_API, this.ItemCodeExtensionModel.id, this.ItemCodeExtensionModel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Item Code "+''+this.ItemCodeExtensionModel.materialCode1+''+" Extended Successfully!";
        jQuery("#saveModal").modal('show');
        this.sendMail('Created', this.ItemCodeExtensionModel);
        if (this.ItemCodeExtensionModel.pendingApprover != 'No') {
          this.sendPendingMail("EPending", this.ItemCodeExtensionModel)
        }
        this.Inserttransactions(this.ItemCodeExtensionModel, 1)
        this.getAllEntries();
        this.resetForm();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Creating Item Code: " + error;
    });

  }
  priority: number;
  oncloserequest(status) {
    this.errMsg = "";
    let connection: any;

    if (status == 'Completed') {
      let uid = this.currentUser.employeeId;
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

      this.ItemCodeExtensionModel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    this.ItemCodeExtensionModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeExtensionModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeExtensionModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeExtensionModel.approveType = 'Completed';
    this.ItemCodeExtensionModel.pendingApprover = 'No';
    this.priority = this.Approverslist.find(x=>x.role=='Closure').priority;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_EXTENSION_POST_API, this.ItemCodeExtensionModel.id, this.ItemCodeExtensionModel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request "+''+this.ItemCodeExtensionModel.requestNo+''+" Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.Inserttransactions(this.ItemCodeExtensionModel, 1)
        this.sendMail('Created', this.ItemCodeExtensionModel)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request: " + error;
    });
  }
  transactions = {} as Transactions;
  Inserttransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    this.transactions.doneBy = this.currentUser.employeeId;
   // this.transactions.doneOn = new Date().toLocaleString();
    this.transactions.requestNo = data.requestNo;
    this.transactions.comments = this.comments;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.processType = "Item Code Extension";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

  }

  sendMail(type, ItemCodeExtension: ItemCodeExtension) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODE_EXTENSION_EMAIL_API, 'E' + type, ItemCodeExtension);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });

  }

  sendPendingMail(type, ItemCodeExtension: ItemCodeExtension) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODE_EXTENSION_PENDING_EMAIL_API, type, ItemCodeExtension);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });

  }


  attachments: any[] = [];
  downloadFile(id, value) {

    // console.log(filename);
    if (value.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, id, value).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        if (data != undefined) {
          var FileSaver = require('file-saver');
          const imageFile = new File([data], value, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);


        }
      }).catch(error => {
        console.log(error);
        this.isLoading = false;
      });

    } else {
      swal({
        title: "Message",
        text: "No File on server",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
  }
  deletefile(item, name) {

    if (this.attachments.length > 1) {
      const index = this.attachments.indexOf(name);
      this.attachments.splice(index, 1);
    }
    
    let attach: any = this.attachments[0];
    
    for (let i = 1; i < this.attachments.length; i++) {
      attach = this.attachments[i] + ',' + attach;
    }
    
    item.attachements = attach;
    this.ItemCodeRequestModel.attachements = attach;
    // let connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, item.id, item);
    // connection.then((data: any) => {
    //   this.isLoadingPop = false;
    //   if (data == 200 || data.id > 0) {
    //     swal({
    //       title: "Message",
    //       text: "file deleted successfully",
    //       icon: "success",
    //       dangerMode: false,
    //       buttons: [false, true]
    //     })
    //   }
    // }).catch(error => {
    //   console.log(error);
    //   this.isLoadingPop = false;
    //   this.errMsgPop = 'Error deleting file: ' + error;
    // });
  }
  removefile(name) {
    const index = this.fileslist.indexOf(name);
    this.fileslist.splice(index, 1);
  }

  fileslist: any[] = [];
  fileslist1: File[] = [];
  validateAttachment() {
    this.fileslist = [];
    if (this.attachments.length > 0) {
      for (let i = 0; i < this.attachments.length; i++) {
        for (let j = 0; j < this.files.length; j++) {
          if (this.files[j].name == this.attachments[i]) {
            swal({
              title: "Message",
              text: "file with name " + (this.files[j].name) + " already Exists",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            })
            this.files.splice(j, 1);
          }
        }
      }
    }

    // this.formData =  new  FormData();
    for (var i = 0; i < this.files.length; i++) {
      //this.formData.append('files',this.files[i]);
      this.fileslist.push(this.files[i].name);
      this.fileslist1.push(this.files[i]);
    }

    this.errMsg1 = "File Uploaded Successfully";
    this.ReadAsBase64(this.File).then(result => {
      this.fileToUpload = result;
    }).catch(err => this.errMsg1 = err);
  }
  reset() {
    console.log(this.myInputVariable.nativeElement.files);

    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }

    console.log(this.myInputVariable.nativeElement.files);
  }
  fileToUpload: File | null = null;
  File: File | null = null;
  name: any;
  files: File[] = []
  handleFileInput(files: FileList) {
    this.errMsg1 = "";
    this.File = files[0];
    //this.files=[];
    for (var i = 0; i < files.length; i++) {
      let pattern = /[(@!#\$%\^\&*\)\(+=,]/;
      let text = files[i].name;
      if ((pattern.test(text))) {
        alert("Please remove all the special characters in the file name");
        this.reset();
      }
      // else if (files[i].size > 5e+6) {
      //   alert("File size cannot exceed 5mb..");
      //   this.reset();
      // }
      else {
        this.files.push(files[i]);
      }
    }
    this.validateAttachment();
    this.reset();
  }

  ReadAsBase64(file): Promise<any> {
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        const result = reader.result as string;
        if (!result) reject('Cannot read variable');
        if (result.length * 2 > 2 ** 21) reject('File exceeds the maximum size'); // Note: 2*2**20 = 2**21 
        resolve(reader.result);
      });

      reader.addEventListener('error', event => {
        reject(event);
      });

      reader.readAsDataURL(file);
    });

    return fileValue;
  }

  id: string;
  uploadfile() {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.fileslist1.length; i++) {
      this.formData.append('files', this.fileslist1[i]);
    }
    let connection: any;
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error uploading file: ' + error;
    });

  }

  pageSize: any = 10;
  pageNo: any;
  totalCount: number;
  totalPages: number
  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getAllEntries();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.getAllEntries();
  }

  getlist() {
    this.pageNo = 1
    this.getAllEntries();
  }
}
