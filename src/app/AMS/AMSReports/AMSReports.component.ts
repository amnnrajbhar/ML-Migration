import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { AMSReports } from './AMSReports.model';
//import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
//import * as fs from 'file-saver';
import swal from 'sweetalert';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-AMSReports',
  templateUrl: './AMSReports.component.html',
  styleUrls: ['./AMSReports.component.css'],
})

export class AMSReportsComponent implements OnInit {
@ViewChild('filterForm', { static: false }) filterForm: any;

  searchTerm = new FormControl();
  currentUser!: AuthData;
  public tableWidget: any;
  dashboard: any = {};
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  isSaved: boolean = false;
  catList: any[] = [];
  assStateList: any[] = [];
  locationList: any;
  dashboardcatName: any;
  filterassetState: any;
  filterusageType: any;
  assetList: any[] = [];
  locationAllList: any;
  locListCon: any;
  AMSReports = {} as AMSReports;
  catCode!: any[];
  departmentList: any;
  filterassetType: any;
  filterlocation: any;
  filtertransferType: any;
  filteredModel: any;
  catList1: any[] = [];
  filterlicType: any;
  filtersoftType: any;
  filtersearchText: any;
  filterinput: any;
  filtertype: any;
  sizeList: any[] = [];
  softwareList: any[] = [];
  licenseList: any[] = [];
  monType: any[] = [];
  filtercategory: any;
  filterreporttype: any;
  filtersoftwareType: any;
  filterlicenseType: any;
  appDet: any[] = [];
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 60);
  to_date: any = this.today;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe, private route: ActivatedRoute) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }


  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.pageNo = 1;
    this.pageSize = 10;
    this.getCatList();
    this.getAssetStateList();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getSoftType();
    this.getLicType();
    this.getDepartList();
    this.getbase64image();
    this.getSizeList();
    this.getMonType();
  }

  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  dropdownList1 = [];
  selectedItems1 = [];
  dropdownSettings1 = {
    singleSelection: false,
    idField: 'code',
    textField: 'location',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
  };

  onItemSelectM1(item: any) {
  }

  notFirst1 = true;
  rmnotFirst1 = true;
  checkStatus1() {
    if (this.locationList.length <= 0) this.notFirst1 = false;
  }
  checkStatusRep1() {
    if (this.locationList.length <= 0) this.rmnotFirst1 = false;
  }

  isEmpty1(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll1() {
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
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

  getCatList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_CAT_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.catList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.catList.sort((a:any, b:any) => { return collator.compare(a.name, b.name) });
        this.catList1 = this.catList.filter((item, i, arr) => arr.findIndex((t) => t.catCode === item.catCode) === i);
      }
    }).catch((error)=> {
      this.catList = [];
    });
  }
  
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'catCode',
    textField: 'catCode',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectM(item: any) {
  }

  notFirst = true;
  rmnotFirst = true;
  checkStatus() {
    if (this.catList.length <= 0) this.notFirst = false;
  }
  checkStatusRep() {
    if (this.catList.length <= 0) this.rmnotFirst = false;
  }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAll() {
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch((error)=> {
      this.assStateList = [];
    });
  }

  getAssetState(id:any) {
    let temp = this.assStateList.find((x:any)  => x.id == id);
    return temp ? temp.status : '';
  }
  dropdownList2 = [];
  selectedItems2 = [];
  dropdownSettings2 = {
    singleSelection: false,
    idField: 'id',
    textField: 'status',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectA(item: any) {
  }

  notFirstA = true;
  rmnotFirstA = true;
  checkStatusA() {
    if (this.assStateList.length <= 0) this.notFirstA = false;
  }
  checkStatusRepA() {
    if (this.assStateList.length <= 0) this.rmnotFirstA = false;
  }

  isEmptyA(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAllA() {
  }

  getApproverList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch((error)=> {
      this.assStateList = [];
    });
  }


  clearFilter() {
   // this.filterlocation = null;
 this.filterlocation = '';
    this.filterassetType = null;
    this.filterassetState = null;
    this.filterusageType = null;
    this.filtertype = null;
    this.filterlicenseType = null;
    this.filtersoftwareType = null;
    this.filterinput = null;
    this.filtercategory = null;
    this.filtersearchText = null;
    this.assetList = [];
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 60);
    this.to_date = this.today;
    this.filtertransferType = '';
    this.reInitDatatable();
  }

  getSizeList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_STORAGE_SIZE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.sizeList = data;
        console.log(this.sizeList);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.sizeList = [];
    });
  }

  getStorageSize(id:any) {
    let temp = this.sizeList.find((x:any)  => x.storId == id);
    return temp ? temp.storTxt : '';
  }

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch((error) => {
      this.monType = [];
    });
  }

  getMonitorType(id: any) {
    let temp = this.monType.find((x:any)  => x.id == id);
    return temp ? temp.type : '';
  }

  subCategorylist: any[] = []
  GetSubCategory(type: any) {
    this.subCategorylist = this.catList.filter((x:any)  => x.catCode == type);
  }

  dropdownListC = [];
  selectedItemsC = [];
  dropdownSettingsC = {
    singleSelection: false,
    idField: 'catName',
    textField: 'catName',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectC(item: any) {
  }

  notFirstC = true;
  rmnotFirstC = true;
  checkStatusC() {
    if (this.subCategorylist.length <= 0) this.notFirstC = false;
  }
  checkStatusRepC() {
    if (this.subCategorylist.length <= 0) this.rmnotFirstC = false;
  }

  isEmptyC(str: string | any[]) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAllC() {
  }

  getSoftType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_SOFTWARE_TYPE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data;
        console.log(this.softwareList);
      }
    }).catch((error) => {
      this.softwareList = [];
    });
  }

  getSoftTypename(id: any) {
    let temp = this.softwareList.find((x:any)  => x.softId == id);
    return temp ? temp.softStxt : '';
  }
  dropdownListS = [];
  selectedItemsS = [];
  dropdownSettingsS = {
    singleSelection: false,
    idField: 'softId',
    textField: 'softStxt',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectS(item: any) {
  }

  notFirstS = true;
  rmnotFirstS = true;
  checkStatusS() {
    if (this.softwareList.length <= 0) this.notFirstS = false;
  }
  checkStatusRepS() {
    if (this.softwareList.length <= 0) this.rmnotFirstS = false;
  }

  isEmptyS(str: string | any[]) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAllS() {
  }

  getLicType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_LICENSE_TYPE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.licenseList = data;
        console.log(this.licenseList);
      }
    }).catch((error) => {
      this.licenseList = [];
    });
  }

  getLicTypename(licId: any) {
    let temp = this.licenseList.find((x:any)  => x.licId == licId);
    return temp ? temp.licStxt : '';
  }

  dropdownListL = [];
  selectedItemsL = [];
  dropdownSettingsL = {
    singleSelection: false,
    idField: 'licId',
    textField: 'licStxt',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  onItemSelectL(item: any) {
  }

  notFirstL = true;
  rmnotFirstL = true;
  checkStatusL() {
    if (this.licenseList.length <= 0) this.notFirstL = false;
  }
  checkStatusRepL() {
    if (this.licenseList.length <= 0) this.rmnotFirstL = false;
  }

  isEmptyL(str) {
    if (str.length == 0) return true;
    else return false;
  }

  onSelectAllL() {
  }

  image!: string
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

  pageSize: any = 10;
  pageNo: any = 1;

  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.getData();
  }

  onChange() {
    this.assetList = [];
    this.clearFilter();
    this.reInitDatatable();
  }

  //ALL DETAILS TO GET HARDWARE SUMMARY
  success: any;
  view: boolean = false;
  getHardwareSummary() {
    if (this.filterlocation == null || this.filterlocation == '') {
      toastr.error("Please select Location..");
      return;
    }
    else if (this.filtercategory == null || this.filtercategory == '') {
      toastr.error("Please select Sub Category..");
      return;
    }
    else if (this.filterassetState == null || this.filterassetState == '') {
      toastr.error("Please select Asset State..");
      return;
    }
    else {
      this.assetList = [];
      this.getData();
    }
  }

  getData() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};
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
    filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
    filterModel.category = this.filtercategory.map((x:any)  => x).join();
    filterModel.usageType = this.filterusageType;
    filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);
    filterModel.export = false;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_SUMMARY, filterModel).then((data: any) => {
      if (data) {
        this.assetList = data.table1;
        this.AMSReports.totalCount = data.table[0].totalCount;
        this.AMSReports.totalPages = data.table[0].totalPages;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  onUserActions(isEdit: boolean, AMSReports: AMSReports, isprint: boolean, value: string) {
    this.view = true;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";

    this.AMSReports = Object.assign({}, AMSReports);
  
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#searchModal").modal('hide');
    jQuery('#hardSummModal').modal('show');
  }

  //v10
  // exportToExcelHSReports() {
  //   this.isLoading = true;
  //   let td = new Date();
  //   var filterModel: any = {};
  //   let formatedFROMdate: string
  //   let formatedTOdate: string
  //   var filterModel: any = {};
  //   if (this.from_date == '' || this.from_date == null) {
  //     formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
  //     this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
  //   }
  //   else {
  //     let fd = new Date(this.from_date);
  //     formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + fd.getDate()).slice(-2);
  //     this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

  //   }

  //   if (this.to_date == '' || this.to_date == null) {
  //     formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + td.getDate()).slice(-2);
  //     this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
  //   }
  //   else {
  //     let ed = new Date(this.to_date);
  //     formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + ed.getDate()).slice(-2);
  //     this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

  //   }
  //   filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
  //   filterModel.category = this.filtercategory.map((x:any)  => x).join();
  //   filterModel.usageType = this.filterusageType;
  //   filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
  //   filterModel.FromDate = this.getFormatedDateTime(this.from_date);
  //   filterModel.ToDate = this.getFormatedDateTime(this.to_date);
  //   filterModel.export = true;
  //   this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_SUMMARY, filterModel).then((data: any) => {
  //     if (data) {
  //       var list = data.table;
  //       swal({
  //         title: "Message",
  //         text: "Are you sure to export?",
  //         icon: "warning",
  //         dangerMode: false,
  //         buttons: [true, true]
  //       }).then((willsave) => {
  //         if (willsave) {
  //           const header = ["Sl No", "Asset ID", "Category", "Location", "Asset No", "Host Name", "Emp Name", "EmpNo", "Department", "Com Dept", "Com floor", "Bar Code",
  //             "Model", "Manufacturer", "Part No", "Serial No", "Processor", "RAM", "Ram size", "HDD", "Size type", "Config", "Gxp Applicable", "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse",
  //             "Usage Type", "InstName", "InstType", "Version", "Software", "OperatingSystem", "Sw Version", "ProductKey", "AssetState", "NatureofActivities", "PONumber", "PODate", "InvoiceNumber",
  //             "InvoiceDate", "SupplierName", "Value", "WarrantyExpiration", "PreventiveMaintenace", "InstallationDate", "InstallationType", "Created by", "Created date", "Modified by", "Modified date",
  //             "Remarks", "Date of Issue", "Ppm", "Machine Life", "Cpp", "Asset Type", "EmpAd", "Replacement Type",
  //             "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus"]

  //           var exportList = [];
  //           var ts: any = {};
  //           let index = 0;
  //           list.forEach((element:any)=> {

  //             index = index + 1;
  //             ts = {};
  //             ts.slNo = index;
  //             ts.asset_ID = element.asset_ID;
  //             ts.category = element.category;
  //             ts.location = element.location;
  //             ts.asset_No = element.asset_No;
  //             ts.host_Name = element.host_Name;
  //             ts.empName = element.empName;
  //             ts.empNo = +element.empNo;
  //             ts.empdept = element.department;
  //             ts.com_dept = +element.com_dept;
  //             ts.com_floor = element.com_floor;
  //             ts.bar_Code = +element.bar_Code;
  //             ts.model = element.model;
  //             ts.manufacturer = element.manufacturer;
  //             ts.part_No = element.part_No;
  //             ts.serial_No = element.serial_No;
  //             ts.processor = element.processor;
  //             ts.ram = +element.ram;
  //             ts.ramSize = element.ramSize;
  //             ts.hdd = +element.hdd;
  //             ts.sizeType = element.hddSize;
  //             ts.config = element.config;
  //             ts.gxP_Applicable = element.gxP_Applicable;
  //             ts.iP_Address = element.iP_Address;
  //             ts.type = element.type;
  //             ts.make = element.make;
  //             ts.size = element.size;
  //             ts.keyboard = element.keyboard;
  //             ts.mouse = element.mouse;
  //             ts.usage_Type = element.usage_Type;
  //             ts.instName = element.instName;
  //             ts.instType = element.instType;
  //             ts.version = element.version;
  //             ts.software = element.software;
  //             ts.operationSystem = element.operatingSystem;
  //             ts.sw_Version = element.sw_Version;
  //             ts.productKey = element.productKey;
  //             ts.assetstate = element.status;
  //             ts.natureofActivities = element.natureofActivities;
  //             ts.ponumber = element.ponumber;
  //             ts.poDate = this.datePipe.transform(element.poDate,'yyyy-MM-dd');
  //             ts.invoiceNumber = element.invoiceNumber;
  //             ts.invoiceDate = this.datePipe.transform(element.invoiceDate,'yyyy-MM-dd');
  //             ts.supplierName = element.supplierName;
  //             ts.value = +element.value;
  //             ts.warrantyExpiration = this.datePipe.transform(element.warrantyExpiration,'yyyy-MM-dd');
  //             ts.preventiveMaintenace = this.datePipe.transform(element.preventiveMaintenace,'yyyy-MM-dd');
  //             ts.installationDate = this.datePipe.transform(element.installationDate,'yyyy-MM-dd');
  //             ts.installationType = element.installationType;
  //             ts.created_by = +element.created_by;
  //             ts.created_date = this.datePipe.transform(element.created_date,'yyyy-MM-dd');
  //             ts.modified_by = element.modified_by;
  //             ts.modified_date = this.datePipe.transform(element.modified_date,'yyyy-MM-dd');
  //             ts.remarks = element.remarks;
  //             ts.date_of_Issue = this.datePipe.transform(element.date_of_Issue,'yyyy-MM-dd');
  //             ts.ppm = element.ppm;
  //             ts.machine_Life = element.machine_Life;
  //             ts.cpp = element.cpp;
  //             ts.asset_Type = element.asset_Type;
  //             ts.empAd = element.empAd;
  //             ts.replacement_type = element.replacement_type;
  //             ts.viewStatusApprover = +element.viewStatusApprover;
  //             ts.statusApprovedDate = this.datePipe.transform(element.statusApprovedDate,'yyyy-MM-dd');
  //             if(element.reportViewStatus == '0') {
  //               ts.reportViewStatus = 'Not Approved';
  //             }
  //             else{
  //               ts.reportViewStatus = 'Approved';
  //             }
  //             exportList.push(ts);
  //           });
  //           const data1 = exportList;
  //           //Create workbook and worksheet
  //           //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //           let worksheet = workbook.addWorksheet('Summary Report');
  //           let headerRow = worksheet.addRow(header);
  //           headerRow.eachCell((cell, number) => {
  //             cell.fill = {
  //               type: 'pattern',
  //               pattern: 'solid',
  //               fgColor: { argb: 'FFFFFF00' },
  //               bgColor: { argb: 'FF0000FF' }
  //             }
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })

  //           for (let x1 of data1) {
  //             let x2 = Object.keys(x1);
  //             let temp = []
  //             for (let y of x2) {
  //               temp.push(x1[y])
  //             }
  //             worksheet.addRow(temp)
  //           }
  //           worksheet.eachRow((cell, number) => {
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })
  //           worksheet.addRow([]);
  //           workbook.xlsx.writeBuffer().then((data1) => {
  //             let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //             fs.saveAs(blob, 'HardwareSummaryReport.xlsx');
  //           })
  //         }
  //       })
  //     }
  //   }).catch((error)=> {
  //     this.isLoading = false;
  //   });
  // }


  //ALL THE DETAILS TO GET HARDWARE DETAILED
  gotoPage1(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getData1();
  }

  pageSizeChange1() {
    this.pageNo = 1;
    this.getData1();
  }

  getHardwareDetailed() {
    if (this.filterlocation == null || this.filterlocation == '') {
      toastr.error("Please select Location..");
      return;
    }
    else if (this.filterassetType == null || this.filterassetType == '') {
      toastr.error("Please select Asset Type..");
      return;
    }
    else if (this.filtercategory == null || this.filtercategory == '') {
      toastr.error("Please select Category..");
      return;
    }
    else if (this.filterassetState == null || this.filterassetState == '') {
      toastr.error("Please select Asset State..");
      return;
    }
    else {
      this.assetList = [];
      this.getData1();
    }
  }

  getData1() {
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
    filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
    filterModel.assetType = this.filterassetType.map((x:any)  => x).join();
    filterModel.category = this.filtercategory.map((x:any)  => x).join();
    filterModel.assetSearch = this.filtersearchText;
    filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);
    filterModel.export = false;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAIL, filterModel).then((data: any) => {
      if (data) {
        this.assetList = data.table1;
        this.AMSReports.totalCount = data.table[0].totalCount;
        this.AMSReports.totalPages = data.table[0].totalPages;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
 //v10
  // exportToExcelHDReports() {
  //   this.isLoading = true;
  //   let td = new Date();
  //   let formatedFROMdate: string
  //   let formatedTOdate: string
  //   var filterModel: any = {};
  //   if (this.from_date == '' || this.from_date == null) {
  //     formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
  //     this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
  //   }
  //   else {
  //     let fd = new Date(this.from_date);
  //     formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + fd.getDate()).slice(-2);
  //     this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

  //   }

  //   if (this.to_date == '' || this.to_date == null) {
  //     formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + td.getDate()).slice(-2);
  //     this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
  //   }
  //   else {
  //     let ed = new Date(this.to_date);
  //     formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + ed.getDate()).slice(-2);
  //     this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

  //   }
  //   filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
  //   filterModel.assetType = this.filterassetType.map((x:any)  => x).join();
  //   filterModel.category = this.filtercategory.map((x:any)  => x).join();
  //   filterModel.department = this.filtersearchText;
  //   filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
  //   filterModel.FromDate = this.getFormatedDateTime(this.from_date);
  //   filterModel.ToDate = this.getFormatedDateTime(this.to_date);
  //   filterModel.export = true;
  //   this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAIL, filterModel).then((data: any) => {
  //     if (data) {
  //       var list = data.table;
  //       swal({
  //         title: "Message",
  //         text: "Are you sure to export?",
  //         icon: "warning",
  //         dangerMode: false,
  //         buttons: [true, true]
  //       }).then((willsave) => {
  //         if (willsave) {
  //           const header = ["Sl No", "Asset ID", "Category", "Location", "Asset No", "Host Name", "Emp Name", "EmpNo", "Department", "Com Dept", "Com floor", "Bar Code",
  //             "Model", "Manufacturer",
  //             "Part No", "Serial No", "Processor", "RAM", "Ram size", "HDD", "Size type", "Config", "Gxp Applicable", "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse",
  //             "Usage Type", "InstName", "InstType", "Version", "Software", "OperatingSystem", "Sw Version", "ProductKey", "AssetState", "NatureofActivities", "PONumber", "PODate", "InvoiceNumber",
  //             "InvoiceDate", "SupplierName", "Value", "WarrantyExpiration", "PreventiveMaintenace", "InstallationDate", "InstallationType", "Created by", "Created date", "Modified by", "Modified date",
  //             "Remarks", "Date of Issue", "Ppm", "Machine Life", "Cpp", "Asset Type", "EmpAd", "Replacement Type",
  //             "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus"]

  //           var exportList = [];
  //           var ts: any = {};
  //           let index = 0;
  //           list.forEach((element:any)=> {

  //             index = index + 1;
  //             ts = {};
  //             ts.slNo = index;
  //             ts.asset_ID = element.asset_ID;
  //             ts.category = element.category;
  //             ts.location = element.location;
  //             ts.asset_No = element.asset_No;
  //             ts.host_Name = element.host_Name;
  //             ts.empName = element.empName;
  //             ts.empNo = +element.empNo;
  //             ts.empdept = element.department;
  //             ts.com_dept = +element.com_dept;
  //             ts.com_floor = element.com_floor;
  //             ts.bar_Code = element.bar_Code;
  //             ts.model = element.model;
  //             ts.manufacturer = element.manufacturer;
  //             ts.part_No = element.part_No;
  //             ts.serial_No = element.serial_No;
  //             ts.processor = element.processor;
  //             ts.ram = +element.ram;
  //             ts.ramSize = element.ramSize;
  //             ts.hdd = +element.hdd;
  //             ts.sizeType = element.hddSize;
  //             ts.config = element.config;
  //             ts.gxP_Applicable = element.gxP_Applicable;
  //             ts.iP_Address = element.iP_Address;
  //             ts.type = element.type;
  //             ts.make = element.make;
  //             ts.size = element.size;
  //             ts.keyboard = element.keyboard;
  //             ts.mouse = element.mouse;
  //             ts.usage_Type = element.usage_Type;
  //             ts.instName = element.instName;
  //             ts.instType = element.instType;
  //             ts.version = element.version;
  //             ts.software = element.software;
  //             ts.operationSystem = element.operatingSystem;
  //             ts.sw_Version = element.sw_Version;
  //             ts.productKey = element.productKey;
  //             ts.assetstate = element.status;
  //             ts.natureofActivities = element.natureofActivities;
  //             ts.ponumber = element.ponumber;
  //             ts.podate = element.podate;
  //             ts.invoiceNumber = element.invoiceNumber;
  //             ts.invoiceDate = this.getDateFormate(element.invoiceDate);
  //             ts.supplierName = element.supplierName;
  //             ts.value = +element.value;
  //             ts.warrantyExpiration = this.getDateFormate(element.warrantyExpiration);
  //             ts.preventiveMaintenace = this.getDateFormate(element.preventiveMaintenace);
  //             ts.installationDate = this.getDateFormate(element.installationDate);
  //             ts.installationType = element.installationType;
  //             ts.created_by = +element.created_by;
  //             ts.created_date = this.getDateFormate(element.created_date);
  //             ts.modified_by = +element.modified_by;
  //             ts.modified_date = this.getDateFormate(element.modified_date);
  //             ts.remarks = element.remarks;
  //             ts.date_of_Issue = element.date_of_Issue;
  //             ts.ppm = element.ppm;
  //             ts.machine_Life = element.machine_Life;
  //             ts.cpp = element.cpp;
  //             ts.asset_Type = element.asset_Type;
  //             ts.empAd = element.empAd;
  //             ts.replacement_type = element.replacement_type;
  //             ts.viewStatusApprover = +element.viewStatusApprover;
  //             ts.statusApprovedDate = this.getDateFormate(element.statusApprovedDate);
  //             if(element.reportViewStatus == '0') {
  //               ts.reportViewStatus = 'Not Approved';
  //             }
  //             else{
  //               ts.reportViewStatus = 'Approved';
  //             }
  //             exportList.push(ts);
  //           });
  //           const data1 = exportList;
  //           //Create workbook and worksheet
  //           //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //           let worksheet = workbook.addWorksheet('Detailed Report');
  //           let headerRow = worksheet.addRow(header);
  //           headerRow.eachCell((cell, number) => {
  //             cell.fill = {
  //               type: 'pattern',
  //               pattern: 'solid',
  //               fgColor: { argb: 'FFFFFF00' },
  //               bgColor: { argb: 'FF0000FF' }
  //             }
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })

  //           for (let x1 of data1) {
  //             let x2 = Object.keys(x1);
  //             let temp = []
  //             for (let y of x2) {
  //               temp.push(x1[y])
  //             }
  //             worksheet.addRow(temp)
  //           }
  //           worksheet.eachRow((cell, number) => {
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })
  //           worksheet.addRow([]);
  //           workbook.xlsx.writeBuffer().then((data1) => {
  //             let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //             fs.saveAs(blob, 'HardwareDetailedReport.xlsx');
  //           })
  //         }
  //       })
  //     }
  //   }).catch((error)=> {
  //     this.isLoading = false;
  //   });
  // }
 //v10
  // exportToExcelDispose() {
  //   this.isLoading = true;
  //   let td = new Date();
  //   let formatedFROMdate: string
  //   let formatedTOdate: string
  //   var filterModel: any = {};
  //   if (this.from_date == '' || this.from_date == null) {
  //     formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
  //     this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
  //   }
  //   else {
  //     let fd = new Date(this.from_date);
  //     formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + fd.getDate()).slice(-2);
  //     this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

  //   }

  //   if (this.to_date == '' || this.to_date == null) {
  //     formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + td.getDate()).slice(-2);
  //     this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
  //   }
  //   else {
  //     let ed = new Date(this.to_date);
  //     formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + ed.getDate()).slice(-2);
  //     this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

  //   }
  //   filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
  //   filterModel.assetType = this.filterassetType.map((x:any)  => x).join();
  //   filterModel.category = this.filtercategory.map((x:any)  => x).join();
  //   filterModel.department = this.filtersearchText;
  //   filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
  //   filterModel.FromDate = this.getFormatedDateTime(this.from_date);
  //   filterModel.ToDate = this.getFormatedDateTime(this.to_date);
  //   filterModel.export = true;
  //   this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAIL, filterModel).then((data: any) => {
  //     if (data) {
  //       var list = data.table;
  //       swal({
  //         title: "Message",
  //         text: "Are you sure to export?",
  //         icon: "warning",
  //         dangerMode: false,
  //         buttons: [true, true]
  //       }).then((willsave) => {
  //         if (willsave) {
  //           const header = ["Sl No", "Asset ID", "Category", "Location", "Asset No", "Host Name", "Emp Name", "EmpNo", "Department", "Com Dept", "Com floor", "Bar Code", "Model", "Manufacturer",
  //             "Part No", "Serial No", "Processor", "RAM", "Ram size", "HDD", "Size type", "Config", "Gxp Applicable", "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse",
  //             "Usage Type", "Inst Name", "Inst Type", "Version", "Software", "Operating System", "Sw Version", "Product Key", "Asset State", "Nature of Activities", "PO Number", "PO Date", "Invoice Number",
  //             "Invoice Date", "Supplier Name", "Value", "Warranty Expiration", "Preventive Maintenace", "Installation Date", "Installation Type", "Created by", "Created date",
  //             "Date of Issue", "Ppm", "Machine Life", "Cpp", "Asset Type", "EmpAd", "Replacement Type", "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus", 
  //             "Disposed by", "Disposed date", "VendorCode", "VendorCity", "VendorName", "Invoice No", "Invoice Date", "Delivery Challan No", "Delivery Challan Date"]

  //           var exportList = [];
  //           var ts: any = {};
  //           let index = 0;
  //           list.forEach((element:any)=> {

  //             index = index + 1;
  //             ts = {};
  //             ts.slNo = index;
  //             ts.assetId = element.assetId;
  //             ts.category = element.category;
  //             ts.location = element.location;
  //             ts.assetNo = element.assetNo;
  //             ts.hostName = element.hostName;
  //             ts.empName = element.empName;
  //             ts.empNo = +element.empNo;
  //             ts.empdept = element.department;
  //             ts.comDept = element.comDept;
  //             ts.comFloor = element.comFloor;
  //             ts.barcode = element.barcode;
  //             ts.model = element.model;
  //             ts.manufacturer = element.manufacturer;
  //             ts.partNo = element.partNo;
  //             ts.serailNo = element.serialNo;
  //             ts.processor = element.processor;
  //             ts.ram = element.ram;
  //             ts.ramSize = element.ramSize;
  //             ts.hdd = element.hdd;
  //             ts.sizeType = element.hddSize;
  //             ts.config = element.config;
  //             ts.Gxp = element.gxPApplicable;
  //             ts.ipAdress = element.ipAddress;
  //             ts.monitorType = element.monitorType;
  //             ts.make = element.make;
  //             ts.size = element.size;
  //             ts.keyboard = element.keyboard;
  //             ts.mouse = element.mouse;
  //             ts.usagetype = element.usageType;
  //             ts.instName = element.instName;
  //             ts.instType = element.instType;
  //             ts.version = element.version;
  //             ts.software = element.software;
  //             ts.operationSystem = element.operatingSystem;
  //             ts.swVersion = element.swVersion;
  //             ts.productKey = element.productKey;
  //             ts.assetstate = element.status;
  //             ts.natureofActivities = element.natureofActivities;
  //             ts.ponumber = element.ponumber;
  //             ts.podate = element.podate;
  //             ts.invoiceNumber = element.invoiceNumber;
  //             ts.invoiceDate = this.getDateFormate(element.invoiceDate);
  //             ts.supplierName = element.supplierName;
  //             ts.value = +element.value;
  //             ts.warrantyExpiration = this.getDateFormate(element.warrantyExpiration);
  //             ts.preventiveMaintenace = this.getDateFormate(element.preventiveMaintenace);
  //             ts.installationDate = this.getDateFormate(element.installationDate);
  //             ts.installationType = element.installationType;
  //             ts.createdBy = element.createdBy;
  //             ts.createdDate = element.createdDate;
  //             ts.dateOfIssue = element.dateOfIssue;
  //             ts.ppm = element.ppm;
  //             ts.machineLife = element.machineLife;
  //             ts.cpp = element.cpp;
  //             ts.assetType = element.assetType;
  //             ts.empAd = element.empAd;
  //             ts.replacementType = element.replacementType;
  //             ts.viewStatusApprover = +element.viewStatusApprover;
  //             ts.statusApprovedDate = this.getDateFormate(element.statusApprovedDate);
  //             if(element.reportViewStatus == '0') {
  //               ts.reportViewStatus = 'Not Approved';
  //             }
  //             else{
  //               ts.reportViewStatus = 'Approved';
  //             }
  //             ts.modifiedBy = element.modifiedBy;
  //             ts.modifiedDate = element.modifiedDate;
  //             ts.vendorCode = element.vendorCode;
  //             ts.vendorCity = element.vendorCity;
  //             ts.vendorName = element.vendorName;
  //             ts.dInvoiceNo = element.dInvoiceNo;
  //             ts.dInvoiceDate = element.dInvoiceDate;
  //             ts.deliveryChallanNo = element.deliveryChallanNo;
  //             ts.deliveryChallanDate = element.deliveryChallanDate;
  //             exportList.push(ts);
  //           });
  //           const data1 = exportList;
  //           //Create workbook and worksheet
  //           //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //           let worksheet = workbook.addWorksheet('Disposed Asset Report');

  //           worksheet.addRow([]);
  //           //Add Header Row
  //           let headerRow = worksheet.addRow(header);

  //           headerRow.eachCell((cell, number) => {
  //             cell.fill = {
  //               type: 'pattern',
  //               pattern: 'solid',
  //               fgColor: { argb: 'FFFFFF00' },
  //               bgColor: { argb: 'FF0000FF' }
  //             }
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })

  //           for (let x1 of data1) {
  //             let x2 = Object.keys(x1);
  //             let temp = []
  //             for (let y of x2) {
  //               temp.push(x1[y])
  //             }
  //             worksheet.addRow(temp)
  //           }
  //           worksheet.eachRow((cell, number) => {
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })
  //           worksheet.addRow([]);
  //           workbook.xlsx.writeBuffer().then((data1) => {
  //             let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //             fs.saveAs(blob, 'DisposedAssetReport.xlsx');
  //           })
  //         }
  //       })
  //     }
  //   });
  // }


  //ALL DETAILS TO GET SOFTWARE SUMMARY
  gotoPage2(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getData2();
  }

  pageSizeChange2() {
    this.pageNo = 1;
    this.getData2();
  }

  getSoftwareSummary() {
    if (this.filterlocation == null || this.filterlocation == '') {
      toastr.error("Please select Location..");
      return;
    }
    else if (this.filtersoftwareType == null || this.filtersoftwareType == '') {
      toastr.error("Please select Software Type..");
      return;
    }
    else if (this.filterlicenseType == null || this.filterlicenseType == '') {
      toastr.error("Please select License Type..");
      return;
    }
    else {
      this.assetList = [];
      this.getData2();
    }
  }

  getData2() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};
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
    filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
    filterModel.softwareType = this.filtersoftwareType.map((x:any)  => x.softId).join();
    filterModel.licenseType = this.filterlicenseType.map((x:any)  => x.licId).join();
    filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_SUMMARY, filterModel).then((data: any) => {
      if (data) {
        this.assetList = data.table1;
        this.AMSReports.totalCount = data.table[0].totalCount;
        this.AMSReports.totalPages = data.table[0].totalPages;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
 //v10
  // exportToExcelSSReports() {
  //   this.isLoading = true;
  //   let td = new Date();
  //   var filterModel: any = {};
  //   let formatedFROMdate: string
  //   let formatedTOdate: string
  //   var filterModel: any = {};
  //   if (this.from_date == '' || this.from_date == null) {
  //     formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
  //     this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
  //   }
  //   else {
  //     let fd = new Date(this.from_date);
  //     formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + fd.getDate()).slice(-2);
  //     this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

  //   }

  //   if (this.to_date == '' || this.to_date == null) {
  //     formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + td.getDate()).slice(-2);
  //     this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
  //   }
  //   else {
  //     let ed = new Date(this.to_date);
  //     formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + ed.getDate()).slice(-2);
  //     this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

  //   }
  //   filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
  //   filterModel.softwareType = this.filtersoftwareType.map((x:any)  => x.softId).join();
  //   filterModel.licenseType = this.filterlicenseType.map((x:any)  => x.licId).join();
  //   filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
  //   filterModel.pageNo = this.pageNo;
  //   filterModel.pageSize = this.pageSize;
  //   filterModel.FromDate = this.getFormatedDateTime(this.from_date);
  //   filterModel.ToDate = this.getFormatedDateTime(this.to_date);
  //   filterModel.export = true;
  //   this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_SUMMARY, filterModel).then((data: any) => {
  //     if (data) {
  //       var list = data.table;swal({
  //         title: "Message",
  //         text: "Are you sure to export?",
  //         icon: "warning",
  //         dangerMode: false,
  //         buttons: [true, true],
  //       }).then((willsave) => {
  //         if (willsave) {
  //           const header = ["Sl No", "Asset No", "Location", "Asset Status", "Software Type", "Software Name", "License Type", "Software Version ", "Product Key ", "Expires On"]

  //           var exportList = [];
  //           var ts: any = {};
  //           let index = 0;
  //           list.forEach((element:any)=> {

  //             index = index + 1;
  //             ts = {};
  //             ts.slNo = index;
  //             ts.assetNo = element.assetNo;
  //             ts.location = element.location;
  //             ts.status = element.status;
  //             ts.softwareType = element.softwareType;
  //             ts.softwareName = element.softwareName;
  //             ts.licenseType = element.licenseType;
  //             ts.softwareVersion = element.softwareVersion;
  //             ts.productKey = element.productKey;
  //             ts.expiresOn = element.expiresOn;
  //             exportList.push(ts);

  //           });
  //           const data1 = exportList;
  //           //Create workbook and worksheet
  //           //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //           let worksheet = workbook.addWorksheet('Summary Report');
  //           //Add Row and formatting

  //           //Blank Row 
  //           worksheet.addRow([]);
  //           //Add Header Row
  //           let headerRow = worksheet.addRow(header);

  //           headerRow.eachCell((cell, number) => {
  //             cell.fill = {
  //               type: 'pattern',
  //               pattern: 'solid',
  //               fgColor: { argb: 'FFFFFF00' },
  //               bgColor: { argb: 'FF0000FF' }
  //             }
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })

  //           for (let x1 of data1) {
  //             let x2 = Object.keys(x1);
  //             let temp = []
  //             for (let y of x2) {
  //               temp.push(x1[y])
  //             }
  //             worksheet.addRow(temp)
  //           }
  //           worksheet.eachRow((cell, number) => {
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })
  //           worksheet.addRow([]);
  //           workbook.xlsx.writeBuffer().then((data:any) => {
  //             let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //             fs.saveAs(blob, 'SoftwareSummaryReport.xlsx');
  //           })
  //         }
  //       })
  //     }
  //     this.isLoading = false;
  //   }).catch((error)=> {
  //     this.isLoading = false;
  //   });
  // }

  //ALL DETAILS TO GET SOFTWARE DETAILED
  gotoPage3(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.getData3();
  }

  pageSizeChange3() {
    this.pageNo = 1;
    this.getData3();
  }

  getSoftwareDetailed() {
    if (this.filterlocation == null || this.filterlocation == '') {
      toastr.error("Please select Location..");
      return;
    }
    else if (this.filtersoftwareType == null || this.filtersoftwareType == '') {
      toastr.error("Please select Software Type..");
      return;
    }
    else if (this.filterlicenseType == null || this.filterlicenseType == '') {
      toastr.error("Please select License Type..");
      return;
    }
    else {
      this.assetList = [];
      this.getData3();
    }
  }

  getData3() {
    this.isLoading = true;
    let td = new Date();
    var filterModel: any = {};
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
    filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
    filterModel.softwareType = this.filtersoftwareType.map((x:any)  => x.softId).join();
    filterModel.licenseType = this.filterlicenseType.map((x:any)  => x.licId).join();
    filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);
    filterModel.export = false;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_DETAIL, filterModel).then((data: any) => {
      if (data) {
        this.assetList = data.table1;
        this.AMSReports.totalCount = data.table[0].totalCount;
        this.AMSReports.totalPages = data.table[0].totalPages;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  //v10
  // exportToExcelSDReports() {
  //   this.isLoading = true;
  //   let td = new Date();
  //   var filterModel: any = {};
  //   let formatedFROMdate: string
  //   let formatedTOdate: string
  //   if (this.from_date == '' || this.from_date == null) {
  //     formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
  //     this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
  //   }
  //   else {
  //     let fd = new Date(this.from_date);
  //     formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + fd.getDate()).slice(-2);
  //     this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

  //   }

  //   if (this.to_date == '' || this.to_date == null) {
  //     formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + td.getDate()).slice(-2);
  //     this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
  //   }
  //   else {
  //     let ed = new Date(this.to_date);
  //     formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
  //       ("00" + ed.getDate()).slice(-2);
  //     this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

  //   }
  //   filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
  //   filterModel.softwareType = this.filtersoftwareType.map((x:any)  => x.softId).join();
  //   filterModel.licenseType = this.filterlicenseType.map((x:any)  => x.licId).join();
  //   filterModel.assetState = this.filterassetState.map((x:any)  => x.id).join();
  //   filterModel.pageNo = this.pageNo;
  //   filterModel.pageSize = this.pageSize;
  //   filterModel.FromDate = this.getFormatedDateTime(this.from_date);
  //   filterModel.ToDate = this.getFormatedDateTime(this.to_date);
  //   filterModel.export = true;
  //   this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SOFT_DETAIL, filterModel).then((data: any) => {
  //     if (data) {
  //       var list = data.table;
  //       swal({
  //         title: "Message",
  //         text: "Are you sure to export?",
  //         icon: "warning",
  //         dangerMode: false,
  //         buttons: [true, true],
  //       }).then((willsave) => {
  //         if (willsave) {
  //           const header = ["Sl No", "Asset No", "Location", "Asset Status", "Software Type", "Software Name", "License Type", "Software Version ", "Product Key ", "Expires On"]

  //           var exportList = [];
  //           var ts: any = {};
  //           let index = 0;
  //           list.forEach((element:any)=> {

  //             index = index + 1;
  //             ts = {};
  //             ts.slNo = index;
  //             ts.assetNo = element.assetNo;
  //             ts.location = element.location;
  //             ts.status = element.status;
  //             ts.softwareType = element.softwareType;
  //             ts.softwareName = element.softwareName;
  //             ts.licenseType = element.licenseType;
  //             ts.softwareVersion = element.softwareVersion;
  //             ts.productKey = element.productKey;
  //             ts.expiresOn = element.expiresOn;
  //             exportList.push(ts);

  //           });
  //           const data1 = exportList;
  //           //Create workbook and worksheet
  //           //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
  //           let worksheet = workbook.addWorksheet('Summary Report');
  //           //Add Row and formatting

  //           //Blank Row 
  //           worksheet.addRow([]);
  //           //Add Header Row
  //           let headerRow = worksheet.addRow(header);

  //           headerRow.eachCell((cell, number) => {
  //             cell.fill = {
  //               type: 'pattern',
  //               pattern: 'solid',
  //               fgColor: { argb: 'FFFFFF00' },
  //               bgColor: { argb: 'FF0000FF' }
  //             }
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })

  //           for (let x1 of data1) {
  //             let x2 = Object.keys(x1);
  //             let temp = []
  //             for (let y of x2) {
  //               temp.push(x1[y])
  //             }
  //             worksheet.addRow(temp)
  //           }
  //           worksheet.eachRow((cell, number) => {
  //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  //           })
  //           worksheet.addRow([]);
  //           workbook.xlsx.writeBuffer().then((data:any) => {
  //             let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //             fs.saveAs(blob, 'SoftwareDetailedReport.xlsx');
  //           })
  //         }
  //       })
  //     }
  //     this.isLoading = false;
  //   }).catch((error)=> {
  //     this.isLoading = false;
  //   });
  // }

    //ALL DETAILS TO GET TRANSFEERRED ASSET DETAILS
    gotoPage4(no) {
      if (this.pageNo == no) return;
      this.pageNo = no;
      this.getData4();
    }
  
    pageSizeChange4() {
      this.pageNo = 1;
      this.getData4();
    }
  
    getTransferAssetDetails() {
      if (this.filterlocation == null || this.filterlocation == '') {
        toastr.error("Please select Location..");
        return;
      }
      else if (this.filtertransferType == null || this.filtertransferType == '') {
        toastr.error("Please select Transfer Type..");
        return;
      }
      else {
        this.assetList = [];
        this.getData4();
      }
    }
  
    getData4() {
      this.isLoading = true;
      var filterModel: any = {};
      filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
      filterModel.transferType = this.filtertransferType;
      filterModel.assetType = this.filterassetType.map((x:any)  => x).join();
      filterModel.pageNo = this.pageNo;
      filterModel.pageSize = this.pageSize;
      filterModel.export = false;
      this.httpService.amspost(APIURLS.BR_GET_AMS_TRANSFERRED_ASSET, filterModel).then((data: any) => {
        if (data) {
          this.assetList = data.table1;
          this.AMSReports.totalCount = data.table[0].totalCount;
          this.AMSReports.totalPages = data.table[0].totalPages;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    } 
   //v10
    // exportToExcelTAReports() {
    //   this.isLoading = true;
    //   var filterModel: any = {};
    //   filterModel.location = this.filterlocation.map((x:any)  => x.code).join();
    //   filterModel.transferType = this.filtertransferType;
    //   filterModel.assetType = this.filterassetType.map((x:any)  => x).join();
    //   filterModel.pageNo = this.pageNo;
    //   filterModel.pageSize = this.pageSize;
    //   filterModel.export = true;
    //   this.httpService.amspost(APIURLS.BR_GET_AMS_TRANSFERRED_ASSET, filterModel).then((data: any) => {
    //     if (data) {
    //       var list = data.table;
    //       swal({
    //         title: "Message",
    //         text: "Are you sure to export ?",
    //         icon: "warning",
    //         dangerMode: false,
    //         buttons: [true, true],
    //       }).then((willsave) => {
    //         if (willsave) {
    //           const header = ["Sl No", "Asset Type", "Category", "Location", "Asset No", "Host Name", "Prev Emp Name",
    //             "Prev EmpNo", "Prev Emp Department", "New Emp Name", "New EmpNo", "New Emp Department",
    //             "Com Dept", "Com floor", "Bar Code", "Model", "Manufacturer", "Part No",
    //             "Serial No", "Processor", "RAM", "Ram size", "HDD", "HDD Size", "Config", "Gxp Applicable",
    //             "IP Address", "Monitor Type", "Make", "Size", "Keyboard", "Mouse", "Usage Type", "InstName",
    //             "InstType", "Version", "Software", "AssetState", "NatureofActivities", "PONumber", "PODate",
    //             "InvoiceNumber", "InvoiceDate", "SupplierName", "Value", "WarrantyExpiration", 
    //             "PreventiveMaintenace", "InstallationDate", "InstallationType",
    //             "Created by", "Created date", "Transferred by", "Transferred date", "Reason for Transfer", "Remarks", "Date of Issue", "Ppm",
    //             "Machine Life", "Cpp", "ViewStatusApprover", "StatusApprovedDate", "ReportViewStatus"]
  
    //           var exportList = [];
    //           var ts: any = {};
    //           let index = 0;
    //           list.forEach((element:any)=> {

    //             index = index + 1;
    //             ts = {};
    //             ts.slNo = index;
    //             ts.assetType = element.assetType;
    //             ts.category = element.category;
    //             ts.location = element.location;
    //             ts.asset_No = element.assetNo;
    //             ts.host_Name = element.host_Name;
    //             ts.prevEmpName = element.prevEmpName;
    //             ts.prevEmpNo = +element.prevEmpNo;
    //             ts.prevEmpDepartment = element.prevEmpDepartment;
    //             ts.newEmpName = element.newEmpName;
    //             ts.prenewEmpNovEmpNo = +element.newEmpNo;
    //             ts.newEmpDepartment = element.newEmpDepartment;
    //             ts.com_dept = element.com_dept;
    //             ts.com_floor = element.com_floor;
    //             ts.bar_Code = element.bar_Code;
    //             ts.model = element.model;
    //             ts.manufacturer = element.manufacturer;
    //             ts.part_No = element.part_No;
    //             ts.serial_No = element.serial_No;
    //             ts.processor = element.processor;
    //             ts.ram = element.ram;
    //             ts.ramSize = element.ramSize;
    //             ts.hdd = element.hdd;
    //             ts.hddSize = element.hddSize;
    //             ts.config = element.config;
    //             ts.gxP_Applicable = element.gxP_Applicable;
    //             ts.iP_Address = element.iP_Address;
    //             ts.type = element.type;
    //             ts.make = element.make;
    //             ts.size = element.size;
    //             ts.keyboard = element.keyboard;
    //             ts.mouse = element.mouse;
    //             ts.usage_Type = element.usage_Type;
    //             ts.instName = element.instName;
    //             ts.instType = element.instType;
    //             ts.version = element.version;
    //             ts.software = element.software;
    //             ts.status = element.status;
    //             ts.natureofActivities = element.natureofActivities;
    //             ts.poNumber = element.poNumber;
    //             ts.poDate = this.datePipe.transform(element.poDate,'yyyy-MM-dd');
    //             ts.invoiceNumber = element.invoiceNumber;
    //             ts.invoiceDate = this.datePipe.transform(element.invoiceDate,'yyyy-MM-dd');
    //             ts.supplierName = element.supplierName;
    //             ts.value = +element.value;
    //             ts.warrantyExpiration = this.datePipe.transform(element.warrantyExpiration,'yyyy-MM-dd');
    //             ts.preventiveMaintenace = this.datePipe.transform(element.preventiveMaintenace,'yyyy-MM-dd');
    //             ts.installationDate = this.datePipe.transform(element.installationDate,'yyyy-MM-dd');
    //             ts.replacement_type = element.replacement_type;
    //             ts.created_by = element.created_by;
    //             ts.created_date = this.datePipe.transform(element.created_date,'yyyy-MM-dd');
    //             ts.transferredBy = element.transferredBy;
    //             ts.transferredDate = this.datePipe.transform(element.transferredDate,'yyyy-MM-dd');
    //             ts.reasonForTransfer = element.reasonForTransfer;
    //             ts.remarks = element.remarks;
    //             ts.date_of_Issue = this.datePipe.transform(element.date_of_Issue,'yyyy-MM-dd');
    //             ts.ppm = element.ppm;
    //             ts.machine_Life = element.machine_Life;
    //             ts.cpp = element.cpp;
    //             ts.viewStatusApprover = +element.viewStatusApprover;
    //             ts.statusApprovedDate = this.datePipe.transform(element.statusApprovedDate,'yyyy-MM-dd');
    //             if (element.reportViewStatus == '1') {
    //               ts.reportViewStatus = 'Approved';
    //             }
    //             else {
    //               ts.reportViewStatus = 'Not Approved';
    //             }
    //             exportList.push(ts);
    //           });
    //           const data1 = exportList;
    //           //Create workbook and worksheet
    //           //let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    //           let worksheet = workbook.addWorksheet('Detailed Report');
    //           //Add Row and formatting
  
    //           //Blank Row 
    //           worksheet.addRow([]);
    //           //Add Header Row
    //           let headerRow = worksheet.addRow(header);
  
    //           headerRow.eachCell((cell, number) => {
    //             cell.fill = {
    //               type: 'pattern',
    //               pattern: 'solid',
    //               fgColor: { argb: 'FFFFFF00' },
    //               bgColor: { argb: 'FF0000FF' }
    //             }
    //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    //           })
  
    //           for (let x1 of data1) {
    //             let x2 = Object.keys(x1);
    //             let temp = []
    //             for (let y of x2) {
    //               temp.push(x1[y])
    //             }
    //             worksheet.addRow(temp)
    //           }
    //           worksheet.eachRow((cell, number) => {
    //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    //           })
    //           worksheet.addRow([]);
    //           workbook.xlsx.writeBuffer().then((data:any) => {
    //             let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //             fs.saveAs(blob, 'TransferredAssetsReport.xlsx');
    //           })
    //         }
    //       })
    //     }
    //     this.isLoading = false;
    //   }).catch((error)=> {
    //     this.isLoading = false;
    //   });
    // }


  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}


