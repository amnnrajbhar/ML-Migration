import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { NgForm } from '@angular/forms';
import { AssetExplorer } from './AssetExplorer.model';
import swal from 'sweetalert';
import { AuthData } from '../../auth/auth.model';
declare var $: any;
declare var toastr: any;
import { DatePipe } from '@angular/common';
//import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import htmlToPdfmake from 'html-to-pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import { AuditLogAMS } from '../auditlogAMS.model';
import { HttpClient } from '@angular/common/http';
//import { b } from '@angular/core/src/render3';

@Component({
  selector: 'app-AssetExplorer',
  templateUrl: './AssetExplorer.component.html',
  styleUrls: ['./AssetExplorer.component.css'],
  providers: [DatePipe]
})

export class AssetExplorerComponent implements OnInit {
  @ViewChild(NgForm) detailsForm: NgForm;

  public tableWidget: any;
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
  assStateList: any;
  locationList: any;
  filterlocation: any;
  location: any;
  locationAllList: any;
  locListCon: any;
  designationList: any[];
  userList: any;
  empListCon: any;
  baseLocation: number;
  departmentList: any;
  filterempNo: any;
  filterempName: any;
  filterempDesg: any;
  filterempDept: any;
  filterdesg: any;
  filterdept: any;
  filterassetNo: string;
  filterassetNo1: string;
  filtercategory1: string;
  filterassetType: any;
  filtersubCategory1: string;
  filterbarcode1: string;
  filtermodel1: string;
  filterpartNo1: string;
  filtermanufacturer1: string;
  filterserialNo1: string;
  filterprocessor1: string;
  filterram1: number;
  filtersize: string;
  filterhdd1: number;
  assetList: any;
  filteripNo1: any;
  filtergxp1: any;
  filterconfig1: any;
  row: any;
  sizeList: any[] = [];
  softType: any;
  licType: any;
  isSubmitted = false;
  filterchoice: string;
  filterassetId1: any;
  filterlocation1: any;
  filtercondition: any;
  dataSource: any[];
  newDynamic: {};
  dynamicArray: any[] = [];
  catList1: any[];
  monType: any;
  assetstatus: any;
  filterempNo1: any;
  filterempName1: any;
  filterempDesg1: any;
  filterempDept1: any;
  filterassetState: any;
  filterusageType: any;
  filtersearch: any;
  filtersearchType: any;
  today = new Date();
  filtercreationFromDate: any;
  filtercreationToDate: any;
  assetDataList: any[] = [];
  assetNo: string;
  baselocation: string;
  filterretirementDate: string;
  filterretirementReason: string;
  year: any;
  showData: boolean = false;
  filterReason: any;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient,
    private appServiceDate: AppService, private datePipe: DatePipe, private route: ActivatedRoute) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable();
  }

  ngOnInit() {
    this.path = this.router.url;
    this.showData = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.AssetExplorer.pageNo = 1;
    this.AssetExplorer.pageSize = 10;
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getCatList();
    this.getAssetStateList();
    this.getSizeList();
    this.getSoftType();
    this.getLicType();
    this.getDepartList();
    this.getMonType();
    this.getbase64image();
  }

  CategoryList: any[];
  getCatList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_CAT_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.catList = data;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.catList.sort((a, b) => { return collator.compare(a.name, b.name) });
        this.catList1 = this.catList.filter((item, i, arr) => arr.findIndex((t) => t.catCode === item.catCode) === i);
      }
    }).catch(error => {
      this.catList = [];
    });
  }
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'catName',
    textField: 'catName',
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

  clearFilter() {
    this.filterlocation = '';
    this.filterassetType = '';
    this.filterusageType = '';
    this.filtersearch = '';
    this.filtersearchType = '';
    this.filterassetState = '';
    this.filtercreationFromDate = '';
    this.filtercreationToDate = '';
    this.assetDataList = [];
  }

  clearFilterUTU() {
    this.filterempNo1 = '';
    this.filterempName1 = '';
    this.filterempDesg1 = '';
    this.filterempDept1 = '';
  }

  clearFilterLTL() {
    this.filternewLocation = '';
    this.filterReason = '';
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  getSizeList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_STORAGE_SIZE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.sizeList = data;
        console.log(this.sizeList);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.sizeList = [];
    });
  }

  getStorageSize(id) {
    let temp = this.sizeList.find(x => x.storId == id);
    return temp ? temp.storTxt : '';
  }

  getSoftType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_SOFTWARE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.softType = data;
        console.log(this.softType);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.softType = [];
    });
  }

  getSoftTypename(id) {
    let temp = this.softType.find(x => x.softId == id);
    return temp ? temp.softStxt : '';
  }

  getLicType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_LICENSE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.licType = data;
        console.log(this.licType);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.licType = [];
    });
  }

  getLicTypename(id) {
    let temp = this.licType.find(x => x.licId == id);
    return temp ? temp.licStxt : '';
  }

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.monType = [];
    });
  }

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.assStateList = data;
      }
    }).catch(error => {
      // this.isLoading = false;
      this.assStateList = [];
    });
  }

  image: string;
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

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
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

  getAssetDetails() {
    if (this.filterlocation == null || this.filterlocation == '') {
      toastr.error("Please select Location..");
      return;
    }
    else if (this.filterassetType == null || this.filterassetType == '') {
      toastr.error("Please select Category..");
      return;
    }
    else {
      this.assetDataList = [];
      this.getData();
    }
  }

  getData() {
    this.isLoading = true;
    var filterModel: any = {};
    filterModel.location = this.filterlocation.map(x => x.code).join();
    filterModel.category = this.filterassetType.map(x => x).join();
    filterModel.usageType = this.filterusageType;
    filterModel.assetState = this.filterassetState;
    filterModel.assetSearchType = this.filtersearchType;
    filterModel.assetSearch = this.filtersearch;
    filterModel.fromdate = this.filtercreationFromDate ? this.setFormatedDate(this.filtercreationFromDate) : null;
    filterModel.todate = this.filtercreationToDate ? this.setFormatedDate(this.filtercreationToDate) : null;
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_SEARCH_DATA, filterModel).then((data: any) => {
      if (data) {
        this.assetDataList = data.table1;
        this.AssetExplorer.totalCount = data.table[0].totalCount;
        this.AssetExplorer.totalPages = data.table[0].totalPages;
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.reInitDatatable();
    });
  }

  isMasterSel: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.assetDataList.length; i++) {
      this.assetDataList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }

  isAllSelected() {
    this.isMasterSel = this.assetDataList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }

  strassetId: string;
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.assetDataList.length; i++) {
      if (this.assetDataList[i].isSelected)
        this.checkedlist.push(this.assetDataList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  view: boolean = false;
  ApplyForAsset(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.isEdit = isedit;
    this.errMsgPop = "";
    if (this.isEdit) {
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }

  getUserMasterListByIdFilter(id: string) {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_ID, id).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i) => {
          i.name = i.firstName + '-' + i.employeeId + '-' + i.department +
            '-' + i.designation; return i;
        });
        this.initDatatable();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }

  setDet(mtrl: string) {
    var self = this;
    if (mtrl.length >= 3) {
      this.getUserMasterListByIdFilter(mtrl);
    } else {
      this.empListCon = [];
    }
    var data = this.empListCon;
    $('#empNo').autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.employeeId.includes(mtrl));
        response(result.map((i) => {
          i.label = i.firstName + '-' + i.employeeId + '-' + i.designation + '-' + i.department,
            i.name = i.firstName, i.empNo = i.employeeId, i.designation = i.designation,
            i.department = i.department; return i;
        }));
      },
      select: function (event, ui) {
        self.AddAssetmodel.empNo = ui.item.empNo;
        self.AddAssetmodel.empAd = ui.item.name;
        self.filterdesg = ui.item.designation;
        self.filterdept = ui.item.department;
        return false;
      }
    });
  }

  setDet1(mtrl: string) {
    var self = this;
    if (mtrl.length >= 3) {
      this.getUserMasterListByIdFilter(mtrl);
    } else {
      this.empListCon = [];
    }
    var data = this.empListCon;
    $('#empNo1').autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.employeeId.includes(mtrl));
        response(result.map((i) => {
          i.label = i.firstName + '-' + i.employeeId + '-' + i.designation + '-' + i.department,
            i.name = i.firstName + i.lastName, i.empNo = i.employeeId, i.designation = i.designation,
            i.department = i.department; return i;
        }));
      },
      select: function (event, ui) {
        self.filterempNo1 = ui.item.empNo;
        self.filterempName1 = ui.item.name;
        self.filterempDesg1 = ui.item.designation;
        self.filterempDept1 = ui.item.department;
        return false;
      }
    });
  }

  setList(asset) {
    if (asset.length > 5) {
      var self = this;
      var filterModel: any = {};
      $('#assetNo1').autocomplete({
        source: function (request, response) {
          filterModel.input = asset;
          let connection = self.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel);
          connection.then((data: any) => {
            if (data) {
              let result = data;
              self.assetList = data;
              response(result.map((i) => { i.label = i.assetNo; return i; }));
            }
          }).catch(error => {
          });
        },
        select: function (event, ui) {
          self.filterassetId1 = ui.item.assetId;
          self.filterlocation1 = ui.item.location;
          self.filtercategory1 = ui.item.category;
          self.filterbarcode1 = ui.item.barCode;
          self.filtermodel1 = ui.item.model;
          self.filtermanufacturer1 = ui.item.manufacturer;
          self.filterpartNo1 = ui.item.partNo;
          self.filterserialNo1 = ui.item.serialNo;
          self.filterempNo1 = ui.item.empNo;
          self.filterprocessor1 = ui.item.processor;
          self.filterram1 = ui.item.ram;
          self.filterassetNo1 = ui.item.assetNo;
          self.filterhdd1 = ui.item.hdd;
          self.filteripNo1 = ui.item.ipAddress;
          self.filtergxp1 = ui.item.gxPApplicable;
          self.filterconfig1 = ui.item.config;
          self.filterempName1 = ui.item.empAd;
          return false;
        }
      });
    }
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  getDept(id) {
    let temp = this.departmentList.find(x => x.id == id);
    return temp ? temp.name : '';
  }

  rowcount: number = 0;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, filtersoftType: null, filtersoftName: "", filterlicType: null, filterprodKey: "", filterversion: "", filterexpDate: null };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }

  subCategorylist: any[] = []
  GetSubCategory(type) {
    this.subCategorylist = this.catList.filter(x => x.catCode == type);
  }

  currentUser: AuthData;
  AddAssetmodel = {} as AssetExplorer;
  RepAssetmodel = {} as AssetExplorer;
  softwareList: any[] = [];

  // For New Asset
  onSubmit() {
    this.errMsg = "";
    this.isLoading = true;
    this.softwareList = [];
    let connection: any;
    if (!this.isEdit) {
      this.AddAssetmodel.createdBy = this.currentUser.employeeId;
      this.AddAssetmodel.poDate = this.AddAssetmodel.poDate ? this.setFormatedDate(this.AddAssetmodel.poDate) : null;
      this.AddAssetmodel.invoiceDate = this.AddAssetmodel.invoiceDate ? this.setFormatedDate(this.AddAssetmodel.invoiceDate) : null;
      this.AddAssetmodel.installationDate = this.AddAssetmodel.installationDate ? this.setFormatedDate(this.AddAssetmodel.installationDate) : null;
      this.AddAssetmodel.dateOfIssue = this.AddAssetmodel.dateOfIssue ? this.setFormatedDate(this.AddAssetmodel.dateOfIssue) : null;
      this.AddAssetmodel.systemRevalidationDate = this.AddAssetmodel.systemRevalidationDate ? this.setFormatedDate(this.AddAssetmodel.systemRevalidationDate) : null;
      this.AddAssetmodel.preventiveMaintenace = this.AddAssetmodel.preventiveMaintenace ? this.setFormatedDate(this.AddAssetmodel.preventiveMaintenace) : null;
      this.AddAssetmodel.warrantyExpiration = this.AddAssetmodel.warrantyExpiration ? this.setFormatedDate(this.AddAssetmodel.warrantyExpiration) : null;
      this.AddAssetmodel.hostName = this.AddAssetmodel.assetNo;
      this.AddAssetmodel.installationType = this.AddAssetmodel.replacementType;
      this.dynamicArray.forEach(mtrl => {
        let filtermodel: any = {};
        filtermodel.otherSoftwareName = mtrl.filtersoftName;
        filtermodel.softwareType = mtrl.filtersoftType;
        filtermodel.licenseType = mtrl.filterlicType;
        filtermodel.otherProductKey = mtrl.filterprodKey;
        filtermodel.otherVersion = mtrl.filterversion;
        filtermodel.otherExpiryOn = mtrl.filterexpDate ? this.setFormatedDate(mtrl.filterexpDate) : null;
        this.softwareList.push(filtermodel);
      });

      this.AddAssetmodel.softwares = this.softwareList;
      connection = this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_DATA, this.AddAssetmodel);
    }
    connection.then((output: any) => {
      if (output.success == true) {
        if (this.AddAssetmodel.usageType == 'User') {
          this.sendMail(output)
        }
        swal({
          title: "Message",
          text: "Asset created successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearAllEntries();
        this.closeSaveModal();
        this.isLoading = false;
      }
      else {
        swal({
          title: "Message",
          text: output.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.AddAssetmodel.serialNo = '';
        this.isLoading = false;
      }
    }).catch(error => {
      this.errMsgPop = 'Error saving Request..';
    });
  }

  sendMail(output) {
    output.employeeId = this.AddAssetmodel.empNo;
    output.lastName = this.AddAssetmodel.assetNo;
    output.middleName = this.AddAssetmodel.category;
    let connection = this.httpService.post(APIURLS.BR_AMS_MAIL_FOR_NEW_ASSET, output);
    connection.then((data: any) => {
      this.isLoading = false;
    }).catch(error => {
      this.errMsgPop = 'Error Sending Mail ..';
    });
  }

  sendTESTMail() {
    var filterModel: any = {};
    filterModel.employeeId = '130299';
    filterModel.lastName = 'ML00SCN002';
    filterModel.middleName = 'Scanner';
    let connection = this.httpService.post(APIURLS.BR_AMS_MAIL_FOR_NEW_ASSET, filterModel);
    connection.then((data: any) => {
      this.isLoading = false;
    }).catch(error => {
      this.errMsgPop = 'Error Sending Mail ..';
    });
  }

  // For Replacement of Asset
  onSubmit1() {
    this.errMsg = "";
    let connection: any;
    this.softwareList = [];
    if (!this.isEdit) {
      let value = this.assetList.find(x => x.assetId == this.filterassetId1);
      this.RepAssetmodel = Object.assign({}, value);
      this.RepAssetmodel.assetId = this.filterassetId1;
      this.RepAssetmodel.assetNo = this.AddAssetmodel.assetNo;
      this.RepAssetmodel.hostName = this.AddAssetmodel.assetNo;
      this.RepAssetmodel.replacementType = this.AddAssetmodel.replacementType;
      this.RepAssetmodel.installationType = this.AddAssetmodel.replacementType;
      this.RepAssetmodel.barCode = this.AddAssetmodel.barCode;
      this.RepAssetmodel.model = this.AddAssetmodel.model;
      this.RepAssetmodel.manufacturer = this.AddAssetmodel.manufacturer;
      this.RepAssetmodel.partNo = this.AddAssetmodel.partNo;
      this.RepAssetmodel.serialNo = this.AddAssetmodel.serialNo;
      this.RepAssetmodel.processor = this.AddAssetmodel.processor;
      this.RepAssetmodel.ram = this.AddAssetmodel.ram;
      this.RepAssetmodel.ramSize = this.AddAssetmodel.ramSize;
      this.RepAssetmodel.sizeType = this.AddAssetmodel.sizeType;
      this.RepAssetmodel.ipAddress = this.AddAssetmodel.ipAddress;
      this.RepAssetmodel.hdd = this.AddAssetmodel.hdd;
      this.RepAssetmodel.config = this.AddAssetmodel.config;
      this.RepAssetmodel.monitorType = this.AddAssetmodel.monitorType;
      this.RepAssetmodel.assetState = this.AddAssetmodel.assetState;
      this.RepAssetmodel.natureofActivities = this.AddAssetmodel.natureofActivities;
      this.RepAssetmodel.ponumber = this.AddAssetmodel.ponumber;
      this.RepAssetmodel.supplierName = this.AddAssetmodel.supplierName;
      this.RepAssetmodel.invoiceNumber = this.AddAssetmodel.invoiceNumber;
      this.RepAssetmodel.value = this.AddAssetmodel.value;
      this.RepAssetmodel.remarks = this.AddAssetmodel.remarks;
      this.RepAssetmodel.poDate = this.AddAssetmodel.poDate ? this.setFormatedDate(this.AddAssetmodel.poDate) : null;
      this.RepAssetmodel.invoiceDate = this.AddAssetmodel.invoiceDate ? this.setFormatedDate(this.AddAssetmodel.invoiceDate) : null;
      this.RepAssetmodel.installationDate = this.AddAssetmodel.installationDate ? this.setFormatedDate(this.AddAssetmodel.installationDate) : null;
      this.RepAssetmodel.dateOfIssue = this.AddAssetmodel.dateOfIssue ? this.setFormatedDate(this.AddAssetmodel.dateOfIssue) : null;
      this.RepAssetmodel.systemRevalidationDate = this.AddAssetmodel.systemRevalidationDate ? this.setFormatedDate(this.AddAssetmodel.systemRevalidationDate) : null;
      this.RepAssetmodel.preventiveMaintenace = this.AddAssetmodel.preventiveMaintenace ? this.setFormatedDate(this.AddAssetmodel.preventiveMaintenace) : null;
      this.RepAssetmodel.warrantyExpiration = this.AddAssetmodel.warrantyExpiration ? this.setFormatedDate(this.AddAssetmodel.warrantyExpiration) : null;
      this.RepAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.RepAssetmodel.viewStatusApprover = null;
      this.RepAssetmodel.statusApprovedDate = null;
      this.RepAssetmodel.reportViewStatus = 0;

      if (this.AddAssetmodel.usageType == 'User' || this.AddAssetmodel.usageType == 'Field Staff') {
        this.RepAssetmodel.comDept = '';
        this.RepAssetmodel.comFloor = '';
        this.RepAssetmodel.usageType = this.AddAssetmodel.usageType;
        this.RepAssetmodel.instName = '';
        this.RepAssetmodel.instType = '';
        this.RepAssetmodel.version = '';
        this.RepAssetmodel.software = '';
        this.RepAssetmodel.instName = '';
        this.RepAssetmodel.empNo = this.AddAssetmodel.empNo;
        this.RepAssetmodel.empAd = this.AddAssetmodel.empAd;
      }
      else if (this.AddAssetmodel.usageType == 'Common') {
        this.RepAssetmodel.comDept = this.AddAssetmodel.comDept;
        this.RepAssetmodel.comFloor = this.AddAssetmodel.comFloor;
        this.RepAssetmodel.usageType = this.AddAssetmodel.usageType;
        this.RepAssetmodel.instName = '';
        this.RepAssetmodel.instType = '';
        this.RepAssetmodel.version = '';
        this.RepAssetmodel.software = '';
        this.RepAssetmodel.instName = '';
        this.RepAssetmodel.empNo = '';
        this.RepAssetmodel.empAd = '';
      }
      else {
        this.RepAssetmodel.comDept = '';
        this.RepAssetmodel.comFloor = '';
        this.RepAssetmodel.usageType = this.AddAssetmodel.usageType;
        this.RepAssetmodel.instName = this.AddAssetmodel.instName;
        this.RepAssetmodel.instType = this.AddAssetmodel.instType;
        this.RepAssetmodel.version = this.AddAssetmodel.version;
        this.RepAssetmodel.software = this.AddAssetmodel.software;
        this.RepAssetmodel.instName = '';
        this.RepAssetmodel.empNo = '';
        this.RepAssetmodel.empAd = '';
      }
      this.dynamicArray.forEach(mtrl => {
        let filtermodel: any = {};
        filtermodel.otherSoftwareName = mtrl.filtersoftName;
        filtermodel.softwareType = mtrl.filtersoftType;
        filtermodel.licenseType = mtrl.filterlicType;
        filtermodel.otherProductKey = mtrl.filterprodKey;
        filtermodel.otherVersion = mtrl.filterversion;
        filtermodel.otherExpiryOn = mtrl.filterexpDate;
        this.softwareList.push(filtermodel);
      });
      this.RepAssetmodel.softwares = this.softwareList;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.RepAssetmodel.assetId, this.RepAssetmodel);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (this.AddAssetmodel.usageType == 'User') {
        this.sendMail(output)
      }
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Asset details changed successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearAllEntries();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  clearAllEntries() {
    this.filterassetNo1 = null;
    this.filtercondition = null;
    this.AddAssetmodel = new AssetExplorer();
    this.dynamicArray = [];
  }

  resetFormD() {
    this.errMsg = "";
    this.AssetExplorer.vendorcode = null;
    this.AssetExplorer.vendorname = null;
    this.AssetExplorer.vendorcity = null;
    this.AssetExplorer.dateofInvoive = null;
    this.AssetExplorer.numberofInvoice = null;
    this.AssetExplorer.deliveryChallanDate = null;
    this.AssetExplorer.deliveryChallanNo = null;
  }

  resetFormR() {
    this.errMsg = "";
    this.AssetExplorer.retirementReason = '';
    this.AssetExplorer.dateOfRetirement = null;
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  AssetExplorer = {} as AssetExplorer;
  printInstallationReport(AssetExplorer: AssetExplorer) {
    this.AssetExplorer = Object.assign({}, AssetExplorer);
    this.getSoftwaresList(this.AssetExplorer.assetId);
    this.getApprover(this.AssetExplorer.empNo);
    swal({
      title: "Message",
      text: "Are you sure to print?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willsave) => {
      if (willsave) {
        this.onUserActions();
      }
    });
  }

  getSoftwaresList(assetId) {
    var filterModel: any = {};
    filterModel.assetId = this.AssetExplorer.assetId;
    this.httpService.amsgetByParam(APIURLS.BR_GET_AMS_SOFTWARE_LIST, assetId).then((data: any) => {
      if (data.length > 0) {
        this.softwareList = data;
        console.log(this.softwareList);
      }
    }).catch(error => {
      this.softwareList = [];
    });
  }

  appDet: any[] = [];
  getApprover(employeeNumber) {
    var filterModel: any = {};
    filterModel.employeeNumber = this.AssetExplorer.empNo;
    this.httpService.amspost(APIURLS.BR_GET_AMS_APPROVER_DET, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.appDet = data;
        console.log(this.appDet);
      }
    }).catch(error => {
      this.appDet = [];
    });
  }

  onUserActions() {
    if (this.AssetExplorer.assetType == 'Computers') {
      var printContents = document.getElementById('pdf').innerHTML;
    } else if (this.AssetExplorer.assetType == 'Printers') {
      var printContents = document.getElementById('pdf1').innerHTML;
    } else if (this.AssetExplorer.assetType == 'Network') {
      var printContents = document.getElementById('pdf2').innerHTML;
    } else if (this.AssetExplorer.assetType == 'Others') {
      var printContents = document.getElementById('pdf3').innerHTML;
    } else {
      var printContents = document.getElementById('pdf4').innerHTML;
    }
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "IT ASSET INSTALLATION REPORT";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.datePipe.transform(now, 'dd/MM/yyyy');
    var logo = this.image;
    var assetfor = this.AssetExplorer.empName + " - " + this.AssetExplorer.department; //(asset alloted to)
    if (this.AssetExplorer.modified_by == null || this.AssetExplorer.modified_by == '') {
      var systemadmin = this.AssetExplorer.created_by + " - " + this.AssetExplorer.creatorName; //(employee printing report)
    }
    else {
      var systemadmin = this.AssetExplorer.modified_by + " - " + this.AssetExplorer.modifierName; //(employee printing report)
    }
    if (this.appDet.length > 0) {
      var depthead = this.appDet[0].approver_Name + " - " + this.appDet[0].approver_Department;
    }
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
        title: 'Asset Installtion Report',
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
      pageMargins: [40, 90, 40, 100],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
          columns: [
            {
              pageMargins: [40, 80, 40, 70],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [50, 400, 70],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 13, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    , { text: ReportName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' }, '']
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

              style: 'tableExample',
              color: '#444',
              stack: [
                {
                  table: {
                    widths: [175, 175, 175],
                    body: [
                      [{ text: systemadmin, fontSize: 10, color: 'blue', alignment: 'left', height: '*' },
                      { text: depthead, fontSize: 10, color: 'blue', alignment: 'left', height: '*' },
                      { text: assetfor, fontSize: 10, color: 'blue', alignment: 'left', height: '*' }
                      ],
                      [{ text: 'System Admin', fontSize: 10, alignment: 'left' },
                      { text: 'Department Head', fontSize: 10, alignment: 'left' },
                      { text: 'End User', fontSize: 10, alignment: 'left' }
                      ]
                    ]
                  }
                },
                {
                  alignment: 'right',
                  stack: [
                    { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' }
                  ],
                  bold: true,
                  fontSize: 8,
                }]
            },

          ],

          margin: 20
        }
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  statuslist: any[] = [
    { id: 6, name: 'Dispose' }
  ];

  // CustomizeOptions(assetNo)
  // {
  //   this.assetNo = assetNo;
  //   jQuery('customizeModal').modal('show');
  // }

  onAssetBarcode(assetNo) {
    let route = 'AssetLabelPrint/' + assetNo;
    this.router.navigate([route]);
  }

  ChangeAssetDetails(assetNo) {
    let route = 'ChangeAssetDetails/' + assetNo;
    this.router.navigate([route]);
  }

  RetireAsset(isedit: boolean, isprint: boolean, value: string) {
    if (this.filterassetState != 1 && this.filterassetState != 2 && this.filterassetState != 3 && this.filterassetState != 4) {
      toastr.error("Please select different Asset State...");
      return;
    }
    if (this.checkedRequestList.length == 0) {
      toastr.error("Please select assets from the table...");
      return;
    }
    this.isEdit = isedit;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";
    this.strassetId = "";
    this.getCheckedItemList();
    jQuery("#searchModal").modal('hide');
    jQuery('#retireModal').modal('show');
  }

  onRetireAsset() {
    this.errMsg = "";
    let connection: any;
    if (this.AssetExplorer.dateOfRetirement == null) {
      toastr.error("Please mention the date of retirement..!");
      return;
    }
    else {
      this.AssetExplorer.strassetId = this.checkedRequestList.map(x => x.assetId).join();
      this.AssetExplorer.location = this.filterlocation.map(x => x.code).join();
      this.AssetExplorer.dateOfRetirement = this.setFormatedDate(this.AssetExplorer.dateOfRetirement);
      this.AssetExplorer.retirementReason = this.AssetExplorer.retirementReason;
      this.AssetExplorer.modifiedBy = this.currentUser.employeeId;
      this.AssetExplorer.viewStatusApprover = null;
      this.AssetExplorer.statusApprovedDate = null;
      this.AssetExplorer.reportViewStatus = 0;
      connection = this.httpService.amspost1(APIURLS.BR_AMS_RETIRE_ASSET, this.AssetExplorer);

      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.id >= 0) {
          swal({
            title: "Message",
            text: "Asset retired successfully ",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.resetFormD();
          this.closeSaveModal2();
          this.reInitDatatable();
          this.clearFilter();
          this.isLoading = false;
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving status..';
      });

    }
  }

  success: any;
  DisposeAsset(isedit: boolean, isprint: boolean, value: string) {
    if (this.filterassetState != 5) {
      toastr.error("Please select Asset State as 'RETIRED'...");
      return;
    }
    else if (this.checkedRequestList.length == 0) {
      toastr.error("Please select assets from the table...");
      return;
    }
    this.isEdit = isedit;
    this.success = null;
    this.assetstatus = 'Dispose';
    this.errMsg = "";
    this.errMsgPop = "";
    this.strassetId = "";
    this.getCheckedItemList();
    jQuery("#searchModal").modal('hide');
    jQuery('#disposeModal').modal('show');
  }

  onDisposeAsset() {
    this.errMsg = "";
    let connection: any;
    this.AssetExplorer.strassetId = this.checkedRequestList.map(x => x.assetId).join();
    this.AssetExplorer.location = this.filterlocation.map(x => x.code).join();
    this.AssetExplorer.modifiedBy = this.currentUser.employeeId;
    this.AssetExplorer.vendorcity = this.AssetExplorer.vendorcity;
    this.AssetExplorer.vendorcode = this.AssetExplorer.vendorcode;
    this.AssetExplorer.vendorname = this.AssetExplorer.vendorname;
    this.AssetExplorer.dateofInvoive = this.AssetExplorer.dateofInvoive;
    this.AssetExplorer.numberofInvoice = this.AssetExplorer.numberofInvoice;
    this.AssetExplorer.deliveryChallanNo = this.AssetExplorer.deliveryChallanNo;
    this.AssetExplorer.deliveryChallanDate = this.AssetExplorer.deliveryChallanDate;


    connection = this.httpService.amspost1(APIURLS.BR_GET_AMS_DISPOSE_ASSET, this.AssetExplorer);

    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.id >= 0) {
        swal({
          title: "Message",
          text: "Asset disposed successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.resetFormD();
        this.closeSaveModal1();
        this.reInitDatatable();
        this.clearFilter();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving status..';
    });

  }

  TransferAssetWithinLocation(isedit: boolean, isprint: boolean, value: string) {
    if (this.checkedRequestList.length == 0) {
      toastr.error("Please select an asset from the table...");
      return;
    }
    else if (this.checkedRequestList.length > 1) {
      toastr.error("Please select only one asset from the table...");
      return;
    }
    this.isEdit = isedit;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";
    this.strassetId = "";
    this.getCheckedItemList();
    this.filterempNo = this.checkedRequestList[0].empNo;
    this.filterempName = this.checkedRequestList[0].empName;
    this.filterempDesg = this.checkedRequestList[0].designation;
    this.filterempDept = this.checkedRequestList[0].department;
    jQuery("#searchModal").modal('hide');
    jQuery('#transferinModal').modal('show');
  }

  OnTransferWithinLocation() {
    if (this.filterempNo == this.filterempNo1) {
      toastr.error("Asset cannot be transferred tot he same user...!");
      this.filterempNo1 = '';
      this.filterempName1 = '';
      this.filterempDesg1 = '';
      this.filterempDept1 = '';
      this.filterReason = '';
      return;
    }
    else if (this.filterReason == null || this.filterReason == '') {
      toastr.error("Please enter Transfer Reason..!");
      return;
    }
    this.errMsg = "";
    let connection: any;
    this.AssetExplorer.strassetId = this.checkedRequestList.map(x => x.assetId).join();
    this.AssetExplorer.empNo = this.filterempNo1;
    this.AssetExplorer.empAd = this.filterempName1;
    this.AssetExplorer.location = this.checkedRequestList[0].location;
    this.AssetExplorer.assetType = this.checkedRequestList[0].assetType;
    this.AssetExplorer.reasonForTransfer = this.filterReason;
    this.AssetExplorer.modifiedBy = this.currentUser.employeeId;
    connection = this.httpService.amspost1(APIURLS.BR_AMS_TRANSFER_UTU_ASSET_DATA, this.AssetExplorer);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200) {
        swal({
          title: "Message",
          text: "Asset transfered successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
        this.clearFilterUTU();
        this.closeSaveModal3();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  filtercurrAssetNo: any;
  filtercurrLocation: any;
  filtercurrSerialNo: any;
  filtercurrManu: any;
  filtercurrStatus: any;
  filternewStatus: any;
  TransferAssetDiffLocation(isedit: boolean, isprint: boolean, value: string) {
    if (this.checkedRequestList.length == 0) {
      toastr.error("Please select an asset from the table...");
      return;
    }
    else if (this.checkedRequestList.length > 1) {
      toastr.error("Please select only one asset from the table...");
      return;
    }
    this.isEdit = isedit;
    this.success = null;
    this.errMsg = "";
    this.errMsgPop = "";
    this.strassetId = "";
    this.getCheckedItemList();
    this.filtercurrAssetNo = this.checkedRequestList[0].assetNo;
    this.filtercurrLocation = this.checkedRequestList[0].location;
    this.filtercurrSerialNo = this.checkedRequestList[0].serialNo;
    this.filtercurrManu = this.checkedRequestList[0].manufacturer;
    this.filtercurrStatus = this.checkedRequestList[0].status;
    this.filternewStatus = 'Transferred'
    jQuery("#searchModal").modal('hide');
    jQuery('#transferoutModal').modal('show');
  }

  filternewLocation: any;
  OnTransferDiffLocation() {
    if (this.filtercurrLocation == this.filternewLocation) {
      toastr.error("Asset cannot be transferred to the same location as previous one..!");
      return;
    }
    this.errMsg = "";
    let connection: any;
    var filterModel: any = {};
    this.AssetExplorer.strassetId = this.checkedRequestList.map(x => x.assetId).join();
    this.AssetExplorer.assetNo = this.filtercurrAssetNo;
    this.AssetExplorer.location = this.filtercurrLocation;
    this.AssetExplorer.newLocation = this.filternewLocation;
    this.AssetExplorer.assetState = this.filtercurrStatus;
    this.AssetExplorer.newassState = this.filternewStatus;
    this.AssetExplorer.reasonForTransfer = this.filterReason;
    this.AssetExplorer.transferredBy = this.currentUser.employeeId;
    this.AssetExplorer.pendingApprover = '130537';
    this.AssetExplorer.lastApprover = '';
    connection = this.httpService.amspost1(APIURLS.BR_AMS_TRANSFER_LTL_ASSET_DATA, this.AssetExplorer);
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200) {
        swal({
          title: "Message",
          text: "Asset transfered successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
        this.clearFilterLTL();
        this.closeSaveModal4();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
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

  auditLogList: AuditLogAMS[] = [];
  openAuditLogs(asset_ID) {
    jQuery("#auditModal").modal('show');
    let stringparms = asset_ID;
    this.httpService.amsgetByParam(APIURLS.BR_AMS_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch(() => {
    });
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  closeSaveModal1() {
    jQuery("#disposeModal").modal('hide');
  }
  closeSaveModal2() {
    jQuery("#retireModal").modal('hide');
  }
  closeSaveModal3() {
    jQuery("#transferinModal").modal('hide');
  }
  closeSaveModal4() {
    jQuery("#transferoutModal").modal('hide');
  }
}
