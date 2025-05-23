import { AuthData } from '../../auth/auth.model'
import { Component, OnInit, ViewChild } from '@angular/core';
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
//import { debug } from 'util';
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
import { ExcelService } from '../../shared/excel-service';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ServiceMaster } from '../ServiceMasterCreation/ServiceMasterCreation.model';
import { VendorMaster } from '../VendorMaster/VendorMaster.model';
import { CustomerMaster } from '../CustomerMaster/CustomerMaster.model';
import { saveAs } from 'file-saver';
import { ItemCodeCreationComponent } from '../ItemCodeCreation/ItemCodeCreation.component';
import { Serialization } from '../ItemCodeCreation/Serialization.model';
declare var require: any;
import { Chart } from 'chart.js';
import { ChartDataLabels } from 'chartjs-plugin-datalabels';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';

@Component({
  selector: 'app-DetailedReport',
  templateUrl: './DetailedReport.component.html',
  styleUrls: ['./DetailedReport.component.css',]
})
export class DetailedReportComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;

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

  path: string = '';
  locationList: any[] = [[]];

  exportList: any[];
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  filtercreator: string = null;
  filtermaterialtype: string = null;
  PWS:boolean=false;
  CCS:boolean=false;


  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  SAP_from_date: any = null;
  SAP_to_date: any = null;
  filtertype: string = null;
  reportdata: any[] = [];
  comments: any;
  tdseligible: any;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string;
  emailid: any;

  servicegrouplist: any[] = [];
  PaymentTermList: any[] = [];
  ReconciliationAccList: any[] = [];
  TdsSectionList: any[] = [];
  VendorTypeList: any[] = [];
  AccClerckList: any[] = [];
  countrylist: any[] = [];
  stateList: any[] = [];
  stateList1: any[] = [];
  currencyList: any[] = [];
  purchasegrouplist: any[] = [];
  uomMasterList: any[] = [];
  ValuationClasslist: any[] = [];
  AccGroupList: any[] = [];
  pricegrouplist: any[] = [];
  pricelist: any[] = [];
  CustomerGroupList: any[] = [];
  taxclassList: any[] = [];
  serviceCategorylist: any[] = [];
  // ItemCodeExtensionModeldata = {} as ItemCodeExtension;

  constructor(private appService: AppComponent, private httpService: HttpService, private excelService: ExcelService, 
    private router: Router, private http: HttpClient,private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs;}

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
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
      this.getMastersdata();
    this.getUOMMasterList();
    this.getstoragelocationList();
    this.getMaterialMasterList();
    this.getMaterialGroupList();
    this.getLocationMaster();
    this.getbase64image();
    //this.reInitDatatable();
  }

  approverstatuslist: any[] = [
    { id: 1, name: 'Reviewed' },
    { id: 2, name: 'Reviewed' },
    { id: 3, name: 'Reviewed' },
    { id: 4, name: 'Approved' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Created' },
    { id: 7, name: 'Closed' }
  ];

  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'InProcess' },
    { id: 4, name: 'Rejected' },
    { id: 5, name: 'Completed' }
  ];

  Table1:boolean=false;
  Table2:boolean=false;

  change(id)
  {
    this.reportdata=[];
    this.reInitDatatable();
  
  }

  materialList: any[] = [];
  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter(x => x.isActive);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }
 
  dmfgradevalue(value) {
    if (value == '0') {
      this.DmfGradelist1 = this.DmfGradelist;
      this.ItemCodeRequestModel.dmfGradeId = 0;

    }
    else {
      this.ItemCodeRequestModel.dmfGradeId = undefined;
      this.DmfGradelist1 = this.DmfGradelist.filter(x => x.dmfGradeId != '0');
    }
  }
 
  typeofmaterial: any[] = [
    { id: 'Printed', name: 'Printed Material' },
    { id: 'Plain', name: 'Plain Material' }
  ];
  serializer: boolean;
  serializerid: boolean;
  Aprlpriority: number;

  dynamicArray: any = [];
  newDynamic: any = {};
  rowcount: number = 0;
  addRows() {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = {
      id: this.rowcount, reqNo: null, aun: null, packLevel: null, quantity: null,
      gtin: null, nationalCode: null, nCodeT: null, stored: "0"
    };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  
  changevalue(value) {
    if (value == 'Plain Material') {
      this.ItemCodeRequestModel.isArtworkRevision = undefined;
      this.ItemCodeRequestModel.artworkNo = null;
    }
  }
  changespecifValue(value) {
    if (value != 'Y' || value != '1') {
      this.ItemCodeRequestModel.specificationNo = null;
    }
  }
  changetextvalue(value) {
    if (value == 'Y' || value == '1') {
      this.ItemCodeRequestModel.requiredDmf = null;
    }
    else {
      this.ItemCodeRequestModel.availableDmf = null;
    }
  }
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
  masterslist: any = {};
  getMastersList() {
    this.httpService.get(APIURLS.BR_GET_MASTERS_LIST_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.masterslist = data;
        this.masterslist.forEach(element => {
          this.servicegrouplist = element.servicegrouplist;
          this.PaymentTermList = element.servicegrouplist;
          this.ReconciliationAccList = element.reconciliationAccList;
          this.TdsSectionList = element.tdsSectionList;
          this.VendorTypeList = element.vendorTypeList;
          this.AccClerckList = element.accClerckList;
          this.countrylist = element.countrylist;
          this.stateList = element.stateList;
          this.currencyList = element.currencyList;
          this.purchasegrouplist = element.purchasegrouplist;
          this.ValuationClasslist = element.valuationClasslist;
          this.AccGroupList = element.accGroupList;
          this.pricegrouplist = element.pricegrouplist;
          this.pricelist = element.pricelist;
          this.CustomerGroupList = element.CustomerGroupList;
          this.taxclassList = element.taxclassList;
          this.serviceCategorylist = element.serviceCategorylist;
          this.locationList = element.locationList;
        });

      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.masterslist = {};
    });
  }
  getUOMMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.uomMasterList = data.filter(x => x.isActive);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.uomMasterList = [];
    });
  }
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.SAP_from_date = null;
    this.SAP_to_date = null;
    this.filterlocation = null;
    this.filtermaterialtype=null;
    this.filterstatus = null;
    this.filterrequest = null;
    this.filtercreator = null;
    this.filtertype = null;
    this.Table1=false;
    this.Table2=false;
  }
  getbrand(id)
  {
    let temp=this.Brandlist.find(x=>x.brandCode==id);
    return temp? temp.brandDesc:'';
  }
  getCountry(id)
  {
    let temp=this.countrylist.find(x=>x.land1==id);
    return temp? temp.landx:'';
  }
  getstoragelocationList() {
    this.httpService.get(APIURLS.BR_MASTER_STORAGE_LOCATION_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.storagelocationlist = data;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.storagelocationlist = [];
    });
  }
 // materialgroupList: any[] = []
  getMaterialGroupList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //this.materialgroupList = data;
        this.materialgroupList = data.filter(x => x.stxt != null);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialgroupList = [];
    });
  }
  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
  }

  getAllEntries() {
    this.isLoading = true;
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

    if (this.SAP_from_date == '' || this.SAP_from_date == null) {
      this.SAP_from_date = null;
    }
    else {
      let fd = new Date(this.SAP_from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        ("00" + fd.getDate()).slice(-2);
      this.SAP_from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
      filterModel.sapFromDate = this.getFormatedDateTime(this.SAP_from_date);
    }

    if (this.SAP_to_date == '' || this.SAP_to_date == null) {
      this.SAP_to_date = null;
    }
    else {
      let ed = new Date(this.SAP_to_date);
      formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
        ("00" + ed.getDate()).slice(-2);
      this.SAP_to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);
      filterModel.sapToDate = this.getFormatedDateTime(this.SAP_to_date);
    }

    
    filterModel.materialType = this.filtermaterialtype;
    filterModel.location = this.filterlocation == null ? null : this.locationList.find(x => x.code == this.filterlocation).id;
    filterModel.requestNo = this.filterrequest;
    this.filterstatus = this.filterstatus == 'InProcess' ? 'InProcess,Reverted' : this.filterstatus;
    //this.filterstatus=this.filterstatus=='Created'?'Created,':this.filterstatus;
    this.filterstatus = this.filterstatus == 'Submitted' ? 'Submitted,ReSubmitted,Reverted to initiator' : this.filterstatus;
    filterModel.status = this.filtercreator == null ? this.filterstatus : 'Completed';
    filterModel.creator = this.filtercreator;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_ITEMCODE_REQUEST_FILTER_API, filterModel).then((data: any) => {
      if (data) {

        this.reportdata = data;
      
        this.reportdata.reverse();

      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.reportdata = [];
    });

  }
 
  cleartype() {
   
      this.masterslist = [];
      this.getMastersdata();
   
   
  }

  clearMasterdata() {
    this.storageconditionlist = [];
    this.tempconditionlist = [];
    this.PackSizelist = [];
    this.Divisionlist = [];
    this.Brandlist = [];
    this.Strengthlist = [];
    this.departmentList = [];
    this.DmfGradelist = [];
    this.DmfGradelist1 = [];
    this.processlist = [];
   // this.materialgroupList = [];
    this.materialList1 = [];
    //this.storagelocationlist = [];
   // this.storagelocationlist1 = [];
    //this.ValuationClasslist1= []; 
    this.pharmagradelist = [];
    this.TherapeuticSegmentlist = [];
    this.GenericNamelist = [];
    this.PackageMaterialGroup = [];
  }
  
  
  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
  exportAsXLSX(): void {
    this.exportList = [];
    let status: any;
    let index = 0;
    var name = this.filtertype + ' ' + 'Report';
    this.reportdata.forEach(item => {
      index = index + 1;
      if (this.filtertype == 'Service Master') {
        status = item.appSatus;
      }
      else if (this.filtertype == 'Item Code Request') {
        status = item.approveType;
      }
      else {
        status = item.approveStatus;
      }
      let exportItem = {
        "SNo": index,
        "Request No": item.requestNo,
        "Location": this.filtertype == 'Vendor Master' || this.filtertype == 'Item Code Request' ? this.location(item.locationId) : item.plantCode,
        "Requested By": item.requestedBy,
        "Requested On": this.setDateFormate(item.requestDate),
        "Material Short Name": item.materialShortName,
        "Name": item.name,
        "City": item.city,
        "Service Description": item.serviceDescription,
        "Service Category": item.serviceCatagory,
        "SAP Code.No": item.sapCodeNo,
        "Code Creation Date": item.sapCreationDate == null ? '' : this.setDateFormate(item.sapCreationDate),
        "Approve Status": status,
        "Last Approver": item.lastApprover,
        "Pending Approver": item.pendingApprover

      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, name);
  }
  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }
  selCoated(id) {
    if (id == '84') {
      this.ItemCodeRequestModel.isCoated = 'NotApplicable';
    }
  }
  transactionslist: Transactions[] = [];
  gettransactions(value) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, value.requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist.reverse();
        this.getApproversList(value);
      }
      else {
        this.getApproversList(value);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  gettransactions1(value) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, value.requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter(x => x.approvalPriority != null && x.processType == 'Item Code Request');
        this.getApproversList1(value);
      }
      else {
        this.getApproversList1(value);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  getApproversList1(value) {

    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.Approverslist = [];
    this.ItemCodeRequestModel = Object.assign({}, value);
    var loc = this.locationList.find(x => x.id == this.ItemCodeRequestModel.locationId);
    var mat = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId);

    if (mat.type == 'FG') {
      var keyvalue = loc.code + '~' + mat.type + '~' + this.ItemCodeRequestModel.storageLocationId + '~' + this.ItemCodeRequestModel.domesticOrExports + '~' + this.ItemCodeRequestModel.market + ',' + 1;
    }
    else {
      var keyvalue = loc.code + '~' + mat.type + '~' + this.ItemCodeRequestModel.storageLocationId + ',' + 1;
    }
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);   
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;
        if (mat.type == 'FG') {
          let temp = this.Approverslist.find(x => x.role == 'Creator');
          let temp1 = this.Approverslist.find(x => x.priority == temp.priority - 1);
          if (temp1.approverId == empid || temp1.parllelApprover1 == empid || temp1.parllelApprover2 == empid ||
            temp1.parllelApprover3 == empid || temp1.parllelApprover4 == empid) {
            this.serializer = true;
            this.serializerid = true;
            this.ItemCodeRequestModel.serializedFromDate = new Date().toLocaleString();
          }
        }
        let Appr1 = this.Approverslist.find(x => x.priority == 1 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find(x => x.priority == 2 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }
        let Appr3 = this.Approverslist.find(x => x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr3 != null || Appr3 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Aprlpriority = Appr3.priority;
          this.Review = true;
          if (Appr3.role == 'Creator') {
            this.Creator = true;
            // this.ItemCodeRequestModel.sapCreatedBy = empid + '-'+empName;
            // this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();
            this.serializer = true;
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
          let temp = this.Approverslist.find(x => x.priority == ad.approvalPriority);
          if (temp != undefined) {
            if (ad.transactionType == 1) {
              if (temp.role == 'Creator') {
                ad.status = 'Completed'
              }
              else {
                ad.status = this.approverstatuslist.find(x => x.id == ad.approvalPriority).name;
              }
            }
            else if (ad.transactionType == 3 || ad.transactionType == 4) {
              ad.status = ad.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
            }
            else {
              ad.status = ad.transactionType == 2 ? "Rejected" : "";
            }
            ad.approverName = temp.approverName;
            ad.department = temp.department;
            ad.role = temp.role;
          }


        });
        this.Approverslist.forEach((ad) => {
          let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority);
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
          if (a.approvalPriority > b.approvalPriority) return 1;
          if (a.approvalPriority < b.approvalPriority) return -1;
          return 0;
        });

      }
      else {
        this.Approverslist = [];
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  servicemastermodel = {} as ServiceMaster
  vendormastermodel = {} as VendorMaster
  CustomerMastermodel = {} as CustomerMaster
  ItemCodeRequestModel = {} as ItemCodeRequest
  Approverslist: WorkFlowApprovers[] = [];
  weightUomlist: any[] = [];
  getApproversList(value) {
    if (this.filtertype == 'Service Master') {
      var keyvalue = value.plantCode + ',' + 5;
    }
    else if (this.filtertype == 'Vendor Master') {
      var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
      var accgrp = this.AccGroupList.find(x => x.accountGroupId == value.accountGroupId);
      var group = accgrp.accountGroupName == 'Import' ? 'Import' : 'Local';
      var keyvalue = loc.code + '~' + group + ',' + 3;
    }
    else {
      var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
      var keyvalue = loc.code + '~' + value.customerType + ',' + 4;
    }
    this.Approverslist = [];
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        this.Approverslist.forEach((ad) => {
          let temp = this.transactionslist.find(x => x.approvalPriority == ad.priority);
          if (temp != undefined) {
            if (temp.transactionType == 1) {
              ad.status = this.approverstatuslist.find(x => x.id == ad.priority).name;
            }
            else if (temp.transactionType == 3 || temp.transactionType == 4) {
              ad.status = temp.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
            }
            else {
              ad.status = temp.transactionType == 2 ? "Rejected" : "";
            }
            ad.date = temp.doneOn;
            ad.comments = temp.comments;
          }

        });
        this.Approverslist = this.Approverslist.sort((a, b) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a, b) => {
          if (a.approvalPriority > b.approvalPriority) return 1;
          if (a.approvalPriority < b.approvalPriority) return -1;
          return 0;
        });

      }
      else {
        this.Approverslist = [];
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  getstatelist(id) {
    this.stateList1 = this.stateList.filter(x => x.land1 == id);
  }
  clearvalue(value) {
    if (value == 'NotApplicable') {
      this.ItemCodeRequestModel.targetWeightCoated = null;
    }
  }
  ShowForm(isedit: boolean, item) {
    this.stateList = this.stateList;
    this.isEdit = isedit;
    this.transactionslist = [];
    this.Approverslist = [];
    this.attachments = [];
   
      this.gettransactions1(item);
    
      this.onUserActions(true, item, false, 'View');
  }

  storageconditionlist: StorageCondition[] = [];
  tempconditionlist: TempCondition[] = [];
  PackSizelist: any[] = [];
  Divisionlist: any[] = [];
  Brandlist: any[] = [];
  Strengthlist: any[] = [];
  departmentList: any[] = [];
  DmfGradelist: DmfGrade[] = [];
  DmfGradelist1: DmfGrade[] = [];
  processlist: ProcessMaster[] = [];
  materialgroupList: MaterialGroup[] = [];
  materialList1: MaterialType[] = [];
  storagelocationlist: StorageLocation[] = [];
  storagelocationlist1: StorageLocation[] = [];
  ValuationClasslist1: any[] = [];
  pharmagradelist: PharmaGrade[] = [];
  TherapeuticSegmentlist: any[] = [];
  GenericNamelist: any[] = [];
  PackageMaterialGroup: any[] = [];
  masterdatalist: any[] = [];
  MaterialPricingGroupList: any[] = [];
  getMastersdata() {
    this.httpService.post(APIURLS.BR_GET_MASTERS_DATA_API, '').then((data: any) => {
      if (data) {
        this.masterdatalist = data;
        //let master:any;
        this.masterdatalist.forEach(master => {
          this.storageconditionlist = master.storageCondition;
          this.tempconditionlist = master.tempCondition;
          this.PackSizelist = master.packSize;
          this.Divisionlist = master.division;
          this.departmentList = master.departmentMaster;
          this.pharmagradelist = master.pharmaGrade;
          this.purchasegrouplist = master.purchaseGroup;
          // this.locationList=master.locationMaster;
          this.materialList = master.materialType;
          this.materialgroupList = master.materialGroup;
          this.countrylist = master.country;
          this.DmfGradelist = master.dmfGrade;
          this.processlist = master.storageCondition;
          this.GenericNamelist = master.genericName;
          this.TherapeuticSegmentlist = master.therapeuticSegment;
          this.ValuationClasslist = master.valuationClass;
          this.storagelocationlist = master.storageLocation;
          this.Brandlist = master.brand;
          this.Strengthlist = master.strength;
          this.weightUomlist = master.weightUom;
          this.MaterialPricingGroupList = master.materialPricingGroup;
          this.PackageMaterialGroup = master.packageMaterialGroup;
        });


      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.masterdatalist = [];
    });

  }


  Masterslist: any[] = [
    { id: 1, name: 'Item Code Request' },
    { id: 2, name: 'Vendor Master' },
    { id: 3, name: 'Service Master' },
    { id: 4, name: 'Customer Master' },
    { id: 5, name: 'Item Code Extension' }
  ];
  
  empId: string;
  view: boolean = false;
  attachments: any[] = [];
  onUserActions(isedit: boolean, ItemCodeRequest: ItemCodeRequest, isprint: boolean, view) {
    this.isEdit = isedit;
    // this.resetForm();
    this.errMsg1 = "";
    this.dynamicArray = [];
    this.transactionslist = [];
    this.Approverslist = [];
    this.attachments = [];
    this.view = false;
    this.comments = null;
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.gettransactions(ItemCodeRequest.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      this.getApproversList(ItemCodeRequest);
      if (ItemCodeRequest.attachements != null || ItemCodeRequest.attachements != undefined) {
        this.attachments = ItemCodeRequest.attachements.split(',');
      }
      let type = this.materialList.find(x => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.storagelocationlist1 = this.storagelocationlist.filter(x => x.matType == type.type);
      this.ValuationClasslist1 = this.ValuationClasslist.filter(x => x.matType == type.type);
      if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
        ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
      }
      var name = this.materialList.find(x => x.id == +ItemCodeRequest.materialTypeId).type;
      if (ItemCodeRequest.pharmacopGrade != null || ItemCodeRequest.pharmacopGrade != undefined) {
        ItemCodeRequest.qcSpecification = this.pharmagradelist.find(x => x.pharmaGradeDesc == ItemCodeRequest.pharmacopGrade).pharmaGradeId.toString();
      }


      if (name == 'RM') {
        ItemCodeRequest.typeOfMaterial = 'R';
        ItemCodeRequest.firstAlphaRaw = ItemCodeRequest.materialShortName.charAt(0);
        ItemCodeRequest.company = '100';
      }
      if (name == 'PM') {
        ItemCodeRequest.type = 'P';
        ItemCodeRequest.company = '100';
      }
      if (name == 'FG') {
        this.getserializationdetails(ItemCodeRequest.requestNo);
      }
      if (name == 'BULK') {
        ItemCodeRequest.excipientsCheck = ItemCodeRequest.excipientsCheck == undefined ? '' : ItemCodeRequest.excipientsCheck = ItemCodeRequest.excipientsCheck.trim();
        ItemCodeRequest.immediatePackMatCheck = ItemCodeRequest.immediatePackMatCheck == undefined ? '' : ItemCodeRequest.immediatePackMatCheck.trim();
        ItemCodeRequest.manufactMatch = ItemCodeRequest.manufactMatch == undefined ? '' : ItemCodeRequest.manufactMatch.trim();
        ItemCodeRequest.punchesOrDiesMatch = ItemCodeRequest.punchesOrDiesMatch == undefined ? '' : ItemCodeRequest.punchesOrDiesMatch.trim();
        ItemCodeRequest.testingSpecMatch = ItemCodeRequest.testingSpecMatch == undefined ? '' : ItemCodeRequest.testingSpecMatch.trim();
        ItemCodeRequest.sameMarCustCount = ItemCodeRequest.sameMarCustCount == undefined ? '' : ItemCodeRequest.sameMarCustCount.trim();
        ItemCodeRequest.productMatch = ItemCodeRequest.productMatch == undefined ? '' : ItemCodeRequest.productMatch.trim();
      }
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      this.empId = this.ItemCodeRequestModel.createdBy;

    }
    else {
      if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
        ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
      }
      //this.ItemCodeRequestModel.locationId = this.currentUser.baselocation.toString();

      ItemCodeRequest.locationId = this.currentUser.baselocation.toString();
      let type = this.materialList.find(x => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.ValuationClasslist1 = this.ValuationClasslist.filter(x => x.matType == type.type);
      this.storagelocationlist1 = this.storagelocationlist.filter(x => x.matType == type.type);
      //this.ValuationClasslist=this.ValuationClasslist.filter(x=>x.matType==type.type);
      this.getApproversList(ItemCodeRequest);
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
      if (name == 'FG') {
        this.getserializationdetails(ItemCodeRequest.requestNo);
      }
    }
    if (view == 'View') {
      this.Approver1 = true;
      this.Creator = true;
      this.serializer = true;
      this.view = true;
    }

    let locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
    if (locid.plantType == 0) {
      var modal = '#' + name + 'NGXPModal';
      jQuery(modal).modal('show');
    }
    else {
      var modal = '#' + name + 'Modal';
      jQuery(modal).modal('show');
    }

  }

  downloadFile(reqNo, name) {

    // console.log(filename);
    if (name.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, reqNo, name).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        if (data != undefined) {
          var FileSaver = require('file-saver');
          const imageFile = new File([data], name, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);


        }
      }).catch(error => {
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

  getserializationdetails(reqNo) {
    this.httpService.getByParam(APIURLS.BR_SERIALIZATION_DATA_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        data.forEach(mtrl => {
          let serializedata = {} as Serialization;
          serializedata.id = mtrl.id;
          serializedata.aun = mtrl.aun;
          serializedata.packLevel = mtrl.packLevel;
          serializedata.quantity = mtrl.quantity;
          serializedata.gtin = mtrl.gtin;
          serializedata.nationalCode = mtrl.nationalCode;
          serializedata.nCodeT = mtrl.nCodeT;
          serializedata.lastModifiedBy = this.currentUser.employeeId;
          serializedata.lastModifiedOn = new Date().toLocaleString();
          this.dynamicArray.push(serializedata);

        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }

  ItemCodeExtensionModel = {} as ItemCodeExtension;
  //ItemCodeRequestModel = {} as ItemCodeRequest;
  ItemCodeRequestModelList: ItemCodeRequest[] = [];
  materialtype: string;
  locationList1: any[] = [[]];

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
          this.ItemCodeRequestModel.sapCodeExists = 'Yes';
        }
        else {
          this.ItemCodeRequestModel.sapCodeExists = 'No';
        }
        this.ItemCodeExtensionModel.plant1 = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code).locationId;
        this.ItemCodeExtensionModel.hsnCode = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code).hsnCode;
        let strloc = this.ItemCodeRequestModelList.find(x => x.sapCodeNo == code);
        let type = this.materialList.find(x => x.id == +strloc.materialTypeId)
        //this.storagelocationlist = this.storagelocationlist.filter(x => x.storageLocationId == strloc.storageLocationId &&  x.matType == type.type);
        //let type = this.materialList.find(x => x.id == +strloc.materialTypeId)
       // this.storagelocationlist2 = this.storagelocationlist.filter(x => x.matType == type.type);
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
      this.isLoading = false;
      this.ItemCodeRequestModelList = [];
    });

  }
 // transactionslist: Transactions[] = [];
 
  //empId: string;
  resetForm() {
    this.ItemCodeExtensionModel = {} as ItemCodeExtension;
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.comments = "";
  }
  image:string;
  getbase64image()
  {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        console.log('Image in Base64: ', event.target.result);
        this.image=event.target.result;
      };

    });
  }
  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate = 
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  locationname:string;
  downloadPdf()
  {
    var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
    var printContents = document.getElementById(temp.type).innerHTML;   
    var temp1=this.locationList.find(x=>x.id==this.currentUser.baselocation);
    var OrganisationName ="MICRO LABS LIMITED"+', '+temp1.code+'-'+temp1.name;
    var ReportName ='ITEM CODE REGISTER FOR '+ temp.description
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate =this.setFormatedDateTime(now);
    var logo = this.image;
    var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title:temp.description+' Report',
        },
      
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          
          columns: [
            {
            pageMargins: [40, 80, 40, 60],
            style: 'tableExample',
            color: '#444',
            table: {
              widths: [90, 600, 90],
              headerRows: 2,
              keepWithHeaderRows: 1,
              body: [
                [{rowSpan: 2,	image: logo,
                width: 50,
                  alignment: 'center'}
                , {text: OrganisationName, 	bold: true, fontSize: 15,color: 'black',alignment: 'center',height:'*'}, 
                {rowSpan: 2,text: ['Page ', { text: currentPage.toString() }, ' of ',
                 { text: pageCount.toString() }], bold: true, fontSize: 10,color: 'black', alignment: 'center'}],
                 [''
                  , {text: ReportName, bold: true, fontSize: 14,color: 'black', alignment: 'center',height:'*'},'']
               
              ]
            }
            }
          ],
          margin: 20
        }
      },
      footer: function(){
        return {

          columns: [
           
            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy +', '+'Printed On' + ": " + jsDate+'.'  }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }


}
