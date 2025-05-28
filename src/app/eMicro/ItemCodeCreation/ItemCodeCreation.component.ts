import { FormControl, NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { AuthData } from '../../auth/auth.model'
import { Location } from '../../masters/employee/location.model';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MatSelectModule } from '@angular/material/select';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';
import { ProcessMaster } from '../Masters/ProcessMaster/ProcessMaster.model';
import { MaterialGroup } from '../Masters/MaterialGroup/MaterialGroup.model';
import { StorageLocation } from '../Masters/StorageLocation/StorageLocation.model';
import { MaterialType } from '../../masters/material/materialtype.model';
import { UOM } from '../../masters/uom/uom.model';
import { DmfGrade } from '../Masters/dmfgrademaster/dmfgrademaster.model';
import { PharmaGrade } from '../Masters/PharmacopeialGrade/PharmacopeialGrade.model';
import { PurchaseGroup } from '../Masters/PurchaseGroup/PurchaseGroup.model';
import { Transactions } from './transactions.model';
import { WorkFlowApprovers } from '../Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { StorageCondition } from '../Masters/storagecondition/storagecondition.model';
import { TempCondition } from '../Masters/tempcondition/tempcondition.model';
import { Country } from '../Masters/Country/Country.model';
import { stringify } from 'querystring';
import { ValuationClass } from '../Masters/valuationclass/valuationclass.model';
import { PackSize } from '../Masters/packsize/packsize.model';
import { Serialization } from './Serialization.model';

import * as XLSX from 'xlsx';
//import * as FileSaver from 'file-saver';
import { MastersData } from './ItemCodeMasters.model';
//import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';

declare var require: any;


export class gxpforms {
  id: string
  name!: NgForm;
}

export class nongxpforms {
  id: string
  name!: NgForm;
}
@Component({
  selector: 'app-ItemCodeCreation',
  templateUrl: './ItemCodeCreation.component.html',
  styleUrls: ['./ItemCodeCreation.component.css']
})

@Injectable()
export class ItemCodeCreationComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;

  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;
@ViewChild('myInput1', { static: false }) myInputVariable1!: ElementRef;
@ViewChild('myInput2', { static: false }) myInputVariable2!: ElementRef;
@ViewChild('myInput3', { static: false }) myInputVariable3!: ElementRef;
@ViewChild('myInput4', { static: false }) myInputVariable4!: ElementRef;


  // @ViewChild(NgForm  , { static: false })dataForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })PMForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })RMNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })PMNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })FGNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })LCNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })OSENGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })PPCNGXPForm!: NgForm;
  // @ViewChild(NgForm  , { static: false })RMForm!: NgForm;
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
  successMsg: string = "";
  path: string = '';
  locationList: any[] = [];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;

  ItemCodeRequestModel = {} as ItemCodeRequest;
  transactions = {} as Transactions;
  transactionslist: Transactions[] = [];
  Approverslist: WorkFlowApprovers[] = [];
  Approverslist1: WorkFlowApprovers[] = [];
  comments: string
  filtermaterialtype: string = ' ';
  filterstatus: string = ' ';
  filterlocation: string = ' ';
  filterrequest: string = ' ';
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  ItemCodeRequestFilter: ItemCodeRequest[] = [];
  ItemCodeRequestFilter1: ItemCodeRequest[] = [];
  emailid!: string

  requestdate: string
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string

  filterMatname: string = ' ';

  creatorid: boolean = false;

  ItemCodeRequestModeldata = {} as ItemCodeRequest;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
    , private http: HttpClient, private datePipe: DatePipe) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

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
    this.emailid = this.currentUser.email;
    this.userid = this.currentUser.employeeId;
    this.filterstatus = "Pending";
    // this.filterlocation = this.currentUser.baselocation.toString();
    this.requestdate = new Date(this.today).toLocaleString();
    //this.ItemCodeRequestModel.requestDate = new Date(this.today).toLocaleString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
    // this.getAllEntries();
    this.getMastersdata();
    this.getItemCodeRequestsList();
    this.GetAllApprovers();
    this.getbase64image();
    this.getAllEntries();
  }
  locationAllList: any[] = [[]];
  getLocation(id:any) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }

  periodtype: any[] = [
    { id: 1, name: 'Days' },
    { id: 2, name: 'Months' }
  ];
  typeofmaterial: any[] = [
    { id: 'Printed', name: 'Printed Material' },
    { id: 'Plain', name: 'Plain Material' }
  ];

  serializationtypes: any[] = [
    { id: 1, name: 'Not-Serialized' },
    { id: 2, name: 'Lot Managed' },
    { id: 3, name: 'Serialized(Publish only)' },
    { id: 4, name: 'Serialized and Traced' }
  ];

  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Pending' },
    { id: 4, name: 'InProcess' },
    { id: 5, name: 'Rejected' },
    { id: 6, name: 'Completed' },
    { id: 7, name: 'Approved' }
  ];

  purposelist: any[] = [
    { id: 1, name: 'Gifts & Compliments' },
    { id: 2, name: 'Propaganda & Promotional (KUDLU DEPOT)' },
    { id: 3, name: 'Production Launch Exp' },
    { id: 4, name: 'Sales Promotional(SAS)' },
    { id: 5, name: 'Visual Ads, Literature' },
    { id: 6, name: 'Conference,National & Regional' },
    { id: 7, name: 'Incentive to Field Staff' },
    { id: 8, name: 'Incentive to Stockist/Chemist' },
    { id: 9, name: 'Travelling Lodging & Boarding Exp' }

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

  masterslist: MastersData[] = [];
  weightUomlist: any[] = [];
  MaterialPricingGroupList: any[] = [];
  getMastersdata() {
    this.httpService.post(APIURLS.BR_GET_MASTERS_DATA_API, '').then((data: any) => {
      if (data) {
        this.masterslist = data;
        //let master:any;
        this.masterslist.forEach(master => {
          let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
          this.storageconditionlist = master.storageCondition;
          this.storageconditionlist.sort((a:any, b:any) => { return collator.compare(a.stoCondCode, b.stoCondCode) });
          this.tempconditionlist = master.tempCondition;
          this.tempconditionlist.sort((a:any, b:any) => { return collator.compare(a.tempConId, b.tempConId) });
          this.PackSizelist = master.packSize;
          this.PackSizelist.sort((a:any, b:any) => { return collator.compare(a.packSizeCode, b.packSizeCode) });
          this.packTypelist = master.packType;
          this.packTypelist.sort((a:any, b:any) => { return collator.compare(a.pTypeCode, b.pTypeCode) });
          this.Divisionlist = master.division;
          this.Divisionlist.sort((a:any, b:any) => { return collator.compare(a.divCode, b.divCode) });
          this.departmentList = master.departmentMaster;
          this.departmentList.sort((a:any, b:any) => { return collator.compare(a.name, b.name) });
          this.pharmagradelist = master.pharmaGrade;
          this.purchasegrouplist = master.purchaseGroup;
          this.purchasegrouplist.sort((a:any, b:any) => { return collator.compare(a.purchaseGroupId, b.purchaseGroupId) });
          this.locationList = master.locationMaster;
          // console.log(this.locationList);
          // console.log(master.locationMaster);
          this.locationList.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.code = i.code, i.id = i.id, i.name = i.name, i.location = i.code + '-' + i.name; return i; });
          this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });

          this.materialList = master.materialType;
          this.materialList.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.type = i.type, i.id = i.id, i.description = i.description, i.MatType = i.type + '-' + i.description; return i; });
          this.materialgroupList = master.materialGroup;
          this.materialgroupList.sort((a:any, b:any) => { return collator.compare(a.materialGroupId, b.materialGroupId) });
          this.countrylist = master.country;
          this.countrylist.sort((a:any, b:any) => { return collator.compare(a.landx, b.landx) });
          this.DmfGradelist = master.dmfGrade;
          this.DmfGradelist.sort((a:any, b:any) => { return collator.compare(a.dmfGradeId, b.dmfGradeId) });
          this.processlist = master.storageCondition;
          this.GenericNamelist = master.genericName;
          this.GenericNamelist.sort((a:any, b:any) => { return collator.compare(a.genNameCode, b.genNameCode) });
          this.TherapeuticSegmentlist = master.therapeuticSegment;
          this.TherapeuticSegmentlist.sort((a:any, b:any) => { return collator.compare(a.therSegCode, b.therSegCode) });
          this.ValuationClasslist = master.valuationClass;
          this.ValuationClasslist.sort((a:any, b:any) => { return collator.compare(a.valuationId, b.valuationId) });
          this.storagelocationlist = master.storageLocation;
          this.storagelocationlist.sort((a:any, b:any) => { return collator.compare(a.storageLocationId, b.storageLocationId) });
          this.Brandlist = master.brand;
          this.Brandlist.sort((a:any, b:any) => { return collator.compare(a.brandCode, b.brandCode) });
          this.Strengthlist = master.strength;
          this.Strengthlist.sort((a:any, b:any) => { return collator.compare(a.strengthCode, b.strengthCode) });
          this.uomMasterList = master.uomMaster;
          this.uomMasterList.sort((a:any, b:any) => { return collator.compare(a.uom, b.uom) });
          this.PackageMaterialGroup = master.packageMaterialGroup;
          this.PackageMaterialGroup.sort((a:any, b:any) => { return collator.compare(a.packingMaterialGroupId, b.packingMaterialGroupId) });
          this.weightUomlist = master.weightUom;
          this.weightUomlist.sort((a:any, b:any) => { return collator.compare(a.uom, b.uom) });
          this.MaterialPricingGroupList = master.materialPricingGroup;
          this.MaterialPricingGroupList.sort((a:any, b:any) => { return collator.compare(a.matPriceGrp, b.matPriceGrp) });
        });


      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.masterslist = [];
      //console.log(error);
    });

  }

  plantList: any[] = [];

  getPlantbyId() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, this.currentUser.fkEmpId).then((data: any) => {
      if (data) {
        this.plantList = data;
        let temp = this.plantList.find((x:any)  => x.fkPlantId == this.currentUser.baselocation);

      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
      //console.log(error);
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
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filtermaterialtype = null;
   // this.filterlocation = null;
 this.filterlocation = '';
  // this.filterstatus = null;
  this.filterstatus = '';
    this.filterrequest = null;
    this.selectedLocations = [];
    this.selectedMatTypes = [];
    this.filterMatname = null;

  }
  selCoated(id:any) {
    if (id != '84') {
      this.ItemCodeRequestModel.isCoated = 'NotApplicable';
    }
  }
  clearvalue(value) {
    if (value == 'NotApplicable') {
      this.ItemCodeRequestModel.targetWeightCoated = null;
    }
  }
  materialtype(id:any) {
    let mat_type = this.materialList.find((x:any)  => x.id == id);
    return mat_type ? mat_type.type : "";
  }
  location(id:any) {
    let loc = this.locationList.find((x:any)  => x.id == id);
    return loc ? loc.code : "";
  }

  getAllEntries() {
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
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" + ("00" + fd.getDate()).slice(-2);
      this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
    }

    if (this.to_date == '' || this.to_date == null) {
      formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + ("00" + td.getDate()).slice(-2);
      this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
    }
    else {
      let ed = new Date(this.to_date);
      formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" + ("00" + ed.getDate()).slice(-2);
      this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);
    }

    filterModel.materialType = this.selectedMatTypes.length > 0 ? this.selectedMatTypes.map((x:any)  => x.id).join() : null;;
    filterModel.location = this.selectedLocations.length > 0 ? this.selectedLocations.map((x:any)  => x.id).join() : null;
    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    filterModel.approver = this.currentUser.employeeId;
    filterModel.pageNo = this.pageNo ? this.pageNo : 1;
    this.pageNo = this.pageNo ? this.pageNo : 1;
    filterModel.pageSize = this.pageSize;
    filterModel.name = this.filterMatname;
    filterModel.type = "Request";
    
    this.httpService.post(APIURLS.BR_ITEMCODE_REQUEST_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.ItemCodeRequestFilter = data;
        this.totalCount = data[0].totalCount;
        this.totalPages = data[0].totalPages;
        this.ItemCodeRequestFilter.reverse();
      }

      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.ItemCodeRequestFilter = [];
      //console.log(error);
    });
  }
  
  continue: boolean = false;
  getSearchResult() {
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
    filterModel.materialType = this.ItemCodeRequestModel.materialTypeId;
    filterModel.status = 'Completed';
    this.filterlocation = this.currentUser.baselocation.toString();
    filterModel.name = this.ItemCodeRequestModel.materialShortName;
    filterModel.type = "Search";
    // filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    // filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_ITEMCODE_REQUEST_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.ItemCodeRequestFilter1 = data;
        this.ItemCodeRequestFilter1.reverse();
      }
      this.continue = true;
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.ItemCodeRequestFilter1 = [];
      //console.log(error);
    });


  }
  storageconditionlist: StorageCondition[] = [];
  tempconditionlist: TempCondition[] = [];
  PackSizelist: PackSize[] = [];
  packTypelist: any[] = [];
  Divisionlist: any[] = [];
  Brandlist: any[] = [];
  Strengthlist: any[] = [];
  departmentList: any[] = [];
  countrylist: Country[] = [];
  DmfGradelist: DmfGrade[] = [];
  DmfGradelist1: DmfGrade[] = [];
  purchasegrouplist: PurchaseGroup[] = [];
  processlist: ProcessMaster[] = [];
  materialgroupList: MaterialGroup[] = [];
  materialList: MaterialType[] = [];
  materialList1: MaterialType[] = [];
  uomMasterList: UOM[] = [];
  storagelocationlist: StorageLocation[] = [];
  storagelocationlist1: StorageLocation[] = [];
  ValuationClasslist: ValuationClass[] = [];
  ValuationClasslist1: ValuationClass[] = [];
  pharmagradelist: PharmaGrade[] = [];
  TherapeuticSegmentlist: any[] = [];
  GenericNamelist: any[] = [];
  PackageMaterialGroup: any[] = [];

  getLocationName(id:any) {
    let t = this.locationList.find((s:any) => s.id == id);
    return t.code + ' - ' + t.name;
  }


  getloc(loc:any) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }

  storeData: any;
  jsonData: any;
  fileUploaded!: File;
  worksheet: any;

  uploadedFile(event) {
    this.fileUploaded = event.target.files[0];
    this.readExcel();

  }
  reset() {
    console.log(this.myInputVariable.nativeElement.files);

    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }

    console.log(this.myInputVariable.nativeElement.files);
  }
  ItemCodeRequestList: any[] = [];
  getItemCodeRequestsList() {
    this.httpService.getById(APIURLS.BR_ITEMCODE_REQUEST_GETBY_ID_API, this.currentUser.baselocation).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.ItemCodeRequestList = data;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.ItemCodeRequestList = [];
      //console.log(error);
    });
  }
  validate(value) {
    let temp = this.ItemCodeRequestList.find((x:any)  => x.materialShortName == value.materialShortName && x.materialTypeId == value.materialTypeId);
    if (temp != null || temp != undefined) {
      swal({
        title: "Message",
        text: "Entered Material Name " + (temp.materialShortName) + " already Exists.Please enter another.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    }

  }
  uploadExcel() {
    this.requests.forEach((ele) => {
      let requests = {} as ItemCodeRequest;
      requests.requestDate = new Date().toLocaleString();
      requests = ele;
      //this.validate(ele);
      //requests.reasonForrequisition         
      requests.createdBy = this.currentUser.employeeId;
      requests.materialTypeId = ele.materialTypeId == undefined ? '' : this.materialList.find((x:any)  => x.type.toLowerCase() == ele.materialTypeId.toLowerCase()).id.toString();
      //this.validate(requests);
      requests.locationId = ele.locationId == undefined ? '' : this.locationList.find((x:any)  => x.code == ele.locationId).id;
      requests.materialGroupId = ele.MaterialGroup == undefined ? '' : this.materialgroupList.find((x:any)  => x.stxt.toLowerCase() == ele.MaterialGroup.toLowerCase()).id.toString();
      requests.tempCondition = ele.TempCond == undefined ? '' : this.tempconditionlist.find((x:any)  => x.tempConDesc == ele.TempCond).tempConId;
      requests.storageCondition = ele.storageCond == undefined ? '' : this.storageconditionlist.find((x:any)  => x.stxt.toLowerCase() == ele.storageCond.toLowerCase()).id.toString();
      requests.domesticOrExports = ele.ExportorDomestic == undefined ? '' : ele.ExportorDomestic.toUpperCase() == 'DOMESTIC' ? 'D' : 'E';
      requests.isDmfMaterial = ele.isMaterialof == undefined ? '' : ele.isMaterialof.toUpperCase() == 'DMF' ? '1' : '0';
      requests.isVendorSpecificMaterial = ele.SupplierOrManufactureSiteSpecific == undefined ? '' : ele.SupplierOrManufactureSiteSpecific.toUpperCase() == 'YES' ? '1' : '0';
      requests.dmfGradeId = ele.dmfGrade == undefined ? 0 : +this.DmfGradelist.find((x:any)  => x.dmfGradeDesc.toLowerCase() == ele.dmfGrade.toLowerCase()).dmfGradeId;
      requests.isArtworkRevision = ele.isArtworkRevision == undefined ? '' : ele.isArtworkRevision.toUpperCase() == 'YES' ? '1' : '0';
      requests.market = ele.market == undefined ? '' : ele.market.toUpperCase() == 'DOMESTIC' ? 'D' : 'E';;
      requests.dutyElement = ele.dutyElement == undefined ? '' : '1';
      requests.createdDate = new Date().toLocaleString();
      requests.approveType = "Created";
      requests.requestDate = new Date().toLocaleString();
      requests.expVendordetails = [];
      this.itemcoderequestlist.push(requests);
    });

    //this.jsonData = JSON.stringify(this.jsonData);  
    // console.log(this.jsonData);
    this.ItemCodeRequestModel.requests = this.itemcoderequestlist;
    let connection = this.httpService.post(APIURLS.BR_PUT_MULTIPLE_REQUESTS_API, this.ItemCodeRequestModel);
    connection.then((req)=>{
      if(req.length>0)
      {
        swal({
          title: "Message",
          text: "Excel uploaded successfully with request numbers : " + req,
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
      }
    })
    this.fileUploaded = null;
    this.reset();
    this.getAllEntries();
  }
  itemcoderequestlist: any[] = [];
  requests: any[] = [];
  readExcel() {
    let connection: any;
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
      this.requests = this.jsonData;

    }
    readFile.readAsArrayBuffer(this.fileUploaded);
  }

  downloadfile() {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = 'assets/file';
    link.download = '../assets/file.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  serializer!: boolean;
  serializerid!: boolean;
  Aprlpriority!: number;

  AllApproversList: WorkFlowApprovers[] = [];
  loc!: boolean;
  GetAllApprovers() {
    this.loc = false;
    this.httpService.get(APIURLS.BR_MASTER_APPROVERS_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.AllApproversList = data.filter((x:any)  => x.isActive);
        let id = this.currentUser.employeeId;
        let user = this.AllApproversList.find((x:any)  => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);
        if (user != null || user != undefined) {
          this.loc = true;
        }
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.AllApproversList = [];
      //console.log(error);
    });
  }

  getApproversList(value:any) {

    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.creatorid = false;
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
    this.KeyValue = keyvalue;
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);   
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        this.Approverslist = this.Approverslist.filter((x:any)  => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;
        if (mat.type == 'FG') {
          let temp = this.Approverslist.find((x:any)  => x.role == 'Creator');
          let temp1 = this.Approverslist.find((x:any)  => x.priority == temp.priority - 1);
          if (temp1.approverId == empid || temp1.parllelApprover1 == empid || temp1.parllelApprover2 == empid ||
            temp1.parllelApprover3 == empid || temp1.parllelApprover4 == empid) {
            this.serializer = true;
            this.serializerid = true;
          }
        }
        if (this.ItemCodeRequestModel.requestNo != null || this.ItemCodeRequestModel.requestNo != null) {
          let Appr1 = this.Approverslist.find((x:any)  => x.priority == 1 && (x.approverId == empid ||
            x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
            x.parllelApprover3 == empid || x.parllelApprover4 == empid) && (x.role != 'Creator'));

          if (Appr1 != null || Appr1 != undefined) {
            this.Approverid1 = Appr1.approverId;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = Appr1.priority;
          }
          let Appr2 = this.Approverslist.find((x:any)  => x.priority == 2 && (x.approverId == empid ||
            x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
            x.parllelApprover3 == empid || x.parllelApprover4 == empid) && x.role != 'Creator');
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
      //console.log(error);
    });
  }

  dynamicArray: any = [];
  newDynamic: any = {};
  rowcount: number = 0;
  addRows() {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = {
      id: this.rowcount, reqNo: null, aun: "", packLevel: "", quantity: "",
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


  dynamicArrayB: any = [];
  newDynamicB: any = {};
  rowcountB: number = 0;
  addRowsB() {
    this.rowcountB = this.rowcountB + 1;
    this.newDynamicB = {
      id: this.rowcountB, requestNo: "", excepientsDetails: "", vendorDetails: "", stored: "0"
    };
    this.dynamicArrayB.push(this.newDynamicB);
  }
  removeRowsB(item) {
    if (this.dynamicArrayB.length > 0) {
      const index = this.dynamicArrayB.indexOf(item);
      this.dynamicArrayB.splice(index, 1);
    }
  }


  changevalue(value) {
    if (value == 'Plain Material') {
      this.ItemCodeRequestModel.isArtworkRevision = undefined;
      this.ItemCodeRequestModel.artworkNo = null;
      this.ItemCodeRequestModel.artWorkValidity = null;
    }
  }
  changespecifValue(value) {
    if (value != 'Y' || value != '1') {
      this.ItemCodeRequestModel.specificationNo = null;
    }
  }
  changetextvalue(event) {
    if (event.value == 'Y' || event.value == '1') {
      this.ItemCodeRequestModel.requiredDmf = null;
    }
    else {
      this.ItemCodeRequestModel.availableDmf = null;
    }
  }
  ChangeVendorValue(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.newLegacyCode = null;
    }
    else {
      this.ItemCodeRequestModel.existLegacyCode = null;
    }
  }
  changeAPIvalue(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.itemCodeExisting = null;
    }
    else {
      this.ItemCodeRequestModel.itemCodeProposed = null;
    }
  }
  changePM(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.immediatePackMat = null;
    }
  }
  changeMF(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.manufacturingFormula = null;
    }
  }
  changeTS(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.testingSpecification = null;
    }
  }
  changePD(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.punchesOrDies = null;
    }
  }
  changeMC(event) {
    if (event.value == 'Y') {
      this.ItemCodeRequestModel.marketCustCount = null;
    }
  }
  currentUser!: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
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
      this.files.push(files[i]);
    }
    this.validateAttcahment();
    this.reset();
  }
  Addfile1: File;
  Addfile2: File;
  Addfile3: File;
  Addfile4: File;
  Addfileslist: any[] = [];
  errMsg2 = "";

  appArtAttachment: string
  colArtAttachment: string
  diaAttachment: string
  shadeCardAttachment: string

  handleFileInput1(files: FileList) {
    this.errMsg2 = "";
    //this.File = files[0]; 
    //this.files=[];
    this.Addfile1 = files[0];
    //this.Addfileslist.push(files[0].name)
    this.appArtAttachment = files[0].name;
    // this.errMsg2='File Uploaded Successfully'
    files = null;
    // this.validateAttcahment();
    this.myInputVariable1.nativeElement.value = "";
  }
  handleFileInput2(files: FileList) {
    this.errMsg2 = "";
    //this.File = files[0]; 
    //this.files=[];
    this.Addfile2 = files[0];
    // this.Addfileslist.push(files[0].name)
    this.colArtAttachment = files[0].name;
    // this.errMsg2='File Uploaded Successfully'
    files = null;
    // this.validateAttcahment();
    this.myInputVariable2.nativeElement.value = "";
  }
  handleFileInput3(files: FileList) {
    this.errMsg2 = "";
    //this.File = files[0]; 
    //this.files=[];
    this.Addfile3 = files[0];
    //this.Addfileslist.push(files[0].name)
    this.diaAttachment = files[0].name;
    // this.errMsg2='File Uploaded Successfully'
    files = null;
    // this.validateAttcahment();
    this.myInputVariable3.nativeElement.value = "";
  }
  handleFileInput4(files: FileList) {
    this.errMsg2 = "";
    //this.File = files[0]; 
    //this.files=[];
    this.Addfile4 = files[0];
    //this.Addfileslist.push(files[0].name)
    this.shadeCardAttachment = files[0].name;
    // this.errMsg2='File Uploaded Successfully'
    files = null;
    // this.validateAttcahment();
    this.myInputVariable4.nativeElement.value = "";
  }

  getTempcond(id:any) {
    let temp = this.tempconditionlist.find((x:any)  => x.tempConId == id);
    return temp ? temp.tempConDesc : '';
  }

  ReadAsBase64(file:any): Promise<any> {
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
  id: string
  uploadfile() {
    console.log("Uploading file");
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    this.fileslist1.push(this.Addfile1);
    this.fileslist1.push(this.Addfile2);
    this.fileslist1.push(this.Addfile3);
    this.fileslist1.push(this.Addfile4);
    for (var i = 0; i < this.fileslist1.length; i++) {
      this.formData.append('files', this.fileslist1[i]);
    }
    // let filepath='';
    // let mat=this.materialList.find(x=>x.id == +this.ItemCodeRequestModel.materialTypeId).type;
    // if(mat=='RM')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/Raw Materials Files/UploadFiles/'
    // }
    // else if(mat=='PM')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/PackageMaterial Files/UploadFiles/'
    // }
    // else if(mat=='BULK')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/BulkMaterial Files/UploadFiles/'
    // }
    // else if(mat=='FG')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/FG Materials Files/UploadFiles/'
    // }
    // if(mat=='LC')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/LC Files/UploadFiles/'
    // }
    // if(mat=='PPC')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/PPC Files/UploadFiles/'
    // }
    // if(mat=='OSE')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/OSE Files/UploadFiles/'
    // }
    let connection: any;
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log(data);
        //this.imageFlag = true;
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error uploading file: ' + error;
      //console.log(error);
    });

  }
  resetForm() {
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.comments = null;
    this.ItemCodeRequestModel.materialTypeId = this.matType;
  }
  OnClickback() {
    this.resetForm();
    jQuery("#searchModal").modal('show');
  }
  gettransactions(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter((x:any)  => x.approvalPriority != null && x.processType == 'Item Code Request');
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionslist = [];
      //console.log(error);
    });

  }
  onClickNewRequest() {
    this.resetForm();
    this.continue = false;
    this.materialgroupList = this.materialgroupList.filter((x:any)  => x.stxt != null);
    let temp = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation)
    if (temp.plantType != 0) {
      this.materialList1 = this.materialList.filter((x:any)  => x.type == 'RM' || x.type == 'PM' || x.type == 'BULK');
    }
    else {
      this.materialList1 = this.materialList;
    }
    this.ItemCodeRequestFilter1 = [];
    //this.ItemCodeRequestModel = Object.assign({},ItemCodeRequest) ;  
    jQuery("#searchModal").modal('show');

  }
  fileslist: any[] = [];
  fileslist1: File[] = [];
  validateAttcahment() {
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
    this.ReadAsBase64(this.File)
      .then(result => {
        this.fileToUpload = result;
      })
      .catch(err => this.errMsg1 = err);
  }
  clearfiles() {
    this.appArtAttachment = null;
    this.colArtAttachment = null;
    this.diaAttachment = null;
    this.shadeCardAttachment = null;
    this.Addfile1 = null;
    this.Addfile2 = null;
    this.Addfile3 = null;
    this.Addfile4 = null;
  }
  changesremainingfieldvalue(event) {
    if (event.value == 'N') {
      this.ItemCodeRequestModel.matchSpecification = 'A';
      this.ItemCodeRequestModel.existDmfno = 'A';
      this.ItemCodeRequestModel.specificationAdditionalTest = 'A';
      this.ItemCodeRequestModel.itemspecificVendor = 'A';
      this.ItemCodeRequestModel.vendorReqMatch = 'A';
      this.ItemCodeRequestModel.itemFromMultipleVendors = 'A';
      this.ItemCodeRequestModel.itemAvailable = '2';
    }
    else {
      this.ItemCodeRequestModel.matchSpecification = null;
      this.ItemCodeRequestModel.existDmfno = null;
      this.ItemCodeRequestModel.specificationAdditionalTest = null;
      this.ItemCodeRequestModel.itemspecificVendor = null;
      this.ItemCodeRequestModel.vendorReqMatch = null;
      this.ItemCodeRequestModel.itemFromMultipleVendors = null;
      this.ItemCodeRequestModel.itemAvailable = null;

    }
  }
  ClearStorageother() {
    this.ItemCodeRequestModel.storageCondition_other = null;

  }
  ClearTempother() {
    this.ItemCodeRequestModel.tempCondition_other = null;
  }
  nongxplocation: string
  empId: string
  view: boolean = false;
  IsPrint!: boolean;
  locationName: string
  attachments: any[] = [];
  matType: any;
  onUserActions(isedit: boolean, ItemCodeRequest: ItemCodeRequest, isprint: boolean, view) {
    this.isEdit = isedit;
    this.IsPrint = isprint;
    // this.resetForm();
    this.continue = false;
    this.errMsg1 = "";
    this.clearfiles();
    this.files = [];
    this.fileslist = [];
    this.fileslist1 = [];
    this.Approverslist = [];
    this.dynamicArray = [];
    this.dynamicArrayB = [];
    this.transactionslist = [];
    this.view = false;
    this.comments = null;
    this.attachments = [];
    this.serializationdatalist = [];
    // this.reset();
    this.isLoadingPop = false;
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    // this.gettransactions(ItemCodeRequest.requestNo);
    this.getHistory(ItemCodeRequest.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    this.DmfGradelist1 = this.DmfGradelist;
    if (isedit) {
      // this.getApproversList(ItemCodeRequest);
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
        ItemCodeRequest.qualitycomplyspecification = ItemCodeRequest.qualitycomplyspecification == undefined ? '' : ItemCodeRequest.qualitycomplyspecification.trim();
        this.dynamicArrayB = ItemCodeRequest.expVendordetails
      }
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      this.appArtAttachment = this.ItemCodeRequestModel.appArtAttachment;
      this.colArtAttachment = this.ItemCodeRequestModel.colArtAttachment;
      this.diaAttachment = this.ItemCodeRequestModel.diaAttachment;
      this.shadeCardAttachment = this.ItemCodeRequestModel.shadeCardAttachment;
      this.empId = this.ItemCodeRequestModel.createdBy;


    }

    else {
      if (view == 'Copy') {
        ItemCodeRequest.attachements = null;
        ItemCodeRequest.modifiedBy = null;
        ItemCodeRequest.modifiedDate = null;
        ItemCodeRequest.approveType = null;
        ItemCodeRequest.appArtAttachment = null;
        ItemCodeRequest.colArtAttachment = null;
        ItemCodeRequest.diaAttachment = null;
        ItemCodeRequest.shadeCardAttachment = null;
        this.cleardata(ItemCodeRequest);
        ItemCodeRequest.locationId = ItemCodeRequest.locationId.toString();
      }
      else {
        ItemCodeRequest.locationId = this.currentUser.baselocation.toString();
      }
      if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
        ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
      }
      //this.ItemCodeRequestModel.locationId = this.currentUser.baselocation.toString();


      let type = this.materialList.find((x:any)  => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.ValuationClasslist1 = this.ValuationClasslist.filter((x:any)  => x.matType == type.type);
      this.storagelocationlist1 = this.storagelocationlist.filter((x:any)  => x.matType == type.type);
      //this.ValuationClasslist=this.ValuationClasslist.filter((x:any)=>x.matType==type.type);
      this.getApproversList(ItemCodeRequest);
      if (ItemCodeRequest.attachements != null || ItemCodeRequest.attachements != undefined) {
        this.attachments = ItemCodeRequest.attachements.split(',');
      }
      this.matType = ItemCodeRequest.materialTypeId;
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      this.appArtAttachment = this.ItemCodeRequestModel.appArtAttachment;
      this.colArtAttachment = this.ItemCodeRequestModel.colArtAttachment;
      this.diaAttachment = this.ItemCodeRequestModel.diaAttachment;
      this.shadeCardAttachment = this.ItemCodeRequestModel.shadeCardAttachment;
      var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
      if (name == 'FG') {
        this.newDynamic = {
          id: this.rowcount, reqNo: null, aun: "", packLevel: "", quantity: "",
          gtin: null, nationalCode: null, nCodeT: null, stored: "0"
        };
        this.dynamicArray.push(this.newDynamic);
        this.getserializationdetails(ItemCodeRequest.requestNo);
      }
      // this.newDynamicB = {  id: this.rowcount, requestNo: null, excepientsDetails: "", vendorDetails: "", stored: "0" };
      // this.dynamicArrayB.push(this.newDynamicB);
    }
    if (view == 'View') {
      this.isLoadingPop = false;
      this.Approver1 = true;
      this.Approver2 = true;
      this.Creator = true;
      this.serializer = true;
      this.view = true;
    }


    if (isprint) {
      this.isLoadingPop = false;
      this.printModal();
    }
    else {
      jQuery("#searchModal").modal('hide');
      let name = this.materialList.find((x:any)  => x.id == +ItemCodeRequest.materialTypeId).type;
      let id = this.currentUser.employeeId;
      let locid: any;
      let user = this.AllApproversList.find((x:any)  => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);
      if (user != null || user != undefined) {
        locid = this.locationList.find((x:any)  => x.id == +ItemCodeRequest.locationId);
      }
      else {
        locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
      }
      var modal = '#' + name + 'NGXPModal';
      jQuery(modal).modal('show');
    }
  }
  // createentry()
  // {
  //   jQuery("#searchModal").modal('hide');
  //   jQuery("#myModal").modal('show');
  // }

  removefile(name:any) {
    const index = this.fileslist.indexOf(name);
    this.fileslist.splice(index, 1);
  }

  removefile1(name) {
    this.appArtAttachment = null;
    this.Addfile1 = null;
  }
  removefile2(name) {
    this.colArtAttachment = null;
    this.Addfile2 = null;
  }

  removefile3(name) {
    this.diaAttachment = null;
    this.Addfile3 = null;
  }
  removefile4(name) {
    this.shadeCardAttachment = null;
    this.Addfile4 = null;
  }

  isValid: boolean = false;
  validatedForm: boolean = true;

  onSaveEntry(status:any) {
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
    else {
      if (!this.isEdit) {
        this.ItemCodeRequestModel.id = 0;
        this.ItemCodeRequestModel.requestNo = null;
        this.ItemCodeRequestModel.modifiedBy = null;
        this.ItemCodeRequestModel.modifiedDate = null;
        this.ItemCodeRequestModel.lastApprover = null;
        this.ItemCodeRequestModel.sapCodeNo = null;
        this.ItemCodeRequestModel.sapCodeExists = null;
        this.ItemCodeRequestModel.sapCreationDate = null;
        this.ItemCodeRequestModel.sapCreatedBy = null;
        this.ItemCodeRequestModel.requestedBy = this.currentUser.employeeId;
        this.ItemCodeRequestModel.createdBy = this.currentUser.employeeId;
        //this.ItemCodeRequestModel.requestDate = new Date().toLocaleString();
        // this.ItemCodeRequestModel.createdDate = new Date().toLocaleString();
        let filepath = '';
        let mat = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        // if(mat=='RM')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/Raw Materials Files/UploadFiles/'
        // }
        // else if(mat=='PM')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/PackageMaterial Files/UploadFiles/'
        // }
        // else if(mat=='BULK')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/BulkMaterial Files/UploadFiles/'
        // }
        // else if(mat=='FG')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/FG Materials Files/UploadFiles/'
        // }
        // if(mat=='LC')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/LC Files/UploadFiles/'
        // }
        // if(mat=='PPC')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/PPC Files/UploadFiles/'
        // }
        // if(mat=='OSE')
        // {
        //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/OSE Files/UploadFiles/'
        // }
        if (this.files != null || this.files != undefined) {
          if (this.fileslist != null || this.fileslist != undefined) {
            // let file:any='';           
            let file: any = this.fileslist[0];
            for (let i = 1; i < this.fileslist.length; i++) {
              file = this.fileslist[i] + ',' + file;
            }
            this.ItemCodeRequestModel.attachements = file;
          }
        }
        this.ItemCodeRequestModel.approveType = status == "Submit" ? "Submitted" : "Created";
        var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        if (name == 'FG' && this.dynamicArray.length > 0) {
          this.dynamicArray.forEach((mtrl:any) => {
            let serializedata = {} as Serialization;
            serializedata.aun = mtrl.aun;
            serializedata.packLevel = mtrl.packLevel;
            serializedata.quantity = mtrl.quantity;
            serializedata.gtin = mtrl.gtin;
            serializedata.nationalCode = mtrl.nationalCode;
            serializedata.nCodeT = mtrl.nCodeT;
            serializedata.createdBy = this.currentUser.employeeId;
            //  serializedata.lastModifiedBy = new Date().toLocaleString();
            this.serializationdatalist.push(serializedata);

          });
        }
        // var Barray:any[]=[];
        // if(this.dynamicArrayB.length>0)
        // {
        //   this.dynamicArrayB.forEach((element:any)=> {

        //     let newDynamicB = {  id: this.rowcount, requestNo: null, excepientsDetails: "", vendorDetails: "", stored: "0" };
        //     newDynamicB.excepientsDetails=element.excepientsDetails;
        //     newDynamicB.vendorDetails=element.vendorDetails;
        //     Barray.push(newDynamicB);
        //   });

        // }    
        if (this.ItemCodeRequestModel.artWorkValidity != null || this.ItemCodeRequestModel.artWorkValidity != undefined) {
          this.ItemCodeRequestModel.artWorkValidity = this.getDateFormate(this.ItemCodeRequestModel.artWorkValidity);
        }
        this.comments = this.ItemCodeRequestModel.reasonForrequisition;
        this.ItemCodeRequestModel.expVendordetails = this.dynamicArrayB;
        this.ItemCodeRequestModel.globalSerializationViewModel = this.serializationdatalist;
        this.ItemCodeRequestModel.appArtAttachment = this.appArtAttachment;
        this.ItemCodeRequestModel.colArtAttachment = this.colArtAttachment;
        this.ItemCodeRequestModel.diaAttachment = this.diaAttachment;
        this.ItemCodeRequestModel.shadeCardAttachment = this.shadeCardAttachment;
        this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == 1).approverId;
        connection = this.httpService.post(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = true;
        if (data == 200 || data.id > 0) {
          var name = this.materialList.find((x:any)  => x.id == +data.materialTypeId).type;
          let id = this.currentUser.employeeId;
          let locid: any;
          let user = this.AllApproversList.find((x:any)  => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);
          if (user != null || user != undefined) {
            locid = this.locationList.find((x:any)  => x.id == +data.locationId);
          }
          else {
            locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
          }
          if (locid.plantType == 0) {
            var modal = '#' + name + 'NGXPModal';
            jQuery(modal).modal('hide');
          }
          else {
            var modal = '#' + name + 'Modal';
            jQuery(modal).modal('hide');
          }
          // jQuery("#myModal").modal('hide');
          this.RequestNo = data.requestNo;
          this.errMsgPop1 = status == 'Save' ? 'Request ' + data.requestNo + ' saved successfully!' : 'Request ' + data.requestNo + ' Submitted Successfully!';
          jQuery("#saveModal").modal('show');
          this.id = data.id;
          this.uploadfile();
          if (status == 'Submit') {
            this.InsertHistory();
            this.sendPendingMail("Pending", data)
          }
          this.getAllEntries();
          this.reset();
        }
        this.isLoadingPop = false;
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request: ' + error;
        //console.log(error);
      });
    }

  }

  onSubmitEntry(ItemCodeRequest: ItemCodeRequest) {
    // this.gettransactions(ItemCodeRequest.requestNo);
    //this.getApproversList(ItemCodeRequest);
    console.log("Creating entry");
    console.log(this.Approverslist);

    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
    this.errMsg = "";
    let connection: any;

    if (this.ItemCodeRequestModel.modifiedDate != null || this.ItemCodeRequestModel.modifiedDate != undefined) {
      this.ItemCodeRequestModel.approveType = "ReSubmitted";
    }
    else {
      this.ItemCodeRequestModel.approveType = "Submitted";
    }
    if (this.fileslist != null || this.fileslist != undefined) {
      for (let i = 0; i < this.fileslist.length; i++) {
        this.ItemCodeRequestModel.attachements = this.ItemCodeRequestModel.attachements + ',' + this.fileslist[i];
      }
    }

    this.ItemCodeRequestModel.appArtAttachment = this.appArtAttachment;
    this.ItemCodeRequestModel.colArtAttachment = this.colArtAttachment;
    this.ItemCodeRequestModel.diaAttachment = this.diaAttachment;
    this.ItemCodeRequestModel.shadeCardAttachment = this.shadeCardAttachment;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    this.comments = this.ItemCodeRequestModel.reasonForrequisition;
    this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == 1).approverId;
    this.ItemCodeRequestModel.approvers = this.Approverslist;
    console.log(this.ItemCodeRequestModel);

    connection = this.httpService.put(APIURLS.BR_ITEMCODEREQUEST_CREATESAVEDENTRY, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;

      if (data == 200 || data.id > 0) {
        var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let id = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find((x:any)  => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);

        if (user != null || user != undefined) {
          locid = this.locationList.find((x:any)  => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
        }

        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }

        // jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request ' + this.ItemCodeRequestModel.requestNo + ' Submitted Successfully!';

        jQuery("#saveModal").modal('show');

        this.id = this.ItemCodeRequestModel.id.toString();

        this.uploadfile();
        // this.Updatetransactions(this.ItemCodeRequestModel, 0);
        this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        this.getAllEntries();
        this.reset();
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request: ' + this.ItemCodeRequestModel.requestNo + ": " + error;
      //console.log(error);
    });
  }
  priority!: number;
  serializationdatalist: Serialization[] = [];
  Role: any;
  onreview(status:any) {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;
    if (status == "Rejected") {
      let user = this.Approverslist.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.ItemCodeRequestModel.pendingApprover = '';
     // this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
    }
    else {
      let user = this.transactionsHistory.find((x:any)  => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);
      this.Role = user.role;
      this.ItemCodeRequestModel.pendingApprover = this.transactionsHistory.find((x:any)  => x.approvalPriority == user.approvalPriority + 1).doneBy;
    }

    var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
    if (name == 'FG' && this.dynamicArray.length > 0) {
      this.dynamicArray.forEach((mtrl:any) => {
        let serializedata = {} as Serialization;
        serializedata.id = mtrl.id;
        serializedata.aun = mtrl.aun;
        serializedata.packLevel = mtrl.packLevel;
        serializedata.quantity = mtrl.quantity;
        serializedata.gtin = mtrl.gtin;
        serializedata.nationalCode = mtrl.nationalCode;
        serializedata.nCodeT = mtrl.nCodeT;
        serializedata.lastModifiedBy = this.currentUser.employeeId;
        //serializedata.lastModifiedOn = new Date().toLocaleString();
        this.serializationdatalist.push(serializedata);

      });
    }
    this.ItemCodeRequestModel.globalSerializationViewModel = this.serializationdatalist;
    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    //this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeRequestModel.approveType = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find((x:any)  => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');  

        //var role=this.Approverslist.find(x=>x.role=='Approver')
        if (this.Role == "Approver") {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeRequestModel.requestNo + '' + status + " Successfully!" : "Request " + this.ItemCodeRequestModel.requestNo + " Approved Successfully!";
        }
        else {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeRequestModel.requestNo + '' + status + " Successfully!" : "Request " + this.ItemCodeRequestModel.requestNo + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
          this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        }
        this.sendMail(status, this.ItemCodeRequestModel)
        this.Updatetransactions(this.ItemCodeRequestModel, id)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request " + this.ItemCodeRequestModel.requestNo + ": " + error : "Error Reviewing Request " + this.ItemCodeRequestModel.requestNo + ": " + error;
      //console.log(error);
    });
  }

 onRevertRequest(status:any) {
    this.errMsg = "";
    let connection: any;
    if (status == "ReverttoInitiator") {
      let usid = this.currentUser.employeeId;
      let user = this.transactionsHistory.find((x:any)  => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
        || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

      this.ItemCodeRequestModel.pendingApprover = this.transactionsHistory.find((x:any)  => x.approvalPriority == 1).doneBy;
      this.ItemCodeRequestModel.approveType = "Reverted to initiator";
    //  this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
    }
    else {
      let uid = this.currentUser.employeeId;
      let user = this.transactionsHistory.find((x:any)  => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);
      this.Role = user.role;
      this.ItemCodeRequestModel.pendingApprover = this.transactionsHistory.find((x:any)  => x.approvalPriority == user.approvalPriority + 1).doneBy;
      this.ItemCodeRequestModel.approveType = "Reverted";
    }

    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    //this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find((x:any)  => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');      
        this.errMsgPop1 = "Request " + this.ItemCodeRequestModel.requestNo + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        this.sendMail(status, this.ItemCodeRequestModel)
        if (this.ItemCodeRequestModel.approveType != "Reverted to initiator") {
          this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        }
        this.Updatetransactions(this.ItemCodeRequestModel, id)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request " + this.ItemCodeRequestModel.requestNo + ": " + error;
      //console.log(error);
    });
  }

  onCreate() {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;

    let temp = this.transactionsHistory.find((x:any)  => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
      || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

    if (temp != null || temp != undefined) {

      let appr = this.transactionsHistory.find((x:any)  => x.approvalPriority == temp.approvalPriority + 1);
      if (appr != null || appr != undefined) {
        this.ItemCodeRequestModel.pendingApprover = appr.doneBy;
      }
      else {
        this.ItemCodeRequestModel.pendingApprover = 'No';
        this.ItemCodeRequestModel.approveType = 'Completed';
      }
    }
    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    // this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeRequestModel.sapCreatedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;
    this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find((x:any)  => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');     
        this.errMsgPop1 = "Item Code " + this.ItemCodeRequestModel.sapCodeNo + " Created Successfully!";
        jQuery("#saveModal").modal('show');
        this.sendMail('Created', this.ItemCodeRequestModel)
        if (this.ItemCodeRequestModel.pendingApprover != 'No') {
          this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        }
        this.Updatetransactions(this.ItemCodeRequestModel, 1)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Creating Item Code: " + error;
      //console.log(error);
    });

  }

  oncloserequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == 'close') {
      this.ItemCodeRequestModel.sapStatusFlag = 1;
    }
    let uid = this.currentUser.employeeId;
    let user = this.transactionsHistory.find((x:any)  => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
      || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);
    if (status == 'Completed') {

      this.ItemCodeRequestModel.pendingApprover = this.transactionsHistory.find((x:any)  => x.approvalPriority == user.approvalPriority + 1).doneBy;
     // this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
    }
    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    // this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeRequestModel.approveType = 'Completed';
    this.ItemCodeRequestModel.pendingApprover = 'No';
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find((x:any)  => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');     
        this.errMsgPop1 = "Request " + '' + this.ItemCodeRequestModel.requestNo + '' + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.Updatetransactions(this.ItemCodeRequestModel, 1)
        this.sendMail('Created', this.ItemCodeRequestModel)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request " + this.ItemCodeRequestModel.requestNo + ": " + error;
      //console.log(error);
    });
  }
  KeyValue: any;
  Inserttransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    this.transactions.doneBy = this.currentUser.employeeId;
    //this.transactions.doneOn = new Date().toLocaleString();
    this.transactions.requestNo = data.requestNo;
    this.transactions.comments = this.comments;
    this.transactions.keyValue = this.KeyValue;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.processType = "Item Code Request";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

  }

  sendMail(type, ItemCodeRequest: ItemCodeRequest) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODEREQUEST_EMAIL_API, type, ItemCodeRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error in sending mail: ' + error;
      //console.log(error);
    });

  }

  sendPendingMail(type, ItemCodeRequest: ItemCodeRequest) {
    console.log("Sending pending mail");
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODE_PENDING_EMAIL_API, type, ItemCodeRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error in sending mail: ' + error;
      //console.log(error);
    });

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
          // serializedata.lastModifiedOn = new Date().toLocaleString();
          this.dynamicArray.push(serializedata);

        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.Approverslist = [];
      //console.log(error);
    });
  }

  downloadFile(id, value) {

    // console.log(filename);
    if (value.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, id, value).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find((s:any) => s.id == id).name;
        if (data != undefined) {
         // var FileSaver = require('file-saver');
          const imageFile = new File([data], value, { type: 'application/doc' });
          // console.log(imageFile);
      //      FileSaver.saveAs(imageFile);


        }
      }).catch((error)=> {
        this.isLoading = false;
        //console.log(error);
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

  cleardata(ItemCodeRequest) {
    var name = this.materialList.find((x:any)  => x.id == +ItemCodeRequest.materialTypeId).type;
    var loc = this.locationList.find((x:any)  => x.id == ItemCodeRequest.locationId).code;
    if (name == "RM" || name == "PM" && loc == "ML06") {
      ItemCodeRequest.purchaseGroupId = null;
      ItemCodeRequest.hsnCode = null;
      ItemCodeRequest.dutyElement = null;
    }
    ItemCodeRequest.modifiedBy = null;
    ItemCodeRequest.modifiedDate = null;
    ItemCodeRequest.approveType = null;
    ItemCodeRequest.sapCodeExists = null;
    ItemCodeRequest.sapCodeNo = null;
    ItemCodeRequest.sapCreatedBy = null;
    ItemCodeRequest.sapCreationDate = null;
    ItemCodeRequest.itemAvailable = null;
    ItemCodeRequest.specificationNo = null;
    ItemCodeRequest.matchSpecification = null;
    ItemCodeRequest.existDmfno = null;
    ItemCodeRequest.specificationAdditionalTest = null;
    ItemCodeRequest.availableDmf = null;
    ItemCodeRequest.requiredDmf = null;
    ItemCodeRequest.itemFromMultipleVendors = null;
    ItemCodeRequest.itemspecificVendor = null;
    ItemCodeRequest.vendorReqMatch = null;
    ItemCodeRequest.reqMeetVendorReq = null;
    ItemCodeRequest.existLegacyCode = null;
    ItemCodeRequest.newLegacyCode = null;
    ItemCodeRequest.sapCodeExistCore = null;
    ItemCodeRequest.sapCodeCore = null;
    ItemCodeRequest.qualitycomplyspecification = null;
    ItemCodeRequest.itemCodeExisting = null;
    ItemCodeRequest.itemCodeProposed = null;
    ItemCodeRequest.excipientsCheck = null;
    ItemCodeRequest.immediatePackMatCheck = null;
    ItemCodeRequest.manufactMatch = null;
    ItemCodeRequest.punchesOrDiesMatch = null;
    ItemCodeRequest.testingSpecMatch = null;
    ItemCodeRequest.sameMarCustCount = null;
    ItemCodeRequest.productMatch = null;
    ItemCodeRequest.immediatePackMat = null;
    ItemCodeRequest.manufacturingFormula = null;
    ItemCodeRequest.punchesOrDies = null;
    ItemCodeRequest.testingSpecification = null;
    ItemCodeRequest.marketCustCount = null;
    ItemCodeRequest.finishedProductCode = null;

  }

  deletefile(item:any, name:any) {

    if (this.attachments.length > 0) {
      const index = this.attachments.indexOf(name);
      this.attachments.splice(index, 1);
    }
    let attach: any = this.attachments[0];
    for (let i = 1; i < this.attachments.length; i++) {
      attach = this.attachments[i] + ',' + attach;
    }
    item.attachements = attach;
    this.ItemCodeRequestModel.attachements = attach;
    let connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, item.id, item);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        swal({
          title: "Message",
          text: "file deleted successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        })
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleting file: ' + error;
      //console.log(error);
    });
  }
  dmfgrade: any;
  printModal() {
    let name = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
    let ln = this.locationList.find((x:any)  => x.id == this.ItemCodeRequestModel.locationId)
    this.locationName = ln.code + '-' + ln.name;
    this.ItemCodeRequestModel.locationId = this.locationList.find((x:any)  => x.id == this.ItemCodeRequestModel.locationId).code;
    this.ItemCodeRequestModel.materialGroupId = this.materialgroupList.find((x:any)  => x.materialGroupId == this.ItemCodeRequestModel.materialGroupId).ltxt;
    this.dmfgrade = (this.ItemCodeRequestModel.dmfGradeId == null ? null : this.DmfGradelist.find((x:any)  => x.dmfGradeId == this.ItemCodeRequestModel.dmfGradeId.toString()).dmfGradeDesc);
    this.ItemCodeRequestModel.countryId = this.ItemCodeRequestModel.countryId == null ? '' : this.countrylist.find((x:any)  => x.land1 == this.ItemCodeRequestModel.countryId).landx;
    this.ItemCodeRequestModel.tempCondition = this.ItemCodeRequestModel.tempCondition == null ? '' : this.tempconditionlist.find((x:any)  => x.tempConId == this.ItemCodeRequestModel.tempCondition).tempConDesc;
    this.ItemCodeRequestModel.storageCondition = this.ItemCodeRequestModel.storageCondition == null ? '' : this.storageconditionlist.find((x:any)  => x.stoCondCode == this.ItemCodeRequestModel.storageCondition).ltxt;
    this.ItemCodeRequestModel.unitOfMeasId = this.ItemCodeRequestModel.unitOfMeasId == null ? '' : this.uomMasterList.find((x:any)  => x.uom == this.ItemCodeRequestModel.unitOfMeasId).description;
    this.ItemCodeRequestModel.weightUom = this.ItemCodeRequestModel.weightUom == null ? '' : this.uomMasterList.find((x:any)  => x.uom == this.ItemCodeRequestModel.weightUom).description;
    this.ItemCodeRequestModel.salesUnitOfMeasId = this.ItemCodeRequestModel.salesUnitOfMeasId == null ? '' : this.uomMasterList.find((x:any)  => x.uom == this.ItemCodeRequestModel.salesUnitOfMeasId).description;
    this.ItemCodeRequestModel.valuationClass = this.ItemCodeRequestModel.valuationClass == null ? '' : this.ValuationClasslist.find((x:any)  => x.valuationId == this.ItemCodeRequestModel.valuationClass).valuationId + '-' + this.ValuationClasslist.find((x:any)  => x.valuationId == this.ItemCodeRequestModel.valuationClass).valuationDesc;
    // this.ItemCodeRequestModel.purchaseGroupId=this.ItemCodeRequestModel.purchaseGroupId==null?'':this.purchasegrouplist.find(x=>x.purchaseGroupId== this.ItemCodeRequestModel.purchaseGroupId).purchaseGroupDesc;
    this.ItemCodeRequestModel.packingMaterialGroup = this.ItemCodeRequestModel.packingMaterialGroup == null ? '' : this.PackageMaterialGroup.find((x:any)  => x.packingMaterialGroupId == this.ItemCodeRequestModel.packingMaterialGroup).packingMaterialGroupName;
    this.ItemCodeRequestModel.divisionId = this.ItemCodeRequestModel.divisionId == null ? '' : this.Divisionlist.find((x:any)  => x.divCode == this.ItemCodeRequestModel.divisionId).divDesc;
    this.ItemCodeRequestModel.strengthId = this.ItemCodeRequestModel.strengthId == null ? '' : this.Strengthlist.find((x:any)  => x.strengthCode == this.ItemCodeRequestModel.strengthId).strengthDesc;
    this.ItemCodeRequestModel.purposeId = this.ItemCodeRequestModel.purposeId == null ? '' : this.purposelist.find((x:any)  => x.id == this.ItemCodeRequestModel.purposeId).name;
    if (name != 'BULK' && name != 'PPC') {
      this.ItemCodeRequestModel.brandId = this.ItemCodeRequestModel.brandId == null ? '' : this.Brandlist.find((x:any)  => x.brandCode == this.ItemCodeRequestModel.brandId).brandDesc;
    }
    if (name == 'FG') {
      this.ItemCodeRequestModel.serializationType = this.ItemCodeRequestModel.serializationType == null ? '' : this.serializationtypes.find((x:any)  => x.id == this.ItemCodeRequestModel.serializationType).name;
    }
    this.ItemCodeRequestModel.therapeuticSegmentId = this.ItemCodeRequestModel.therapeuticSegmentId == null ? '' : this.TherapeuticSegmentlist.find((x:any)  => x.therSegCode == this.ItemCodeRequestModel.therapeuticSegmentId).therSegDesc;
    this.ItemCodeRequestModel.utilizingDept = this.ItemCodeRequestModel.utilizingDept == null ? '' : this.departmentList.find((x:any)  => x.id == this.ItemCodeRequestModel.utilizingDept).name;


    let uid = this.currentUser.employeeId;
    let locid: any;
    let user = this.AllApproversList.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
    if (user != null || user != undefined) {
      locid = this.locationList.find((x:any)  => x.id == ln.id);
    }
    else {
      locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
    }
    jQuery("#searchModal").modal('hide');
    if (locid.plantType == 0) {
      var modal = '#' + name + 'NprintModal';
      jQuery(modal).modal('show');
    }
    else {
      var modal = '#' + name + 'printModal';
      jQuery(modal).modal('show');
    }
  }
  print(id): void {
    // this.printElement(document.getElementById("print-section"));
    let locid = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
    let printsection: string
    let type = this.materialList.find((x:any)  => x.id == id).type;
    if (locid.plantType == 0) {
      printsection = type + 'Nprint-section';
    }
    else {
      printsection = type + 'print-section';
    }
    let printContents, popupWin;
    printContents = document.getElementById(printsection).innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title>Item Code Request Form</title>
           <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
            <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
          </head>
          <body onload="window.print();window.close()">
          <table class="report-container">
            <thead class="report-header">
           
            </thead>
            <tbody class="report-content">
              <tr>
                <td class="report-content-cell">
                  <div class="main">
                  ${printContents}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="report-header">
            <tr>
            <th class="report-header-cell">
              <div class="header-info">
                Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
              </div>
            </th>
          </tr>
          </tfoot>
          </table>
          </body>
        </html>`
    );
    popupWin.document.close();
  }
  image!: string
  printReason: any;
  printModel: any;

  showprintmodel(data: ItemCodeRequest) {
    this.printReason = null;
    this.printModel = {};
    this.printModel = Object.assign({}, data);
    jQuery("#printReasonModal").modal('show');
  }
  getbase64image() {
    this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
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
  downloadPdf(value) {
    let type = this.materialList.find((x:any)  => x.id == value.materialTypeId).type;
    let locid = this.locationList.find((x:any)  => x.code == value.locationId);
    if (locid.plantType == 0) {
      var modal = '#' + type + 'NprintModal';
      jQuery(modal).modal('hide');
    }
    else {
      var modal = '#' + type + 'printModal';
      jQuery(modal).modal('hide');
    }
    jQuery("#printReasonModal").modal('hide');
    this.InsertPrintLog();

    let printsection: string

    if (locid.plantType == 0) {
      printsection = type + 'Nprint-section';
    }
    else {
      printsection = type + 'print-section';
    }
    // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
    var printContents = document.getElementById(printsection).innerHTML;
    // var temp1=this.locationList.find(x=>x.id==this.currentUser.baselocation);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locid.code + '-' + locid.name;
    //var name=this.requestType.toLocaleUpperCase();
    var ReportName = type + ' Material Request Form';
    var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
    var now = new Date();
    var reason = this.printReason;
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    /*var htmnikhitml = htmlToPdfmake(`<html>
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
    })*/
    var docDefinition = {
      info: {
        title: 'Item code request form',
      },

      content: [
     //   htmnikhitml,
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
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {

          columns: [
            {
              pageMargins: [40, 80, 40, 60],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [60, 410, 60],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    , { text: ReportName, bold: true, fontSize: 14, color: 'black', alignment: 'center', height: '*' }, '']

                ]
              }
            }
          ],
          margin: 20
        }
      },
      footer: function () {
        return {

          columns: [

            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' + ' This document printed electronically through Unnati v2.0 software' },
                { text: 'Reason' + ": " + reason }
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
    //pdfMake.createPdf(docDefinition).open();
  }

  InsertPrintLog() {
    this.errMsg = "";
    let connection: any;
    let model: any = {};
    model.process = "Item Code Request";
    model.printingReason = this.printReason;
    model.printedBy = this.currentUser.employeeId;
    model.printedOn = new Date().toLocaleString();
    model.requestNo = this.ItemCodeRequestModel.requestNo;
    connection = this.httpService.post(APIURLS.BR_PRINT_LOG_INSERT, model);

  }

  keyPressAllowOnlyNumber(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }
  convertOpposite(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57))
      return evt.key.toUpperCase();

    return true;

  }

  notFirst = true;

  checkStorageLocation() {
    if (this.ItemCodeRequestModel.storageLocationId == null || this.ItemCodeRequestModel.storageLocationId == '' || this.ItemCodeRequestModel.storageLocationId == undefined) this.notFirst = false;
  }

  checkMaterialGroup() {
    if (this.ItemCodeRequestModel.materialGroupId == null || this.ItemCodeRequestModel.materialGroupId == '' || this.ItemCodeRequestModel.materialGroupId == undefined) this.notFirst;
  }

  checkUom() {
    if (this.ItemCodeRequestModel.unitOfMeasId == null || this.ItemCodeRequestModel.unitOfMeasId == '' || this.ItemCodeRequestModel.unitOfMeasId == undefined) this.notFirst = false;
  }

  checkDmfGrade() {
    if (this.ItemCodeRequestModel.dmfGradeId == null || this.ItemCodeRequestModel.dmfGradeId == undefined) this.notFirst = false;
  }

  checkCountry() {
    if (this.ItemCodeRequestModel.countryId == null || this.ItemCodeRequestModel.countryId == '' || this.ItemCodeRequestModel.countryId == undefined) this.notFirst = false;
  }

  checkTempCond() {
    if (this.ItemCodeRequestModel.tempCondition == null || this.ItemCodeRequestModel.tempCondition == '' || this.ItemCodeRequestModel.tempCondition == undefined) this.notFirst = false;
  }

  checkStorageCond() {
    if (this.ItemCodeRequestModel.storageCondition == null || this.ItemCodeRequestModel.storageCondition == '' || this.ItemCodeRequestModel.storageCondition == undefined) this.notFirst = false;
  }

  checkPurchaseGroup() {
    if (this.ItemCodeRequestModel.purchaseGroupId == null || this.ItemCodeRequestModel.purchaseGroupId == '' || this.ItemCodeRequestModel.purchaseGroupId == undefined) this.notFirst = false;
  }

  checkMaterialType() {
    if (this.ItemCodeRequestModel.materialTypeId == null || this.ItemCodeRequestModel.materialTypeId == '' || this.ItemCodeRequestModel.materialTypeId == undefined) this.notFirst = false;
  }

  checkLocation() {
    if (this.ItemCodeRequestModel.locationId == null || this.ItemCodeRequestModel.locationId == '' || this.ItemCodeRequestModel.locationId == undefined) this.notFirst = false;
  }

  checkPharmacopGrade() {
    if (this.ItemCodeRequestModel.pharmacopGrade == null || this.ItemCodeRequestModel.pharmacopGrade == '' || this.ItemCodeRequestModel.pharmacopGrade == undefined) this.notFirst = false;
  }

  checkTypeOfMaterial() {
    if (this.ItemCodeRequestModel.typeOfMaterial == null || this.ItemCodeRequestModel.typeOfMaterial == '' || this.ItemCodeRequestModel.typeOfMaterial == undefined) this.notFirst = false;
  }

  checkPackagematGrp() {
    if (this.ItemCodeRequestModel.packingMaterialGroup == null || this.ItemCodeRequestModel.packingMaterialGroup == '' || this.ItemCodeRequestModel.packingMaterialGroup == undefined) this.notFirst = false;
  }

  checkWeightUOM() {
    if (this.ItemCodeRequestModel.weightUom == null || this.ItemCodeRequestModel.weightUom == '' || this.ItemCodeRequestModel.weightUom == undefined) this.notFirst = false;
  }

  checkPackSize() {
    if (this.ItemCodeRequestModel.packSize == null || this.ItemCodeRequestModel.packSize == '' || this.ItemCodeRequestModel.packSize == undefined) this.notFirst = false;
  }

  checkSalesUOM() {
    if (this.ItemCodeRequestModel.salesUnitOfMeasId == null || this.ItemCodeRequestModel.salesUnitOfMeasId == '' || this.ItemCodeRequestModel.salesUnitOfMeasId == undefined) this.notFirst = false;
  }

  checkTherapeuticSeg() {
    if (this.ItemCodeRequestModel.therapeuticSegmentId == null || this.ItemCodeRequestModel.therapeuticSegmentId == '' || this.ItemCodeRequestModel.therapeuticSegmentId == undefined) this.notFirst = false;
  }

  checkBrand() {
    if (this.ItemCodeRequestModel.brandId == null || this.ItemCodeRequestModel.brandId == '' || this.ItemCodeRequestModel.brandId == undefined) this.notFirst = false;
  }

  checkStrength() {
    if (this.ItemCodeRequestModel.strengthId == null || this.ItemCodeRequestModel.strengthId == '' || this.ItemCodeRequestModel == undefined) this.notFirst = false;
  }

  checkGenericName() {
    if (this.ItemCodeRequestModel.genericName == null || this.ItemCodeRequestModel.genericName == '' || this.ItemCodeRequestModel.genericName == undefined) this.notFirst = false;
  }

  checkMaterialPricing() {
    if (this.ItemCodeRequestModel.materialPricing == null || this.ItemCodeRequestModel.materialPricing == '' || this.ItemCodeRequestModel.materialPricing == undefined) this.notFirst = false;
  }

  checkValuationClass() {
    if (this.ItemCodeRequestModel.valuationClass == null || this.ItemCodeRequestModel.valuationClass == '' || this.ItemCodeRequestModel.valuationClass == undefined) this.notFirst = false;
  }

  checkpurchaseGroup() {
    if (this.ItemCodeRequestModel.purchaseGroupId == null || this.ItemCodeRequestModel.purchaseGroupId == '' || this.ItemCodeRequestModel.purchaseGroupId == undefined) this.notFirst = false;
  }

  checkutilizingDept() {
    if (this.ItemCodeRequestModel.utilizingDept == null || this.ItemCodeRequestModel.utilizingDept == '' || this.ItemCodeRequestModel.utilizingDept == undefined) this.notFirst = false;
  }

  checkDivision() {
    if (this.ItemCodeRequestModel.divisionId == null || this.ItemCodeRequestModel == undefined) this.notFirst = false;
  }

  transactionsHistory: any[] = [];
  getHistory(reqNo) {
    console.log("Getting history");
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.httpService.getByParam(APIURLS.GET_SAP_REQUEST_HISTORY, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionsHistory = data;
        console.log(this.transactionsHistory);
        let temp = this.transactionsHistory.find((x:any)  => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
          || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
          x.parallelApprover4 == this.currentUser.employeeId) && x.transactionType == null);
          var mat = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId);
        if (temp) {
          if (temp.approvalPriority == '1') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
          }
          if (temp.approvalPriority == '2') {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
          }
          if (temp.approvalPriority == '3' || temp.approvalPriority == '4' || temp.approvalPriority == '5') {
            this.Approver1 = true;
            this.Approver2 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
          }
          if (temp.role == 'Creator') {
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Creator = true;
          }
          if (mat.type == 'FG') {
            let temp = this.transactionsHistory.find((x:any)  => x.role == 'Creator');
            let temp1 = this.transactionsHistory.find((x:any)  => x.approvalPriority == temp.approvalPriority - 1);
            if (temp1.doneBy == this.currentUser.employeeId || temp1.parallelApprover1 == this.currentUser.employeeId
               || temp1.parallelApprover2 == this.currentUser.employeeId ||
              temp1.parallelApprover3 == this.currentUser.employeeId || temp1.parallelApprover4 == this.currentUser.employeeId) {
              this.serializer = true;
              this.serializerid = true;
            }
          }
          if (temp.role == 'Closure') {
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Creator = true;
            this.Closure = true;
          }
        }
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.transactionsHistory = [];
      //console.log(error);
    });
  }

  RequestNo: any;
  Updatetransactions(data, id) {
    console.log("Updating transactions");
    this.errMsg = "";
    let connection: any;
    let temp = this.transactionsHistory.find((x:any)  => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
      || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
      x.parallelApprover4 == this.currentUser.employeeId) && x.transactionType == null);
    console.log(this.transactionsHistory);
    temp.comments = this.comments;
    temp.doneBy = this.currentUser.employeeId;
    temp.transactionType = id;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, temp.id, temp);
    connection.then((data:any) => {
      if (data == 200) {
        if (id == '4') {
          if (this.isEdit) {
            var loc = this.locationList.find((x:any)  => x.id == this.ItemCodeRequestModel.locationId);
          }
          else {
            var loc = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
          }
          var matType = this.materialList.find((x:any)  => x.id == +this.ItemCodeRequestModel.materialTypeId);
          var keyvalue = loc.code + '~' + matType.type + '~' + this.ItemCodeRequestModel.storageLocationId + ',' + 1;
          this.KeyValue = keyvalue;
          this.RequestNo = this.ItemCodeRequestModel.requestNo;
          this.InsertHistory();
        }
      }
    }).catch((error)=> {
      //console.log(error);
    });

  }

  InsertHistory() {
    console.log("Inserting history");
    this.isLoading = true;
    this.httpService.get(APIURLS.INSERT_SAP_TRANSACION_HISTORY + "/" + this.KeyValue + "/" + this.RequestNo).then((data: any) => {
      if (data) {


      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      //console.log(error);
    });
  }


  isMasterSel: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.ItemCodeRequestFilter.length; i++) {
      this.ItemCodeRequestFilter[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.ItemCodeRequestFilter.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.ItemCodeRequestFilter.length; i++) {
      if (this.ItemCodeRequestFilter[i].isSelected)
        this.checkedlist.push(this.ItemCodeRequestFilter[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  bulkApprove(status) {
    this.errMsg = "";
    let dt: any;
    this.checkedRequestList.forEach((element:any)=> {

      element.approveStatus = status;
      let connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, element.id, element);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          dt = data;
        }
        this.isLoadingPop = false;
        this.getAllEntries();
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error in bulk approval: ' + error;
        //console.log(error);
      });
    });
    if (dt == 200) {
      var req = this.checkedRequestList.map((x:any)  => x.requestNo).join();
      this.errMsgPop1 = "Requests " + req + " approved successfully."
    }
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