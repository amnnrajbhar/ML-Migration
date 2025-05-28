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

@Component({
  selector: 'app-AssetExplorer',
  templateUrl: './AssetExplorer.component.html',
  styleUrls: ['./AssetExplorer.component.css']
})

export class AssetExplorerComponent implements OnInit {
@ViewChild(NgForm, { static: false }) detailsForm!: NgForm;

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
  filterassettype: string
  location: any;
  locationAllList: any;
  locListCon: any;
  designationList!: any[];
  userList: any;
  empListCon: any;
  baseLocation!: number;
  departmentList: any;
  filterdesg: any;
  filterdept: any;
  filterassetNo: string
  filterassetNo1: string
  filtercategory1: string
  filtersubCategory1: string
  filterbarcode1: string
  filtermodel1: string
  filterpartNo1: string
  filtermanufacturer1: string
  filterserialNo1: string
  filterprocessor1: string
  filterram1!: number;
  filtersize: string
  filterhdd1!: number;
  assetList: any;
  filteripNo1: any;
  filtergxp1: any;
  filterconfig1: any;
  row: any;
  sizeList: any[] = [];
  softType: any;
  licType: any;
  isSubmitted = false;
  filterchoice: string
  filterassetId1: any;
  filterlocation1: any;
  filtercondition: any;
  dataSource!: any[];
  newDynamic!: {};
  dynamicArray: any[] = [];
  catList1!: any[];
  monType: any;
  filterempNo1: any;
  filterempName1: any;


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable();
  }

  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getCatList();
    this.getAssetStateList();
    this.getLocationMaster();
    this.getUserMasterList();
    this.getSizeList();
    this.getSoftType();
    this.getLicType();
    this.getAssetList();
    this.getDepartList();
    this.getMonType();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    // this.addRow();
  }

  CategoryList!: any[];
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

  getSizeList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_STORAGE_SIZE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.sizeList = data;
        console.log(this.sizeList);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.sizeList = [];
    });
  }

  getSoftType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_SOFTWARE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.softType = data;
        console.log(this.softType);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.softType = [];
    });
  }

  getLicType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_LICENSE_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.licType = data;
        console.log(this.licType);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.licType = [];
    });
  }

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.monType = [];
    });
  }

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.assStateList = data;
        console.log(this.assStateList);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.assStateList = [];
    });
  }

  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  plantList:any[]=[];
  getPlantsassigned(id:any)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter((x:any)=>{ return x.isActive;}).map((i:any) => { i.location = i.code + '-' + i.name; return i; });
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });          
        this.plantList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  getUserMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i:any) => {
          i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.department +
            '-' + i.designation; return i;
        });
        this.initDatatable();
        this.isLoading = false;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.userList = [];
    });
  }

  setDet(mtrl:any) {
    var self = this;
    var data = this.empListCon;
    $('#empNo').autocomplete({
      source: function (request:any, response:any) {
        let result = data.filter((x:any)  => x.employeeId.includes(mtrl));;
        response(result.map((i:any) => {
          i.label = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation + '-' + i.department,
            i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName, i.empNo = i.employeeId, i.designation = i.designation,
            i.department = i.department; return i;
        }));
      },
      select: function (event:any, ui:any) {
        self.AddAssetmodel.empNo = ui.item.empNo;
        self.AddAssetmodel.empAd = ui.item.name;
        self.filterdesg = ui.item.designation;
        self.filterdept = ui.item.department;
        return false;
      }
    });
  }

  getAssetList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_DETAILS_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
        this.initDatatable();
        this.isLoading = false;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.assetList = [];
    });
  }

  setList(asset:any) {
    var self = this;
    var data = this.assetList;
    $('#assetNo1').autocomplete({
      source: function (request:any, response:any) {
        let result = data.filter((x:any)  => x.assetNo.includes(asset));
        response(result.map((i:any) => {
          i.label = i.assetNo; return i;
        }));
      },
      select: function (event:any, ui:any) {
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

  getDept(id:any) {
    let temp = this.departmentList.find((x:any)  => x.id == id);
    return temp ? temp.name : '';
  }

  rowcount: number = 0;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, filtersoftType: null, filtersoftName: "", filterlicType: null, filterprodKey: "", filterversion: "", filterexpDate: null };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item:any) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }

  statuslist: any[] = [
    { id: 1, name: 'In use' },
    { id: 2, name: 'In Repair' },
    { id: 3, name: 'Decomissioned' },
    { id: 4, name: 'In Store' },
    { id: 5, name: 'Retired' },
    { id: 6, name: 'Dispose' },
    { id: 7, name: 'Transferred' },
    { id: 8, name: 'Sold' }
  ];

  subCategorylist: any[] = []
  GetSubCategory(type) {
    this.subCategorylist = this.catList.filter((x:any)  => x.catCode == type);
  }

  currentUser!: AuthData;
  AddAssetmodel = {} as AssetExplorer;
  RepAssetmodel = {} as AssetExplorer;
  softwareList: any[] = [];

  // For New Asset
  onSubmit() {
    this.isLoading = true;
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      this.AddAssetmodel.createdBy = this.currentUser.employeeId;
      this.AddAssetmodel.poDate = this.AddAssetmodel.poDate ? this.setFormatedDate(this.AddAssetmodel.poDate):null;
      this.AddAssetmodel.invoiceDate = this.AddAssetmodel.invoiceDate ? this.setFormatedDate(this.AddAssetmodel.invoiceDate):null;
      this.AddAssetmodel.installationDate = this.AddAssetmodel.installationDate ? this.setFormatedDate(this.AddAssetmodel.installationDate):null;
      this.AddAssetmodel.dateOfIssue = this.AddAssetmodel.dateOfIssue ? this.setFormatedDate(this.AddAssetmodel.dateOfIssue):null;
      this.AddAssetmodel.systemRevalidationDate =  this.AddAssetmodel.systemRevalidationDate ? this.setFormatedDate(this.AddAssetmodel.systemRevalidationDate):null;
      this.AddAssetmodel.preventiveMaintenace = this.AddAssetmodel.preventiveMaintenace ? this.setFormatedDate(this.AddAssetmodel.preventiveMaintenace):null;
      this.AddAssetmodel.warrantyExpiration = this.AddAssetmodel.warrantyExpiration ? this.setFormatedDate(this.AddAssetmodel.warrantyExpiration):null;
      this.AddAssetmodel.hostName = this.AddAssetmodel.assetNo;
      this.AddAssetmodel.installationType = this.AddAssetmodel.replacementType;
      this.dynamicArray.forEach((mtrl:any) => {
        let filtermodel: any = {};
        filtermodel.otherSoftwareName = mtrl.filtersoftName;
        filtermodel.softwareType = mtrl.filtersoftType;
        filtermodel.licenseType = mtrl.filterlicType;
        filtermodel.otherProductKey = mtrl.filterprodKey;
        filtermodel.otherVersion = mtrl.filterversion;
        filtermodel.otherExpiryOn = mtrl.filterexpDate ? this.setFormatedDate(mtrl.filterexpDate):null;
        this.softwareList.push(filtermodel);
      });

      this.AddAssetmodel.softwares = this.softwareList;
      connection = this.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_DATA, this.AddAssetmodel);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {

        swal({
          title: "Message",
          text: "Asset No " + output.assetId + " created",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearAllEntries();
        this.isLoading = false;
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.isLoading = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  // For Replacement of Asset
  onSubmit1() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
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
      this.dynamicArray.forEach((mtrl:any) => {
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
    }).catch((error)=> {
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

  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate = 
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2)+ '-' +("00" + dt.getDate()).slice(-2)  ;
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

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
