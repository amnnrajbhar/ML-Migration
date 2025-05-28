import { Component, OnInit, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import swal from 'sweetalert';
import { ChangeAssetDetails } from './ChangeAssetDetails.model';
import { AuthData } from '../../auth/auth.model';
// import { FileSaver }  from 'angular-file-saver';
// //import { saveAs } from 'file-saver';
declare var $: any;

@Component({
  selector: 'app-ChangeAssetDetails',
  templateUrl: './ChangeAssetDetails.component.html',
  styleUrls: ['./ChangeAssetDetails.component.css']
})
export class ChangeAssetDetailsComponent implements OnInit {

  public tableWidget: any;
  dashboard: any = {};
  currentUser!: AuthData;
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
  dashboardcategory: any;
  dashboardassetstate: any;
  dashboardusage: any;
  filterstatus: any;
  filternature: any;
  filterhostName1: any;
  sizeList: any;
  filterram: any;
  filtersize: any;
  filterhdd: any;
  filtersize1: any;
  filterconfig: any;
  softType: any;
  licType: any;
  filtersoftType: any;
  filterlicType: any;
  filterprodKey: any;
  filtersoftName: any;
  filterversion: any;
  filterexpDate: any;
  dynamicArray: any[] = [];
  newDynamic!: { id: number; filtersoftType: any; filtersoftName: string; filterlicType: any; filterprodKey: string; filterversion: string ,filterexpDate: any; };
  filterval: any;
  filtersuppName: any;
  filterinsDate: any;
  filterwarDate: any;
  filtersrevDate: any;
  filterissDate: any;
  filterprevDate: any;
  filterusageType: any;
  filterusageType1: any;
  filterrem: any;
  filterchangetype: any;
  filtercomDept: any;
  filtercomFloor: any;
  filterinsName: any;
  filterinsType: any;
  filterconfig1: any;
  filtergxp1: any;
  filteripAddress1: any;
  filterhdd1: any;
  filterassetNo1: any;
  filterassetNo: any;
  filterram1: any;
  filterprocessor1: any;
  filterserialNo1: any;
  filterpartNo1: any;
  filtermanufacturer1: any;
  filtermodel1: any;
  filterbarcode1: any;
  filtercategory1: any;
  filterlocation1: any;
  filterassetId1: any;
  filterempNo: any;
  filterempName: any;
  filterempNo1: any;
  filterempAd1: any;
  departmentList: any;
  filtercurrstate: any;
  monType: any;
  filterpoNumber!: string
  filterpoDate!: string
  filterinvNumber!: string
  filterinvDate!: string
  filterdesg: any;
  filterdept: any;
  filtercomDept1: any;
  filtercomFloor1: any;
  filterinstName1: any;
  filterinstType1: any;
  filterinstSoft1: any;
  filterinstVer1: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable();
  }
  assetList: any[] = [];
  ngOnInit() {
    this.path = this.router.url;
    console.log(this.path);
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getCatList();
    this.getAssetStateList();
    this.getSizeList();
    this.getLicType();
    this.getSoftType();
    this.getMonType();
    this.getDepartList();
    this.getUserMasterList();
  }

  getCatList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_CAT_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.catList = data;
        console.log(this.catList);
      }
    }).catch((error)=> {
      // this.isLoading = false;
      this.catList = [];
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

  getstatus(id:any) {
    let temp = this.statuslist.find((x:any)  => x.id == id);
    return temp ? temp.name : '';
  }

  setList(asset:any) {
    if (asset.length > 5) {
      var self = this;
      var filterModel: any = {};
      $('#assetNo1').autocomplete({
        source: function (request:any, response:any) {
          filterModel.input = asset;
          let connection = self.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel);
          connection.then((data: any) => {
            if (data) {
              let result = data;
              self.assetList = data;
              response(result.map((i:any) => { i.label = i.assetNo; return i; }));
            }
          }).catch((error)=> {
          });
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
          self.filterprocessor1 = ui.item.processor;
          self.filterram1 = ui.item.ram;
          self.filterassetNo1 = ui.item.assetNo;
          self.filterhdd1 = ui.item.hdd;
          self.filteripAddress1 = ui.item.ipAddress;
          self.filtergxp1 = ui.item.gxPApplicable;
          self.filterconfig1 = ui.item.config;
          self.filtercurrstate = ui.item.assetState;
          self.filterpoNumber = ui.item.ponumber;
          self.filterpoDate = ui.item.podate;
          self.filterinvNumber = ui.item.invoiceNumber;
          self.filterinvDate = ui.item.invoiceDate;
          self.filtersuppName = ui.item.supplierName;
          self.filterval = ui.item.value;
          self.filterwarDate = ui.item.warrantyExpiration;
          self.filterinsDate = ui.item.installationDate;
          self.filterissDate = ui.item.dateOfIssue;
          self.filtersrevDate = ui.item.systemRevalidationDate;
          self.filterprevDate = ui.item.preventiveMaintenace;
          self.filterusageType = ui.item.usageType;
          self.filterempNo = ui.item.empNo;
          self.filterempName = ui.item.empAd;
          self.filtercomDept = ui.item.comDept;
          self.filtercomFloor = ui.item.comFloor;
          self.filterinsName = ui.item.instName;
          self.filterinsType = ui.item.instType;

          return false;
        }
      });
    }
  }


  userList: any;
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


  empListCon: any;
  setDet(mtrl:any) {
    var self = this;
    var data = this.empListCon;
    $('#empNo1').autocomplete({
      source: function (request:any, response:any) {
        let result = data.filter((x:any)  => x.employeeId.includes(mtrl));
        response(result.map((i:any) => {
          i.label = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation + '-' + i.department,
            i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName, i.empNo = i.employeeId, i.designation = i.designation,
            i.department = i.department; return i;
        }));
      },
      select: function (event:any, ui:any) {
        self.filterempNo1 = ui.item.empNo;
        self.filterempAd1 = ui.item.name;
        self.filterdesg = ui.item.designation;
        self.filterdept = ui.item.department;
        return false;
      }
    });
  }

  clearFilter() {
    this.filterchangetype = null;
  // this.filterstatus = null;
  this.filterstatus = '';
    this.filternature = null;
    this.filterram = null;
    this.filtersize = null;
    this.filterhdd = null;
    this.filtersize1 = null;
    this.filterconfig = null;
    this.filtersuppName = null;
    this.filterval = null;
    this.filterwarDate = null;
    this.filterinsDate = null;
    this.filterissDate = null;
    this.filtersrevDate = null;
    this.filterprevDate = null;
    this.filterrem = null;
    this.filterassetId1 = null;
    this.filterlocation1 = null;
    this.filtercategory1 = null;
    this.filterbarcode1 = null;
    this.filtermodel1 = null;
    this.filtermanufacturer1 = null;
    this.filterpartNo1 = null;
    this.filterserialNo1 = null;
    this.filterprocessor1 = null;
    this.filterram1 = null;
    this.filterassetNo1 = null;
    this.filterhdd1 = null;
    this.filteripAddress1 = null;
    this.filtergxp1 = null;
    this.filterconfig1 = null;
    this.filtercurrstate = null;
    this.filterval = null;
    this.filtersuppName = null;
    this.filterinsDate = null;
    this.filterwarDate = null;
    this.filtersrevDate = null;
    this.filterissDate = null;
    this.filterprevDate = null;
    this.filterusageType = null;
    this.filterusageType1 = null;
    this.filterrem = null;
    this.filterchangetype = null;
    this.filtercomDept = null;
    this.filtercomFloor = null;
    this.filterinsName = null;
    this.filterinsType = null;
    this.filterconfig1 = null;
    this.filtergxp1 = null;
    this.filteripAddress1 = null;
    this.filterhdd1 = null;
    this.filterassetNo1 = null;
    this.filterassetNo = null;
    this.filterram1 = null;
    this.filterprocessor1 = null;
    this.filterserialNo1 = null;
    this.filterpartNo1 = null;
    this.filtermanufacturer1 = null;
    this.filtermodel1 = null;
    this.filterbarcode1 = null;
    this.filtercategory1 = null;
    this.filterlocation1 = null;
    this.filterassetId1 = null;
    this.filterempNo = null;
    this.filterempName = null;
    this.filterempNo1 = null;
    this.filterempAd1 = null;
    this.filtercurrstate = null;
    this.filterpoNumber = null;
    this.filterpoDate = null;
    this.filterinvNumber = null;
    this.filterinvDate = null;
    this.filterdesg = null;
    this.filterdept = null;
    this.filtercomDept1 = null;
    this.filtercomFloor1 = null;
    this.filterinstName1 = null;
    this.filterinstType1 = null;
    this.filterinstSoft1 = null;
    this.filterinstVer1 = null;
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

  getStorageSize(id:any) {
    let temp = this.sizeList.find((x:any)  => x.storId == id);
    return temp ? temp.storTxt : '';
  }

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch((error)=> {
      this.monType = [];
    });
  }

  getMonitorType(id:any) {
    let temp = this.monType.find((x:any)  => x.id == id);
    return temp ? temp.type : '';
  }

  statuslist: any[] = [
    { id: 1, name: 'In use' },
    { id: 2, name: 'In Repair' },
    { id: 3, name: 'Decomissioned' },
    { id: 4, name: 'In Store' },
    { id: 5, name: 'Retired' },
    //{ id: 6, name: 'Dispose' },
    { id: 7, name: 'Transferred' },
    { id: 8, name: 'Sold' }
  ];

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

  ChangeAssetmodel = {} as ChangeAssetDetails;
  softwareList: any[] = [];

  //For updating the status of asset
  onUpdate1() {
    if (this.filtercurrstate == this.filterstatus) {
      alert("Status cannot be the same!")
    }
    else {
      this.errMsg = "";
      let connection: any;
      if (!this.isEdit) {
        let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
        this.ChangeAssetmodel = Object.assign({}, value);
        this.ChangeAssetmodel.assetState = this.statuslist.find((x:any)  => x.name == this.filterstatus).id;
        this.ChangeAssetmodel.natureofActivities = this.filternature;
        this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
        this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
        this.ChangeAssetmodel.ramSize = this.ChangeAssetmodel.ramSize != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.ramSize).id : null;
        this.ChangeAssetmodel.sizeType = this.ChangeAssetmodel.sizeType != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.sizeType).id : null;
        this.ChangeAssetmodel.comDept = this.ChangeAssetmodel.comDept != '' ? this.departmentList.find((x:any)  => x.name == this.ChangeAssetmodel.comDept).id : null;

        this.ChangeAssetmodel.viewStatusApprover = '';
        this.ChangeAssetmodel.statusApprovedDate = null;
        this.ChangeAssetmodel.reportViewStatus = 0;
        connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);
      }
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.assetId >= 0) {
          swal({
            title: "Message",
            text: "Asset status changed successfully ",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.clearFilter();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Request..';
      });
    }
  }

  //For updating the configurations of asset (only RAM)
  onUpdate2() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
      this.ChangeAssetmodel = Object.assign({}, value);
      this.ChangeAssetmodel.ram = this.filterram;
      this.ChangeAssetmodel.ramSize = this.filtersize;
      this.ChangeAssetmodel.config = this.filterconfig;
      this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.ChangeAssetmodel.assetState = this.ChangeAssetmodel.assetState != '' ? this.statuslist.find((x:any)  => x.name == this.ChangeAssetmodel.assetState).id : null;
      this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
      this.ChangeAssetmodel.sizeType = this.ChangeAssetmodel.sizeType != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.sizeType).id : null;
      this.ChangeAssetmodel.comDept = this.ChangeAssetmodel.comDept != '' ? this.departmentList.find((x:any)  => x.name == this.ChangeAssetmodel.comDept).id : null;
      this.ChangeAssetmodel.viewStatusApprover = '';
      this.ChangeAssetmodel.statusApprovedDate = null;
      this.ChangeAssetmodel.reportViewStatus = 0;

      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);

    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Asset configurations changed successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]

        });
        //this.assetList.find((x:any)  => x.assetId == this.filterassetId1).ramSize = this.filterram;

        this.clearFilter();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  //For updating the configurations of asset (only HDD)
  onUpdate7() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
      this.ChangeAssetmodel = Object.assign({}, value);
      this.ChangeAssetmodel.hdd = this.filterhdd;
      this.ChangeAssetmodel.sizeType = this.filtersize1;
      this.ChangeAssetmodel.config = this.filterconfig;
      this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.ChangeAssetmodel.assetState = this.ChangeAssetmodel.assetState != '' ? this.statuslist.find((x:any)  => x.name == this.ChangeAssetmodel.assetState).id : null;
      this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
      this.ChangeAssetmodel.ramSize = this.ChangeAssetmodel.ramSize != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.ramSize).id : null;
      this.ChangeAssetmodel.comDept = this.ChangeAssetmodel.comDept != '' ? this.departmentList.find((x:any)  => x.name == this.ChangeAssetmodel.comDept).id : null;
      this.ChangeAssetmodel.viewStatusApprover = '';
      this.ChangeAssetmodel.statusApprovedDate = null;
      this.ChangeAssetmodel.reportViewStatus = 0;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Asset configurations changed successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  //For updating the software details of asset
  onUpdate3() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
      this.ChangeAssetmodel = Object.assign({}, value);
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
      this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.ChangeAssetmodel.assetState = this.ChangeAssetmodel.assetState != '' ? this.statuslist.find((x:any)  => x.name == this.ChangeAssetmodel.assetState).id : null;
      this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
      this.ChangeAssetmodel.ramSize = this.ChangeAssetmodel.ramSize != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.ramSize).id : null;
      this.ChangeAssetmodel.sizeType = this.ChangeAssetmodel.sizeType != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.sizeType).id : null;
      this.ChangeAssetmodel.comDept = this.ChangeAssetmodel.comDept != '' ? this.departmentList.find((x:any)  => x.name == this.ChangeAssetmodel.comDept).id : null;
      this.ChangeAssetmodel.viewStatusApprover = '';
      this.ChangeAssetmodel.statusApprovedDate = null;
      this.ChangeAssetmodel.reportViewStatus = 0;
      this.ChangeAssetmodel.softwares = this.softwareList;
      this.ChangeAssetmodel.createdBy = this.currentUser.employeeId;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Asset software details saved successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  //For updating the purchase order details of asset
  onUpdate4() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
      this.ChangeAssetmodel = Object.assign({}, value);
      this.ChangeAssetmodel.ponumber = this.filterpoNumber;
      this.ChangeAssetmodel.podate = this.filterpoDate ? this.setFormatedDate(this.filterpoDate) : null;
      this.ChangeAssetmodel.invoiceNumber = this.filterinvNumber;
      this.ChangeAssetmodel.invoiceDate = this.filterinvDate ? this.setFormatedDate(this.filterinvDate) : null;
      this.ChangeAssetmodel.supplierName = this.filtersuppName;
      this.ChangeAssetmodel.value = this.filterval;
      this.ChangeAssetmodel.warrantyExpiration = this.filterwarDate ? this.setFormatedDate(this.filterwarDate) : null;
      this.ChangeAssetmodel.installationDate = this.filterinsDate ? this.setFormatedDate(this.filterinsDate) : null;
      this.ChangeAssetmodel.dateOfIssue = this.filterissDate ? this.setFormatedDate(this.filterissDate) : null;
      this.ChangeAssetmodel.systemRevalidationDate = this.filtersrevDate ? this.setFormatedDate(this.filtersrevDate) : null;
      this.ChangeAssetmodel.preventiveMaintenace = this.filterprevDate ? this.setFormatedDate(this.filterprevDate) : null;
      this.ChangeAssetmodel.remarks = this.filterrem;
      this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.ChangeAssetmodel.assetState = this.ChangeAssetmodel.assetState != '' ? this.statuslist.find((x:any)  => x.name == this.ChangeAssetmodel.assetState).id : null;
      this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
      this.ChangeAssetmodel.ramSize = this.ChangeAssetmodel.ramSize != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.ramSize).id : null;
      this.ChangeAssetmodel.sizeType = this.ChangeAssetmodel.sizeType != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.sizeType).id : null;
      this.ChangeAssetmodel.comDept = this.ChangeAssetmodel.comDept != '' ? this.departmentList.find((x:any)  => x.name == this.ChangeAssetmodel.comDept).id : null;
      this.ChangeAssetmodel.viewStatusApprover = '';
      this.ChangeAssetmodel.statusApprovedDate = null;
      this.ChangeAssetmodel.reportViewStatus = 0;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Purchase order details changed successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  //For updating the asset details of asset
  onUpdate10() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
      this.ChangeAssetmodel = Object.assign({}, value);
      this.ChangeAssetmodel.assetNo = this.filterassetNo;
      this.ChangeAssetmodel.hostName = this.filterhostName1;
      this.ChangeAssetmodel.barCode = this.filterbarcode1;
      this.ChangeAssetmodel.model = this.filtermodel1;
      this.ChangeAssetmodel.manufacturer = this.filtermanufacturer1;
      this.ChangeAssetmodel.partNo = this.filterpartNo1;
      this.ChangeAssetmodel.serialNo = this.filterserialNo1;
      this.ChangeAssetmodel.gxPApplicable = this.filtergxp1;
      this.ChangeAssetmodel.config = this.filterconfig1;
      this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.ChangeAssetmodel.assetState = this.ChangeAssetmodel.assetState != '' ? this.statuslist.find((x:any)  => x.name == this.ChangeAssetmodel.assetState).id : null;
      this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
      this.ChangeAssetmodel.ramSize = this.ChangeAssetmodel.ramSize != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.ramSize).id : null;
      this.ChangeAssetmodel.sizeType = this.ChangeAssetmodel.sizeType != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.sizeType).id : null;
      this.ChangeAssetmodel.comDept = this.ChangeAssetmodel.comDept != '' ? this.departmentList.find((x:any)  => x.name == this.ChangeAssetmodel.comDept).id : null;
      this.ChangeAssetmodel.viewStatusApprover = '';
      this.ChangeAssetmodel.statusApprovedDate = null;
      this.ChangeAssetmodel.reportViewStatus = 0;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);
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
        this.clearFilter();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  //For updating the usage type of asset
  onUpdate15() {
    if (this.filterusageType1 == this.filterusageType) {
      alert("Please select different Usage Type..!");
      return;
    }
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId1);
      this.ChangeAssetmodel = Object.assign({}, value);
      if (this.filterusageType1 == 'User' || this.filterusageType1 == 'Field Staff') {
        this.ChangeAssetmodel.usageType = this.filterusageType1;
        this.ChangeAssetmodel.comDept = '';
        this.ChangeAssetmodel.comFloor = '';
        this.ChangeAssetmodel.instName = '';
        this.ChangeAssetmodel.instType = '';
        this.ChangeAssetmodel.software = '';
        this.ChangeAssetmodel.version = '';
        this.ChangeAssetmodel.empNo = this.filterempNo1;
        this.ChangeAssetmodel.empAd = this.filterempAd1;
      }
      else if (this.filterusageType1 == 'Common') {

        this.ChangeAssetmodel.usageType = this.filterusageType1;
        this.ChangeAssetmodel.comDept = this.filtercomDept1;
        this.ChangeAssetmodel.comFloor = this.filtercomFloor1;
        this.ChangeAssetmodel.instName = '';
        this.ChangeAssetmodel.instType = '';
        this.ChangeAssetmodel.software = '';
        this.ChangeAssetmodel.version = '';
        this.ChangeAssetmodel.empNo = '';
        this.ChangeAssetmodel.empAd = '';
      }
      else {
        this.ChangeAssetmodel.usageType = this.filterusageType1;
        this.ChangeAssetmodel.comDept = '';
        this.ChangeAssetmodel.comFloor = '';
        this.ChangeAssetmodel.instName = this.filterinstName1;
        this.ChangeAssetmodel.instType = this.filterinstType1;
        this.ChangeAssetmodel.software = this.filterinstSoft1;
        this.ChangeAssetmodel.version = this.filterinstVer1;
        this.ChangeAssetmodel.empNo = '';
        this.ChangeAssetmodel.empAd = '';
      }
      this.ChangeAssetmodel.modifiedBy = this.currentUser.employeeId;
      this.ChangeAssetmodel.assetState = this.ChangeAssetmodel.assetState != '' ? this.statuslist.find((x:any)  => x.name == this.ChangeAssetmodel.assetState).id : null;
      this.ChangeAssetmodel.monitorType = this.ChangeAssetmodel.monitorType != '' ? this.monType.find((x:any)  => x.type == this.ChangeAssetmodel.monitorType).id : null;
      this.ChangeAssetmodel.ramSize = this.ChangeAssetmodel.ramSize != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.ramSize).id : null;
      this.ChangeAssetmodel.sizeType = this.ChangeAssetmodel.sizeType != '' ? this.sizeList.find((x:any)  => x.storTxt == this.ChangeAssetmodel.sizeType).id : null;
      this.ChangeAssetmodel.viewStatusApprover = '';
      this.ChangeAssetmodel.statusApprovedDate = null;
      this.ChangeAssetmodel.reportViewStatus = 0;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.ChangeAssetmodel.assetId, this.ChangeAssetmodel);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Asset Usage type changed successfully ",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
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

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
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
    ////console.log('testpop')
    jQuery("#myModal").modal('hide');
    // this.getEvents();
    // window.location.reload();
  }

}
