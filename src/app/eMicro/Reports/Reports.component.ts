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
//import * as FileSaver from 'file-saver';
import { ServiceMaster } from '../ServiceMasterCreation/ServiceMasterCreation.model';
import { VendorMaster } from '../VendorMaster/VendorMaster.model';
import { CustomerMaster } from '../CustomerMaster/CustomerMaster.model';
//import { saveAs } from 'file-saver';
import { ItemCodeCreationComponent } from '../ItemCodeCreation/ItemCodeCreation.component';
import { Serialization } from '../ItemCodeCreation/Serialization.model';
declare var require: any;
//import { Chart } from 'chart.js';
//import { ChartDataLabels } from 'chartjs-plugin-datalabels';
import { ItemCodeModification } from '../ItemCodeModification/ItemCodeModification.model';

@Component({
  selector: 'app-Reports',
  templateUrl: './Reports.component.html',
  styleUrls: ['./Reports.component.css',]
})
export class ReportsComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;

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

  exportList!: any[];
  filterstatus: string = ' ';
  filterlocation: string = ' ';
  filterrequest: string = ' ';
  filtercreator: string = ' ';
  filtermaterialtype: string = ' ';
  PWS: boolean = false;
  CCS: boolean = false;


  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  SAP_from_date: any = null;
  SAP_to_date: any = null;
  filtertype: string = ' ';
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
  userid: string
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

  filterRequestedBy: string = ' ';

  // ItemCodeExtensionModeldata = {} as ItemCodeExtension;

  constructor(private appService: AppComponent, private httpService: HttpService, private excelService: ExcelService, private router: Router) { }

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
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    //  this.baseLocation = this.currentUser.baselocation;    
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {

    this.getUOMMasterList();
    this.getstoragelocationList();
    this.getMaterialMasterList();
    this.getMaterialGroupList();
    this.getLocationMaster();
    this.getCreatorsList();
    //this.getItemCodes();
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
  typelist: any[] = [
    { id: 1, name: 'Vendor Master' },
    { id: 2, name: 'Service Master' },
    { id: 3, name: 'Customer Master' },
    { id: 4, name: 'Item Code Request' },
    { id: 5, name: 'Item Code Extension' },
    { id: 6, name: 'Item Code Modification' }
  ]
  materialList: any[] = [];
  getMaterialMasterList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_MATERIALTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.materialList = data.filter((x:any)  => x.isActive);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  summarylist: any[] = [{ id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null }]
  getSummarydata(data) {
    this.summarylist = [];
    this.serviceCategorylist.forEach((element:any)=> {

      let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
      newSummary.type = element.serCatCode + '-' + element.serCatDesc;
      let cre = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'Created');
      newSummary.Created = cre.length;
      let sub = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'Submitted');
      let rsub = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'ReSubmitted');
      let revIn = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'Reverted to initiator');
      newSummary.Submitted = sub.length + rsub.length + revIn.length;
      let inp = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'InProcess');
      let rev = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'Reverted');
      newSummary.InProcess = inp.length + rev.length;
      let rej = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'Rejected');
      newSummary.rejected = rej.length;
      let com = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus == 'Completed');
      newSummary.Completed = com.length;
      let tot = data.filter((x:any)  => x.serviceCatagory == element.serCatCode && x.appSatus != 'Created');
      newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
      this.summarylist.push(newSummary);
    });
    this.gettotal(this.summarylist);
  }
  dmfgradevalue(value) {
    if (value == '0') {
      this.DmfGradelist1 = this.DmfGradelist;
      this.ItemCodeRequestModel.dmfGradeId = 0;

    }
    else {
      this.ItemCodeRequestModel.dmfGradeId = undefined;
      this.DmfGradelist1 = this.DmfGradelist.filter((x:any)  => x.dmfGradeId != '0');
    }
  }
  getItemCodeSummarydata(data) {
    var softwareList1 = []
    if (this.filtermaterialtype != null) {
      softwareList1 = this.materialList.filter((x:any)  => x.id == this.filtermaterialtype);
    }
    else {
      softwareList1 = this.materialList;
    }
    this.summarylist = [];
    softwareList1.forEach((element:any)=> {

      let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
      newSummary.type = element.type;
      let cre = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'Created');
      newSummary.Created = cre.length;
      let sub = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'Submitted');
      let rsub = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'ReSubmitted');
      let revIn = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'Reverted to initiator');
      newSummary.Submitted = sub.length + rsub.length + revIn.length;
      let inp = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'InProcess');
      let rev = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'Reverted');
      newSummary.InProcess = inp.length + rev.length;
      let rej = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'Rejected');
      newSummary.rejected = rej.length;
      let com = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType == 'Completed');
      newSummary.Completed = com.length;
      let tot = data.filter((x:any)  => x.materialTypeId == element.id && x.approveType != 'Created');
      newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
      this.summarylist.push(newSummary);
    });
    this.gettotal(this.summarylist);
  }

  getVendororCustomerSummary(data) {
    this.summarylist = [];
    this.AccGroupList.forEach((element:any)=> {

      let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
      newSummary.type = element.accountGroupName;
      let cre = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'Created');
      newSummary.Created = cre.length;
      let sub = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'Submitted');
      let rsub = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'ReSubmitted');
      let revIn = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'Reverted to initiator');
      newSummary.Submitted = sub.length + rsub.length + revIn.length;
      let inp = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'InProcess');
      let rev = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'Reverted');
      newSummary.InProcess = inp.length + rev.length;
      let rej = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'Rejected');
      newSummary.rejected = rej.length;
      let com = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus == 'Completed');
      newSummary.Completed = com.length;
      let tot = data.filter((x:any)  => +(x.accountGroupId) == element.accountGroupId && x.approveStatus != 'Created');
      newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
      this.summarylist.push(newSummary);
    });
    this.gettotal(this.summarylist);
  }
  totcre: any;
  totsub: any;
  totinp: any;
  totrej: any;
  totcom: any;
  total: any;
  gettotal(value) {
    this.total = 0;
    this.totcre = 0;
    this.totsub = 0;
    this.totinp = 0;
    this.totrej = 0;
    this.totcom = 0;
    for (let j = 0; j < value.length; j++) {
      this.total += value[j].Total;
      this.totcre += value[j].Created;
      this.totsub += value[j].Submitted;
      this.totinp += value[j].InProcess;
      this.totrej += value[j].rejected;
      this.totcom += value[j].Completed;

    }

  }
  typeofmaterial: any[] = [
    { id: 'Printed', name: 'Printed Material' },
    { id: 'Plain', name: 'Plain Material' }
  ];
  serializer!: boolean;
  serializerid!: boolean;
  Aprlpriority!: number;

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
  removeRows(item:any) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  summarylist1: any[] = [{ id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null }]
  PlantWiseSummary(data) {
    this.summarylist1 = [];
    this.locationList.forEach((element:any)=> {

      let loc: any[] = [];
      if (this.filtertype == 'Item Code Extension') {
        loc = data.filter((x:any)  => x.extendedToPlant1 == element.id);
      }
      else {
        loc = data.filter((x:any)  => x.locationId == element.id);
      }
      if (loc.length > 0) {
        let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
        newSummary.type = element.code;
        let cre = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'Created');
        newSummary.Created = cre.length;
        let sub = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'Submitted');
        let rsub = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'ReSubmitted');
        let revIn = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'Reverted to initiator');
        newSummary.Submitted = sub.length + rsub.length + revIn.length;
        let inp = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'InProcess');
        let rev = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'Reverted');
        newSummary.InProcess = inp.length + rev.length;
        let rej = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'Rejected');
        newSummary.rejected = rej.length;
        let com = data.filter((x:any)  => x.locationId == element.id && x.approveType == 'Completed');
        newSummary.Completed = com.length;
        let tot = data.filter((x:any)  => x.locationId == element.id && x.approveType != 'Created');
        newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
        this.summarylist1.push(newSummary);
      }
    });
    this.gettotal1(this.summarylist1);
  }
  PlantWiseExtSummary(data) {
    this.summarylist1 = [];
    this.locationList.forEach((element:any)=> {


      let loc = data.filter((x:any)  => x.extendedToPlant1 == element.id);

      if (loc.length > 0) {
        let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
        newSummary.type = element.code;
        let cre = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'Created');
        newSummary.Created = cre.length;
        let sub = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'Submitted');
        let rsub = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'ReSubmitted');
        let revIn = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'Reverted to initiator');
        newSummary.Submitted = sub.length + rsub.length + revIn.length;
        let inp = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'InProcess');
        let rev = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'Reverted');
        newSummary.InProcess = inp.length + rev.length;
        let rej = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'Rejected');
        newSummary.rejected = rej.length;
        let com = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType == 'Completed');
        newSummary.Completed = com.length;
        let tot = data.filter((x:any)  => x.extendedToPlant1 == element.id && x.approveType != 'Created');
        newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
        this.summarylist1.push(newSummary);
      }
    });
    this.gettotal1(this.summarylist1);
  }
  PlantWiseSummary1(data) {
    this.summarylist1 = [];
    this.locationList.forEach((element:any)=> {

      let loc = data.filter((x:any)  => x.plantCode == element.code);
      if (loc.length > 0) {
        let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
        newSummary.type = element.code;
        let cre = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'Created');
        newSummary.Created = cre.length;
        let sub = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'Submitted');
        let rsub = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'ReSubmitted');
        let revIn = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'Reverted to initiator');
        newSummary.Submitted = sub.length + rsub.length + revIn.length;
        let inp = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'InProcess');
        let rev = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'Reverted');
        newSummary.InProcess = inp.length + rev.length;
        let rej = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'Rejected');
        newSummary.rejected = rej.length;
        let com = data.filter((x:any)  => x.plantCode == element.code && x.appSatus == 'Completed');
        newSummary.Completed = com.length;
        let tot = data.filter((x:any)  => x.plantCode == element.code && x.appSatus != 'Created');
        newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
        this.summarylist1.push(newSummary);
      }
    });
    this.gettotal1(this.summarylist1);
  }
  PlantWiseSummary2(data) {
    this.summarylist1 = [];
    this.locationList.forEach((element:any)=> {

      let loc = data.filter((x:any)  => x.locationId == element.id);
      if (loc.length > 0) {
        let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
        newSummary.type = element.code;
        let cre = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'Created');
        newSummary.Created = cre.length;
        let sub = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'Submitted');
        let rsub = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'ReSubmitted');
        let revIn = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'Reverted to initiator');
        newSummary.Submitted = sub.length + rsub.length + revIn.length;
        let inp = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'InProcess');
        let rev = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'Reverted');
        newSummary.InProcess = inp.length + rev.length;
        let rej = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'Rejected');
        newSummary.rejected = rej.length;
        let com = data.filter((x:any)  => x.locationId == element.id && x.approveStatus == 'Completed');
        newSummary.Completed = com.length;
        let tot = data.filter((x:any)  => x.locationId == element.id && x.approveStatus != 'Created');
        newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
        this.summarylist1.push(newSummary);
      }
    });
    this.gettotal1(this.summarylist1);
  }
  PlantWiseSummary3(data) {
    this.summarylist1 = [];
    this.locationList.forEach((element:any)=> {

      let loc = data.filter((x:any)  => x.plantCode == element.code);
      if (loc.length > 0) {
        let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
        newSummary.type = element.code;
        let cre = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'Created');
        newSummary.Created = cre.length;
        let sub = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'Submitted');
        let rsub = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'ReSubmitted');
        let revIn = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'Reverted to initiator');
        newSummary.Submitted = sub.length + rsub.length + revIn.length;
        let inp = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'InProcess');
        let rev = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'Reverted');
        newSummary.InProcess = inp.length + rev.length;
        let rej = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'Rejected');
        newSummary.rejected = rej.length;
        let com = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus == 'Completed');
        newSummary.Completed = com.length;
        let tot = data.filter((x:any)  => x.plantCode == element.code && x.approveStatus != 'Created');
        newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
        this.summarylist1.push(newSummary);
      }
    });
    this.gettotal1(this.summarylist1);
  }

  CreSumList: any[] = [{ id: 0, type: '', Pending: '', Completed: '', Total: '' }]
  CreatorWiseSummary(data) {
    this.CreSumList = [];
    this.creatorsList.forEach((element:any)=> {

      let loc: any;
      if (this.filtertype == 'Item Code Request') {
        loc = data.filter((x:any)  => x.creator == element.approverId && x.approveType != 'Created');
      }
      else if (this.filtertype == 'Service Master') {
        loc = data.filter((x:any)  => x.pendingApprover == element.approverId && x.appSatus != 'Created');
      }
      else {
        loc = data.filter((x:any)  => x.pendingApprover == element.approverId && x.approveStatus != 'Created');
      }
      if (loc.length > 0) {
        let newSummary = { id: 0, type: '', Pending: '', Completed: '', Total: '' };
        newSummary.type = element.approverName;
        let cre = data.filter((x:any)  => x.pendingApprover == element.approverId);
        newSummary.Pending = cre.length;
        let com = data.filter((x:any)  => x.creator == element.approverId);
        newSummary.Completed = com.length;
        newSummary.Total = cre.length + com.length;
        this.CreSumList.push(newSummary);
      }

    });
    if (this.CreSumList.length <= 0) {
      let newSummary = { id: 0, type: 'Total', Pending: 0, Completed: 0, Total: 0 };
      this.CreSumList.push(newSummary);
    }
    // this.gettotal1(this.summarylist1); 
  }

  totcre1: any;
  totsub1: any;
  totinp1: any;
  totrej1: any;
  totcom1: any;
  total1: any;
  gettotal1(value) {
    this.total1 = 0;
    this.totcre1 = 0;
    this.totsub1 = 0;
    this.totinp1 = 0;
    this.totrej1 = 0;
    this.totcom1 = 0;
    for (let j = 0; j < value.length; j++) {
      this.total1 += value[j].Total;
      this.totcre1 += value[j].Created;
      this.totsub1 += value[j].Submitted;
      this.totinp1 += value[j].InProcess;
      this.totrej1 += value[j].rejected;
      this.totcom1 += value[j].Completed;

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
        this.masterslist.forEach((element:any)=> {

          this.servicegrouplist = element.servicegrouplist;
          this.PaymentTermList = element.paymentTermList;
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
          this.CustomerGroupList = element.customerGroupList;
          this.taxclassList = element.taxclassList;
          this.serviceCategorylist = element.serviceCategorylist;
          this.locationList = element.locationList;
        });

      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.masterslist = {};
    });
  }
  getUOMMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.uomMasterList = data.filter((x:any)  => x.isActive);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.uomMasterList = [];
    });
  }
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locationList.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.code = i.code, i.id = i.id, i.name = i.name, i.location = i.code + '-' + i.name; return i; });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });

      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.SAP_from_date = null;
    this.SAP_to_date = null;
   // this.filterlocation = null;
 this.filterlocation = '';
    this.filtermaterialtype = null;
  // this.filterstatus = null;
  this.filterstatus = '';
    this.filterRequestedBy = null;
    this.filterrequest = null;
    this.filtercreator = null;
    this.filtertype = null;
    this.PWS = false;
    this.CCS = false;
  }
  creatorsList: any[] = [];
  getCreatorsList() {
    this.httpService.post(APIURLS.BR_MASTER_APPROVERS_GET_CREATORS_LIST_API, 'Creator').then((data: any) => {
      if (data.length > 0) {
        this.creatorsList = data;
        this.creatorsList = this.creatorsList.filter((item, i, arr) => arr.findIndex((t) => t.approverName === item.approverName) === i);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.creatorsList = [];
    });
  }
  getstoragelocationList() {
    this.httpService.get(APIURLS.BR_MASTER_STORAGE_LOCATION_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.storagelocationlist = data;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.storagelocationlist = [];
    });
  }

  locationSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'location',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  selectedLocations: any[] = [];
  onLocationDeSelect() {
  }
  onLocationDeSelectAll() {
    this.selectedLocations = [];
  }
  onLocationSelectAll(items: any) {
    this.selectedLocations = items;
  }

  MatTypeSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'MatType',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  selectedMatTypes: any[] = [];
  onTypeDeSelect() {
  }
  onTypeDeSelectAll() {
    this.selectedMatTypes = [];
  }
  onTypeSelectAll(items: any) {
    this.selectedMatTypes = items;
  }
  // materialgroupList: any[] = []
  getMaterialGroupList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //this.materialgroupList = data;
        this.materialgroupList = data.filter((x:any)  => x.stxt != null);
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.materialgroupList = [];
    });
  }
  location(id:any) {
    let loc = this.locationList.find((x:any)  => x.id == id);
    return loc ? loc.code : "";
  }

  getAllEntries1() {
    this.showTable = true;
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
    var filterModel: any = {};

    filterModel.materialType = this.filtermaterialtype;
    filterModel.location = this.filterlocation == null ? null : this.locationList.find((x:any)  => x.code == this.filterlocation).id;
    filterModel.requestNo = this.filterrequest;
    this.filterstatus = this.filterstatus == 'InProcess' ? 'InProcess,Reverted' : this.filterstatus;
    //this.filterstatus=this.filterstatus=='Created'?'Created,':this.filterstatus;
    this.filterstatus = this.filterstatus == 'Submitted' ? 'Submitted,ReSubmitted,Reverted to initiator' : this.filterstatus;
    filterModel.status = this.filtercreator == null ? this.filterstatus : 'Completed';
    filterModel.creator = this.filtercreator;
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.type = "Report";
    filterModel.requestedBy = this.filterRequestedBy;
    filterModel.sapFromDate = this.SAP_from_date ? this.getFormatedDateTime(this.SAP_from_date) : null;
    filterModel.sapToDate = this.SAP_to_date ? this.getFormatedDateTime(this.SAP_to_date) : null;
    filterModel.fromDate = this.from_date ? this.getFormatedDateTime(this.from_date) : null;
    filterModel.toDate = this.to_date ? this.getFormatedDateTime(this.to_date) : null;
    // filterModel.sapFromDate = this.getFormatedDateTime(this.SAP_from_date);
    // filterModel.sapToDate = this.getFormatedDateTime(this.SAP_to_date);
    this.httpService.post(APIURLS.BR_ITEMCODE_REQUEST_FILTER_API, filterModel).then((data: any) => {
      if (data) {

        this.reportdata = data;
        this.totalCount = data[0].totalCount;
        this.totalPages = data[0].totalPages;
        this.getItemCodeSummarydata(data);
        this.PlantWiseSummary(data);
        this.CreatorWiseSummary(data);
        this.reportdata.reverse();

      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.reportdata = [];
    });

  }
  //ItemCodeExtensionFilter: any[] = [];
  getExtensionData() {
    this.showTable = true;
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
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

    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.type = "Report";
    this.httpService.post(APIURLS.BR_ITEMCODE_EXTENSION_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.reportdata = data;
        this.totalCount = data[0].totalCount;
        this.totalPages = data[0].totalPages;
        this.reportdata.reverse();
        this.getItemCodeSummarydata(data);
        this.PlantWiseExtSummary(data);
        this.CreatorWiseSummary(data);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.reportdata = [];
    });


  }

  GetEmployeeDetails() {
    var self = this;
    $('#requestby').autocomplete({
      source: function (request:any, response:any) {
        var searchTerm1 = request.term;
        let connection = self.httpService.get(APIURLS.BR_GET_EMPLOYEE_BASED_ON_SEARCHTEXT + "/" + request.term)
        connection.then((data: any) => {
          if (data) {
            let result = data;
            response(result.map((i:any) => {
              // i.label = i.name + '-' + i.mobile + '-' + i.companyName, i.name = i.name, i.mobile = i.mobile
              //  , i.companyName = i.companyName, i.email = i.email; return i;
              i.label = i.fullName + " (" + i.employeeId + ")", i.value = i.employeeId, i.name = i.name,
                i.mobile = i.mobileNo,
                i.email = i.emailId, i.plant = i.plant; return i;
            }));
          }
        }).catch((error)=> {
        });
      },
      select: function (event:any, ui:any) {

        self.filterRequestedBy = ui.item.value;

        return false;
      }
    });

  }

  showTable: boolean = false;
  getAllEntries() {
    if (this.filtertype == null || this.filtertype == undefined) {
      this.GetMasterCount();
    }
    else if (this.filtertype == 'Item Code Request') {
      this.getAllEntries1();
    }
    else if (this.filtertype == 'Item Code Extension') {
      this.getExtensionData();
    }
    else if (this.filtertype == 'Item Code Modification') {
      this.getModAllEntries();
    }
    else {
      this.showTable = true;
      this.isLoading = true;
      let td = new Date();
      let formatedFROMdate: string
      let formatedTOdate: string
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
      filterModel.location = this.filterlocation;
      filterModel.requestNo = this.filterrequest;
      this.filterstatus = this.filterstatus == 'InProcess' ? 'InProcess,Reverted' : this.filterstatus;
      //this.filterstatus=this.filterstatus=='Created'?'Created,':this.filterstatus;
      this.filterstatus = this.filterstatus == 'Submitted' ? 'Submitted,ReSubmitted,Reverted to initiator' : this.filterstatus;
      filterModel.status = this.filtercreator == null ? this.filterstatus : 'Completed';
      filterModel.type = this.filtertype;
      filterModel.creator = this.filtercreator;
      filterModel.fromDate = this.getFormatedDateTime(this.from_date);
      filterModel.toDate = this.getFormatedDateTime(this.to_date);
      this.httpService.post(APIURLS.BR_MASTER_REPORT_FILTER_API, filterModel).then((data: any) => {
        if (data) {
          // this.ServiceMasterFilter = data;
          // this.ServiceMasterFilter.reverse();
          this.reportdata = data;
          this.totalCount = data[0].totalCount;
          this.totalPages = data[0].totalPages;
          if (this.filtertype == 'Service Master') {
            this.getSummarydata(this.reportdata);
            this.PlantWiseSummary1(data)
            this.CreatorWiseSummary(data);
          }
          else {
            this.getVendororCustomerSummary(this.reportdata);
            this.CreatorWiseSummary(data);
            if (this.filtertype == 'Vendor Master') {
              this.PlantWiseSummary2(data)
            }
            else {
              this.PlantWiseSummary3(data)
            }

          }

        }
        this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.reportdata = [];
      });

    }
  }
  cleartype() {
    this.reInitDatatable();
    if (this.filtertype == 'Item Code Request') {
      this.masterslist = [];
      this.clearMastersList();
      this.getMastersdata();
    }
    else {
      this.masterdatalist = [];
      this.clearMasterdata();
      this.getMastersList();
    }
    this.showTable = false;
    this.total = 0;
    this.totcre = 0;
    this.totsub = 0;
    this.totinp = 0;
    this.totrej = 0;
    this.totcom = 0;
    this.summarylist = [];
    this.summarylist1 = [];
  }

  clearMasterdata() {
    this.storageconditionlist = [];
    this.tempconditionlist = [];
    this.PackSizelist = [];
    this.packTypelist = [];
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
  clearMastersList() {
    this.servicegrouplist = [];
    this.PaymentTermList = [];
    this.ReconciliationAccList = [];
    this.TdsSectionList = [];
    this.VendorTypeList = [];
    this.AccClerckList = [];
    this.countrylist = [];
    this.stateList = [];
    this.currencyList = [];
    this.purchasegrouplist = [];
    // this.uomMasterList=[];
    //this.ValuationClasslist=[];
    this.AccGroupList = [];
    this.pricegrouplist = [];
    this.pricelist = [];
    this.CustomerGroupList = [];
    this.taxclassList = [];
    this.serviceCategorylist = [];
  }
  getNumOfDays(values) {
    if (values.sapCreationDate != null && values.modifiedDate != null) {
      var date1 = new Date(values.sapCreationDate);
      var date2 = new Date(values.modifiedDate);
      var Time = date2.getTime() - date1.getTime();
      var Days = Math.round(Math.abs(Time / (1000 * 3600 * 24)));
      //et days:any=this.getDateFormate(values.sapCreationDate)-this.getDateFormate(values.requestReceivedDate);
      return Days != null ? Days : '';
    }
    else {
      return '';
    }
  }
  currentUser!: AuthData;
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
    this.reportdata.forEach((item :any) => {
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
  exportMAsXLSX(): void {
    this.exportList = [];
    let status: any;
    let index = 0;
    var name = this.filtertype + ' ' + 'Report';
    this.reportdata.forEach((item :any) => {
      index = index + 1;

      let exportItem = {
        "SNo": index,
        "Request No": item.requestNo,
        "Requested By": item.requestedBy,
        "Requested On": this.setDateFormate(item.requestDate),
        "Material Code": item.itemCode,
        "Subject ": item.subject,
        "Description": item.description,
        "Approve Status": item.status,
        "Last Approver": item.lastApprover,
        "Pending Approver": item.pendingApprover

      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, name);
  }
  getloc(loc:any) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }
  selCoated(id:any) {
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
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  gettransactions1(value) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, value.requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter((x:any)  => x.approvalPriority != null && x.processType == 'Item Code Request');
        this.getApproversList1(value);
      }
      else {
        this.getApproversList1(value);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
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
    var loc = this.locationList.find((x:any)  => x.id == this.ItemCodeRequestModel.locationId);
    var mat = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId);

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
          let temp = this.Approverslist.find((x:any)  => x.role == 'Creator');
          let temp1 = this.Approverslist.find((x:any)  => x.priority == temp.priority - 1);
          if (temp1.approverId == empid || temp1.parllelApprover1 == empid || temp1.parllelApprover2 == empid ||
            temp1.parllelApprover3 == empid || temp1.parllelApprover4 == empid) {
            this.serializer = true;
            this.serializerid = true;
            this.ItemCodeRequestModel.serializedFromDate = new Date().toLocaleString();
          }
        }
        let Appr1 = this.Approverslist.find((x:any)  => x.priority == 1 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find((x:any)  => x.priority == 2 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }
        let Appr3 = this.Approverslist.find((x:any)  => x.approverId == empid ||
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
          let temp = this.Approverslist.find((x:any)  => x.priority == ad.approvalPriority &&
            (ad.doneBy == x.approverId || ad.doneBy == x.parllelApprover1 || ad.doneBy == x.parllelApprover2));
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
                ad.status = this.approverstatuslist.find((x:any)  => x.id == ad.approvalPriority).name;
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
          let temp1 = this.transactionslist.find((x:any)  => x.approvalPriority == ad.priority &&
            (x.doneBy == ad.approverId || x.doneBy == ad.parllelApprover1 || x.doneBy == ad.parllelApprover2));
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
        this.Approverslist = this.Approverslist.sort((a:any, b:any) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a:any, b:any) => {
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
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  servicemastermodel = {} as ServiceMaster
  vendormastermodel = {} as VendorMaster
  CustomerMastermodel = {} as CustomerMaster
  ItemCodeRequestModel = {} as ItemCodeRequest
  Approverslist: any[] = [];
  weightUomlist: any[] = [];
  getApproversList(value:any) {
    if (this.filtertype == 'Service Master') {
      var keyvalue = value.plantCode + ',' + 5;
    }
    else if (this.filtertype == 'Vendor Master') {
      var loc = this.locationList.find((x:any)  => x.id == value.locationId);
      var accgrp = this.AccGroupList.find((x:any)  => x.accountGroupId == value.accountGroupId);
      var group = accgrp.accountGroupName == 'Import' ? 'Import' : 'Local';
      var keyvalue = loc.code + '~' + value.vendorCat + '~' + value.vendorSubCat + ',' + 3;
    }
    else {
      var loc = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
      var keyvalue = value.plantCode + '~' + value.customerType + ',' + 4;
    }
    this.Approverslist = [];
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        this.Approverslist = this.Approverslist.filter((x:any)  => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;
        let Appr1 = this.Approverslist.find((x:any)  => x.priority == 1 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find((x:any)  => x.priority == 2 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }
        let Appr3 = this.Approverslist.find((x:any)  => x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr3 != null || Appr3 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Review = true;
          this.Aprlpriority = Appr3.priority;
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
          let temp = this.Approverslist.find((x:any)  => x.priority == ad.approvalPriority &&
            (ad.doneBy == x.approverId || ad.doneBy == x.parllelApprover1 || ad.doneBy == x.parllelApprover2));
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
                ad.status = this.approverstatuslist.find((x:any)  => x.id == ad.approvalPriority).name;
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
          let temp1 = this.transactionslist.find((x:any)  => x.approvalPriority == ad.priority &&
            (x.doneBy == ad.approverId || x.doneBy == ad.parllelApprover1 || x.doneBy == ad.parllelApprover2));
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
        this.Approverslist = this.Approverslist.sort((a:any, b:any) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a:any, b:any) => {
          if (a.doneOn > b.doneOn) return 1;
          if (a.doneOn < b.doneOn) return -1;
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
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  getstatelist(id:any) {
    this.stateList1 = this.stateList.filter((x:any)  => x.land1 == id);
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
    if (this.filtertype == 'Item Code Request') {
      this.gettransactions1(item);
    }
    else {
      this.gettransactions(item);
    }
    // this.getApproversList(item);
    if (this.filtertype == 'Service Master') {
      if (item.attachment != null || item.attachment != undefined) {
        this.attachments = item.attachment.split(',');
      }
      this.servicemastermodel = Object.assign({}, item);
      jQuery('#myModal').modal('show');
    }
    else if (this.filtertype == 'Vendor Master') {
      if (item.attachments != null || item.attachments != undefined) {
        this.attachments = item.attachments.split(',');
      }
      item.accountGroupId = item.accountGroupId.trim();
      this.stateList1 = this.stateList.filter((x:any)  => x.land1 == this.vendormastermodel.countryId);
      this.vendormastermodel = Object.assign({}, item);
      jQuery('#vmModal').modal('show');
    }
    else if (this.filtertype == 'Item Code Request') {
      // this.ItemCodeRequestModel = Object.assign({},item) ;
      this.onUserActions(true, item, false, 'View');
    }
    else if (this.filtertype == 'Item Code Extension') {
      // this.ItemCodeRequestModel = Object.assign({},item) ;
      this.onClickNewRequest(true, item, false, 'View');
    }
    else if (this.filtertype == 'Item Code Modification') {
      // this.ItemCodeRequestModel = Object.assign({},item) ;
      this.onClickModRequest(true, item, false, 'View');
    }
    else {
      if (item.attachments != null || item.attachments != undefined) {
        this.attachments = item.attachments.split(',');
      }
      this.CustomerMastermodel = Object.assign({}, item);
      jQuery('#cmModal').modal('show');
    }



  }

  storageconditionlist: StorageCondition[] = [];
  tempconditionlist: TempCondition[] = [];
  PackSizelist: any[] = [];
  packTypelist: any[] = [];
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
          this.packTypelist = master.packType;
          this.Divisionlist = master.division;
          this.departmentList = master.departmentMaster;
          this.pharmagradelist = master.pharmaGrade;
          this.purchasegrouplist = master.purchaseGroup;
          // this.locationList=master.locationMaster;
          this.materialList = master.materialType;
          this.materialList.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.type = i.type, i.id = i.id, i.description = i.description, i.MatType = i.type + '-' + i.description; return i; }); this.materialgroupList = master.materialGroup;
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
    }).catch((error)=> {
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
  Count: any = {};
  ITot: any; VTot: any; STot: any; CTot: any; ETot: any;
  Summary: boolean = false;
  GetMasterCount() {
    var filterModel: any = {};
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string
    let formatedTOdate: string
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
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_GET_SAP_MASTER_COUNT, filterModel).then((data: any) => {
      if (data) {
        this.Summary = true;
        this.Count = data[0];
        this.ITot = +this.Count.cre + +this.Count.sub + +this.Count.inp + +this.Count.rej + +this.Count.com
        this.VTot = +this.Count.vCre + +this.Count.vSub + +this.Count.vInp + +this.Count.vRej + +this.Count.vCom
        this.STot = +this.Count.sCre + +this.Count.sSub + +this.Count.sInp + +this.Count.sRej + +this.Count.sCom
        this.CTot = +this.Count.cCre + +this.Count.cSub + +this.Count.cInp + +this.Count.cRej + +this.Count.cCom
        this.ETot = +this.Count.eCre + +this.Count.eSub + +this.Count.eInp + +this.Count.eRej + +this.Count.eCom
        this.totcre = +this.Count.cre + +this.Count.vCre + +this.Count.sCre + +this.Count.cCre + +this.Count.eCre
        this.totsub = +this.Count.sub + +this.Count.vSub + +this.Count.sSub + +this.Count.cSub + +this.Count.eSub
        this.totinp = +this.Count.inp + +this.Count.vInp + +this.Count.sInp + +this.Count.cInp + +this.Count.eInp
        this.totrej = +this.Count.rej + +this.Count.vRej + +this.Count.sRej + +this.Count.cRej + +this.Count.eRej
        this.totcom = +this.Count.com + +this.Count.vCom + +this.Count.sCom + +this.Count.cCom + +this.Count.eCom
        this.total = this.ITot + this.VTot + this.CTot + this.STot + this.ETot

        //this.getchart();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.Count = {};
    });

  }

  empId: string
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
      let type = this.materialList.find((x:any)  => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.storagelocationlist1 = this.storagelocationlist.filter((x:any)  => x.matType == type.type);
      this.ValuationClasslist1 = this.ValuationClasslist.filter((x:any)  => x.matType == type.type);
      if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
        ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
      }
      var name = this.materialList.find((x:any)  => x.id == +ItemCodeRequest.materialTypeId).type;
      if (ItemCodeRequest.pharmacopGrade != null || ItemCodeRequest.pharmacopGrade != undefined) {
        ItemCodeRequest.qcSpecification = this.pharmagradelist.find((x:any)  => x.pharmaGradeDesc == ItemCodeRequest.pharmacopGrade).pharmaGradeId.toString();
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
      let type = this.materialList.find((x:any)  => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.ValuationClasslist1 = this.ValuationClasslist.filter((x:any)  => x.matType == type.type);
      this.storagelocationlist1 = this.storagelocationlist.filter((x:any)  => x.matType == type.type);
      //this.ValuationClasslist=this.ValuationClasslist.filter((x:any)=>x.matType==type.type);
      this.getApproversList(ItemCodeRequest);
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
      if (name == 'FG') {
        this.getserializationdetails(ItemCodeRequest.requestNo);
      }
    }
    if (view == 'View') {
      this.isLoadingPop = false;
      this.Approver1 = true;
      this.Approver2 = true;
      this.Creator = true;
      this.serializer = true;
      this.view = true;
      this.isEdit = true;
    }

    var modal = '#' + name + 'NGXPModal';
    jQuery(modal).modal('show');

  }
  getTempcond(id:any) {
    let temp = this.tempconditionlist.find((x:any)  => x.tempConId == id);
    return temp ? temp.tempConDesc : '';
  }
  downloadFile(reqNo, name) {

    // console.log(filename);
    if (name.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, reqNo, name).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find((s:any) => s.id == id).name;
        if (data != undefined) {
         // var FileSaver = require('file-saver');
          const imageFile = new File([data], name, { type: 'application/doc' });
          // console.log(imageFile);
      //      FileSaver.saveAs(imageFile);


        }
      }).catch((error)=> {
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
        data.forEach((mtrl:any) => {
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
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }

  ItemCodeExtensionModel = {} as ItemCodeExtension;
  //ItemCodeRequestModel = {} as ItemCodeRequest;
  ItemCodeRequestModelList: ItemCodeRequest[] = [];
  materialtype!: string
  locationList1: any[] = [[]];

  GetMaterialDetails(code) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_REQUEST_GETBY_PARAM_API, code).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //  this.ItemCodeRequestModel=data;
        this.ItemCodeRequestModelList = data;
        Object.assign(this.ItemCodeRequestModel, data);
        let value = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code)
        Object.assign(this.ItemCodeRequestModel, value);
        if (this.ItemCodeRequestModel.sapCodeExists == '1') {
          this.ItemCodeRequestModel.sapCodeExists = 'Yes';
        }
        else {
          this.ItemCodeRequestModel.sapCodeExists = 'No';
        }
        this.ItemCodeExtensionModel.plant1 = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code).locationId;
        this.ItemCodeExtensionModel.hsnCode = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code).hsnCode;
        let strloc = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code);
        let type = this.materialList.find((x:any)  => x.id == +strloc.materialTypeId)
        //this.storagelocationlist = this.storagelocationlist.filter((x:any)  => x.storageLocationId == strloc.storageLocationId &&  x.matType == type.type);
        //let type = this.materialList.find((x:any)  => x.id == +strloc.materialTypeId)
        // this.storagelocationlist2 = this.storagelocationlist.filter((x:any)  => x.matType == type.type);
        let temp = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code);
        this.locationList1 = this.locationList.filter((x:any)  => x.id == temp.locationId);
        this.materialtype = this.materialList.find((x:any)  => x.id == +temp.materialTypeId).type;
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
    }).catch((error)=> {
      this.isLoading = false;
      this.ItemCodeRequestModelList = [];
    });

  }
  ItemCodeRequestModelList1: any[] = [];
  storagelocationlist2: any[] = [];
  GetItemCodeData(code) {
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_DATA, code).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        //  this.ItemCodeRequestModel=data;
        this.ItemCodeRequestModelList1 = data;

        Object.assign(this.ItemCodeRequestModel, data);
        let value = this.ItemCodeRequestModelList1.find((x:any)  => x.sapCodeNo == code)
        Object.assign(this.ItemCodeRequestModel, value);

        if (this.ItemCodeRequestModelList1[0].sapCodeExists == '1') {
          this.ItemCodeRequestModel.sapCodeExists = 'No';
        }
        else {
          this.ItemCodeRequestModel.sapCodeExists = 'Yes';
        }
        this.ItemCodeRequestModel.materialGroupId = this.ItemCodeRequestModelList1[0].materialGroup;
        this.ItemCodeExtensionModel.materialTypeId = this.materialList.find((x:any)  => x.type == this.ItemCodeRequestModelList1[0].materialType).id.toString();
        this.ItemCodeRequestModel.unitOfMeasId = this.ItemCodeRequestModelList1[0].unitOfMeasId;
        this.ItemCodeRequestModel.storageLocationId = this.ItemCodeRequestModelList1[0].storageLoc;
        // this.ItemCodeExtensionModel.plant1 = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code).locationId;
        // this.ItemCodeExtensionModel.hsnCode = this.ItemCodeRequestModelList.find((x:any)  => x.sapCodeNo == code).hsnCode;
        let strloc = this.ItemCodeRequestModelList1.find((x:any)  => x.sapCodeNo == code);
        //let type = this.materialList.find((x:any)  => x.id == +strloc.materialTypeId)
        this.storagelocationlist1 = this.storagelocationlist.filter((x:any)  => x.storageLocationId == strloc.storageLoc && x.matType == this.ItemCodeRequestModelList1[0].materialType);
        //let type = this.materialList.find((x:any)  => x.id == +strloc.materialTypeId)
        this.storagelocationlist2 = this.storagelocationlist.filter((x:any)  => x.matType == this.ItemCodeRequestModelList1[0].materialType);
        let temp = this.ItemCodeRequestModelList1.find((x:any)  => x.sapCodeNo == code);
        //this.locationList1 = this.locationList.filter((x:any)  => x.id == temp.locationId);
        this.materialtype = this.materialList.find((x:any)  => x.type == this.ItemCodeRequestModelList1[0].materialType).type;
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
    }).catch((error)=> {
      this.isLoading = false;
      this.ItemCodeRequestModelList = [];
    });

  }
  // transactionslist: Transactions[] = [];
  gettransactionsEx(requestNo) {

    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter((x:any)  => x.processType == 'Item Code Extension' && x.approvalPriority != null);
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  // Approverslist: WorkFlowApprovers[] = [];
  // Aprlpriority!: number;
  // view: boolean = false;
  getApproversListEx(value) {

    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.ItemCodeExtensionModel = Object.assign({}, value);
    var loc = this.locationList.find((x:any)  => x.id == this.ItemCodeExtensionModel.extendedToPlant1);
    var mat = this.materialList.find((x:any)  => x.id == +this.ItemCodeExtensionModel.materialTypeId);
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);
    if (this.isEdit) {
      var keyvalue = loc.code + '~' + mat.type + '~' + this.ItemCodeExtensionModel.extendedStorageLocation1 + ',' + 2;
    }
    else {
      var keyvalue = loc.code + '~' + this.materialtype + '~' + this.ItemCodeExtensionModel.extendedStorageLocation1 + ',' + 2;
    }

    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        this.Approverslist = this.Approverslist.filter((x:any)  => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;
        let Appr1 = this.Approverslist.find((x:any)  => x.priority == 1 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find((x:any)  => x.priority == 2 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }
        let Appr3 = this.Approverslist.find((x:any)  => x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr3 != null || Appr3 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Review = true;
          this.Aprlpriority = Appr3.priority;
          this.ItemCodeRequestModel.sapCreatedBy = empid + '-' + empName;
          this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();
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
          let temp = this.Approverslist.find((x:any)  => x.priority == ad.approvalPriority &&
            (ad.doneBy == x.approverId || ad.doneBy == x.parllelApprover1 || ad.doneBy == x.parllelApprover2));
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
                ad.status = this.approverstatuslist.find((x:any)  => x.id == ad.approvalPriority).name;
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
          let temp1 = this.transactionslist.find((x:any)  => x.approvalPriority == ad.priority &&
            (x.doneBy == ad.approverId || x.doneBy == ad.parllelApprover1 || x.doneBy == ad.parllelApprover2));
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
        this.Approverslist = this.Approverslist.sort((a:any, b:any) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a:any, b:any) => {
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
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  //empId: string
  resetForm() {
    this.ItemCodeExtensionModel = {} as ItemCodeExtension;
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.comments = "";
  }
  onClickNewRequest(isedit: boolean, ItemCodeExtension: ItemCodeExtension, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.resetForm();
    this.Approverslist = [];
    this.transactionslist = [];
    this.view = false;
    this.gettransactionsEx(ItemCodeExtension.requestNo);
    //this.getApproversList(ItemCodeExtension);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      //   this.getApproversList(ItemCodeExtension);
      this.getApproversListEx(ItemCodeExtension);
      this.ItemCodeExtensionModel = Object.assign({}, ItemCodeExtension);
      //this.GetMaterialDetails(ItemCodeExtension.materialCode1);
      this.GetItemCodeData(ItemCodeExtension.materialCode1);
      this.empId = this.ItemCodeRequestModel.createdBy;
    }
    else {
      this.ItemCodeExtensionModel = Object.assign({}, ItemCodeExtension);
      ItemCodeExtension.plant1 = this.currentUser.baselocation.toString();
      // this.GetMaterialDetails(ItemCodeExtension.materialCode1);
      this.empId = this.ItemCodeRequestModel.createdBy;
      this.getApproversListEx(ItemCodeExtension);
    }
    if (isprint) {
      jQuery("#printModal").modal('show');
    }
    else {

      jQuery('#ExModal').modal('show');
      if (value == "View") {
        this.view = true;

      }


    }
  }
  chart: any;
  chart1: any;
  chart2: any;
  chart3: any;
 // public chartPlugins = [ChartDataLabels];
  datas: any = [];
  label: any[] = [];
  getchart() {
    let pieData = []; let pieData1 = []; let pieData2 = []; let pieData3 = [];
    let labels1 = [];
    let bckColor = [];
    let lab = ""; let lab1 = ""; let lab2 = ""; let lab3 = "";
    pieData = [this.Count.cre, this.Count.sub, this.Count.inp, this.Count.rej, this.Count.com];
    pieData1 = [this.Count.vCre, this.Count.vSub, this.Count.vInp, this.Count.vRej, this.Count.vCom];
    pieData2 = [this.Count.sCre, this.Count.sSub, this.Count.sInp, this.Count.sRej, this.Count.sCom];
    pieData3 = [this.Count.cCre, this.Count.cSub, this.Count.cInp, this.Count.cRej, this.Count.cCom];
    labels1 = ['Created', 'Submitted', 'Inprocess', 'Rejected', 'Completed'];
    bckColor = ["#3e95cd", "#d9534f", "#4e73df", "#dfb44e", "#4edf8f", "#df5a4e"];
    lab = "Item Code Request Status"
    lab1 = "Vendor Master Status"
    lab2 = "Service Master Status"
    lab3 = "Customer Master Status"

    // this.chart = new Chart(document.getElementById("myPieChart"), {
    //   plugin: this.chartPlugins,
    //   type: 'doughnut',
    //   data: {
    //     labels: labels1,
    //     datasets: [
    //       {
    //         label: lab,
    //         backgroundColor: bckColor,
    //         data: pieData
    //       }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: true,
    //     responsive: true,
    //     legend: {
    //       position: 'right',
    //       labels: {
    //         padding: 20,
    //         boxWidth: 10
    //       },
    //       onClick: (e) => e.stopPropagation()
    //     },
    //     plugins: {
    //       datalabels: {
    //         color: 'white',
    //         font: {
    //           size: 15,
    //           weight: 600
    //         },
    //         offset: 4,
    //         padding: 0,
    //       }
    //     },
    //     title: {
    //       display: true,
    //       text: 'Item Code Request Status'
    //     }
    //   }
    // });
    // this.chart1 = new Chart(document.getElementById("myPieChart1"), {
    //   plugin: this.chartPlugins,
    //   type: 'doughnut',
    //   data: {
    //     labels: labels1,
    //     datasets: [
    //       {
    //         label: lab1,
    //         backgroundColor: bckColor,
    //         data: pieData1
    //       }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: true,
    //     responsive: true,
    //     legend: {
    //       position: 'right',
    //       labels: {
    //         padding: 20,
    //         boxWidth: 10
    //       },
    //       onClick: (e) => e.stopPropagation()
    //     },
    //     plugins: {
    //       datalabels: {
    //         color: 'white',
    //         font: {
    //           size: 15,
    //           weight: 600
    //         },
    //         offset: 4,
    //         padding: 0,
    //       }
    //     },
    //     title: {
    //       display: true,
    //       text: 'Vendor Master Status'
    //     }
    //   }
    // });
    // this.chart2 = new Chart(document.getElementById("myPieChart2"), {
    //   plugin: this.chartPlugins,
    //   type: 'doughnut',
    //   data: {
    //     labels: labels1,
    //     datasets: [
    //       {
    //         label: lab2,
    //         backgroundColor: bckColor,
    //         data: pieData2
    //       }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: true,
    //     responsive: true,
    //     legend: {
    //       position: 'right',
    //       labels: {
    //         padding: 20,
    //         boxWidth: 10
    //       },
    //       onClick: (e) => e.stopPropagation()
    //     },
    //     plugins: {
    //       datalabels: {
    //         color: 'white',
    //         font: {
    //           size: 15,
    //           weight: 600
    //         },
    //         offset: 4,
    //         padding: 0,
    //       }
    //     },
    //     title: {
    //       display: true,
    //       text: 'Service Master Status'
    //     }
    //   }
    // });
    // this.chart3 = new Chart(document.getElementById("myPieChart3"), {
    //   plugin: this.chartPlugins,
    //   type: 'doughnut',
    //   data: {
    //     labels: labels1,
    //     datasets: [
    //       {
    //         label: lab3,
    //         backgroundColor: bckColor,
    //         data: pieData3
    //       }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: true,
    //     responsive: true,
    //     legend: {
    //       position: 'right',
    //       labels: {
    //         padding: 20,
    //         boxWidth: 10
    //       },
    //       onClick: (e) => e.stopPropagation()
    //     },
    //     plugins: {
    //       datalabels: {
    //         color: 'white',
    //         font: {
    //           size: 15,
    //           weight: 600
    //         },
    //         offset: 4,
    //         padding: 0,
    //       }
    //     },
    //     title: {
    //       display: true,
    //       text: 'Customer Master Status'
    //     }
    //   }
    // });

  }

  ItemCodeModificationFilter: any[] = [];
  getModAllEntries() {
    this.isLoading = true;
    let td = new Date();
    this.showTable = true;
    let formatedFROMdate: string
    let formatedTOdate: string
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
    //filterModel.materialCode = this.filterMaterialCode;
    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_ITEMCODE_MODIFICATION_FILTER_DATA_API, filterModel).then((data: any) => {
      if (data) {
        this.reportdata = data;
        this.reportdata.reverse();
        this.getModSummary(data);
        this.PlantWiseSummary(data);
        this.CreatorWiseSummary(data);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.reportdata = [];
    });

  }

  SelectedCode: any;
  ItemcodesList: any[] = [];
  ItemcodesListCon: any[] = [];
  ItemCodeModificationModel = {} as ItemCodeModification;
  files: any[] = [];
  fileslist: any[] = [];
  fileslist1: any[] = [];
  onClickModRequest(isedit: boolean, ItemCodeModification: ItemCodeModification, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.isLoadingPop = false;
    this.resetForm();
    this.files = [];
    this.fileslist = [];
    this.fileslist1 = [];
    this.SelectedCode = null;
    this.attachments = [];
    this.Approverslist = [];
    this.transactionslist = [];
    this.view = false;
    this.gettransactions(ItemCodeModification.requestNo);
    if (isedit) {
      if (ItemCodeModification.attachments != null || ItemCodeModification.attachments != undefined) {
        this.attachments = ItemCodeModification.attachments.split(',');
      }
      this.attachments.filter((x:any)  => x.name != null || undefined)
      let temp = this.ItemcodesList.find((x:any)  => x.sapCodeNo == ItemCodeModification.itemCode);
      //  this.SelectedCode=this.ItemcodesListCon.filter((x:any)=>x.name1==(temp.sapCodeNo + '-' + temp.materialShortName))
      this.SelectedCode = ItemCodeModification.itemCode;
      this.getModApprovers(ItemCodeModification.itemCode);
      this.ItemCodeModificationModel = Object.assign({}, ItemCodeModification);

    }
    else {
      if (ItemCodeModification.requestNo != null || ItemCodeModification.requestNo != undefined) {
        if (ItemCodeModification.attachments != null || ItemCodeModification.attachments != undefined) {
          this.attachments = ItemCodeModification.attachments.split(',');
        }
        let temp = this.ItemcodesList.find((x:any)  => x.sapCodeNo == ItemCodeModification.itemCode);
        //  this.SelectedCode=this.ItemcodesListCon.filter((x:any)=>x.name1==(temp.sapCodeNo + '-' + temp.materialShortName))
        this.SelectedCode = ItemCodeModification.itemCode;
        this.getModApprovers(ItemCodeModification.itemCode);
      }
      this.ItemCodeModificationModel = Object.assign({}, ItemCodeModification);
      this.ItemCodeModificationModel.requestedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;
      this.ItemCodeModificationModel.requestDate = new Date().toLocaleString()

    }
    if (isprint) {
      jQuery("#printModal").modal('show');
    }
    else {

      jQuery('#ModModal').modal('show');
      if (value == "View") {
        this.view = true;

      }


    }
  }
  creatorid: boolean = false;
  getModApprovers(code) {
    //code=this.SelectedCode[0].sapCodeNo;
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_MODIFICATION_FILTER_API, code).then((data: any) => {
      if (data.length > 0) {
        this.Approverslist = data;
        let matData = this.Approverslist[0];
        let itemData = matData.itemCodeRequest;
        this.ItemCodeModificationModel.materialGroupId = itemData.materialGroupId;
        this.ItemCodeModificationModel.materialTypeId = itemData.materialTypeId;
        this.ItemCodeModificationModel.materialShortName = itemData.materialShortName;
        this.ItemCodeModificationModel.materialLongName = itemData.materialLongName;

        this.Approverslist = this.Approverslist.filter((x:any)  => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;

        let Appr1 = this.Approverslist.find((x:any)  => x.priority == 1 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find((x:any)  => x.priority == 2 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }
        let Appr3 = this.Approverslist.find((x:any)  => x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr3 != null || Appr3 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Aprlpriority = Appr3.priority;
          this.Review = true;
          if (Appr3.role == 'Creator') {
            this.Creator = true;
            this.creatorid = true;
            // this.ItemCodeRequestModel.sapCreatedBy = empid + '-'+empName;
            // this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();
            //this.serializer = true;
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
          let temp = this.Approverslist.find((x:any)  => x.priority == ad.approvalPriority);
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
                ad.status = this.approverstatuslist.find((x:any)  => x.id == ad.approvalPriority).name;
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
          let temp1 = this.transactionslist.find((x:any)  => x.approvalPriority == ad.priority);
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
        this.Approverslist = this.Approverslist.sort((a:any, b:any) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a:any, b:any) => {
          if (a.doneOn > b.doneOn) return 1;
          if (a.doneOn < b.doneOn) return -1;
          return 0;
        });

      }
      else {
        this.Approverslist = [];
        swal({
          title: "Message",
          text: "Item code does not exists",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        });
      }

      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }
  dropdownSettings = {
    singleSelection: true,
    idField: 'sapCodeNo',
    textField: 'name1',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  getItemCodes() {
    this.httpService.get(APIURLS.BR_ITEMCODE_REQUEST_GET_CODES_API).then((data: any) => {
      if (data.length > 0) {
        this.ItemcodesList = data;
        this.ItemcodesListCon = data.map((x:any) => { x.name1 = x.sapCodeNo + '-' + x.materialShortName; x.sapCodeNo = x.sapCodeNo; return x; });

      }
    }).catch((error)=> {
      this.isLoading = false;
      this.ItemcodesList = [];
    });
  }

  getModSummary(data) {
    this.summarylist = [];
    let newSummary = { id: 0, type: '', Created: null, Submitted: null, InProcess: null, rejected: null, Completed: null, Total: null };
    newSummary.type = 'Modification Request';
    let cre = data.filter((x:any)  => x.status == 'Created');
    newSummary.Created = cre.length;
    let sub = data.filter((x:any)  => x.status == 'Submitted');
    let rsub = data.filter((x:any)  => x.status == 'ReSubmitted')
    let revIn = data.filter((x:any)  => x.status == 'Reverted to initiator');
    newSummary.Submitted = sub.length + rsub.length + revIn.length;
    let inp = data.filter((x:any)  => x.status == 'InProcess');
    let rev = data.filter((x:any)  => x.status == 'Reverted');
    newSummary.InProcess = inp.length + rev.length;
    let rej = data.filter((x:any)  => x.status == 'Rejected');
    newSummary.rejected = rej.length;
    let com = data.filter((x:any)  => x.status == 'Completed');
    newSummary.Completed = com.length;
    let tot = data.filter((x:any)  => x.status != 'Created');
    newSummary.Total = cre.length + sub.length + inp.length + rej.length + com.length + rsub.length + revIn.length + rev.length;
    this.summarylist.push(newSummary);
    this.gettotal(this.summarylist);
  }
  onItemSelect(item: any) {
    // debugger;

  }
  onItemDeSelect(item: any) {
    // debugger;
    //  console.log(item);

  }
  onSelectAll(items: any) {
    //debugger;
    //  console.log(items);

  }
  onDeSelectAll(items: any) {

  }

  pageSize: any = 10;
  pageNo: any;
  totalCount!: number;
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
