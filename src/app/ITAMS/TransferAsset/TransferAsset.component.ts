import { Component, OnInit, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { AuthData } from '../../auth/auth.model';
import { HttpService } from '../../shared/http-service';
import { TransferAsset } from './TransferAsset.model';
import swal from 'sweetalert';
import { filter } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-TransferAsset',
  templateUrl: './TransferAsset.component.html',
  styleUrls: ['./TransferAsset.component.css']
})
export class TransferAssetComponent implements OnInit {

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
  filterram: any;
  filtersize: any;
  filterhdd: any;
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
  newDynamic!: { id: number; filtersoftType: any; filtersoftName: string ;filterlicType: any; filterprodKey: string; filterversion: string ;filterexpDate: any; };
  filterval: any;
  filtersuppName: any;
  filterinsDate: any;
  filterwarDate: any;
  filtersrevDate: any;
  filterissDate: any;
  filterprevDate: any;
  filterrem: any;
  locationAllList: any;
  locListCon: any;
  filterassetId: any;
  filterlocation: any;
  filtercategory: any;
  assetList: any[] = [];
  filtermodel: any;
  filtermanufacturer: any;
  filterpartNo: any;
  filterserialNo: any;
  filterprocessor: any;
  filtercurrstate: any;
  filterassetNo: any;
  filteripNo: any;
  filterempNo: any;
  filterempName: any;
  filterempDept: any;
  filterempDesg: any;
  empListCon: any;
  userList: any;
  filterempNo1: any;
  filterempName1: any;
  filterempDesg1: any;
  filterempDept1: any;
  filtertransfer: any;
  sizeList: any[] = [];
  monType: any[] = [];
  departmentList: any;

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
    console.log(this.path);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getAssetStateList();
    this.getLocationMaster();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getUserMasterList();
    this.getSizeList();
    this.getMonType();
    this.getDepartList();
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
  
  setList(asset:any) {
    if (asset.length > 5) {
      var self = this;
      var filterModel: any = {};
        $('#assetNo').autocomplete({
          source: function (request:any, response:any) {
            filterModel.input = asset;
            let connection = self.httpService.amspost(APIURLS.BR_GET_AMS_ASSET_HARD_DETAILED, filterModel);
            connection.then((data: any) => {
              if (data) {
                let result =data;
                self.assetList = data;
                response(result.map((i:any) => { i.label = i.assetNo; return i; }));


              }
            }).catch((error)=> {
            });
          },
          select: function (event:any, ui:any) {
            self.filterassetId = ui.item.assetId;
            self.filterlocation = ui.item.location;
            self.filtercategory = ui.item.category;
            self.filtermodel = ui.item.model;
            self.filtermanufacturer = ui.item.manufacturer;
            self.filterpartNo = ui.item.partNo;
            self.filterserialNo = ui.item.serialNo;
            self.filterprocessor = ui.item.processor;
            self.filterram = ui.item.ram;
            self.filterassetNo = ui.item.assetNo;
            self.filterhdd = ui.item.hdd;
            self.filteripNo = ui.item.ipAddress;
            self.filterconfig = ui.item.config;
            self.filtercurrstate = ui.item.assetState;
            self.filterempNo = ui.item.empNo;
            self.filterempName = ui.item.empName;
            self.filterempDesg = ui.item.designation;
            self.filterempDept = ui.item.department;
            return false;
          }
        });
    }
  }

  getSizeList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_STORAGE_SIZE_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.sizeList = data;
        console.log(this.sizeList);
      }
    }).catch((error)=> {
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

  getUserMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i:any) => {
          i.name = i.firstName + '' + i.middleName + '' + i.lastName + '-' + i.employeeId + '-' + i.department
            + '-' + i.designation; return i;
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
    $('#empNo1').autocomplete({
      source: function (request:any, response:any) {
        let result = data.filter((x:any)  => x.employeeId.includes(mtrl));;
        response(result.map((i:any) => {
          i.label = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation + '-' + i.department,
            i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName, i.empNo = i.employeeId, i.designation = i.designation,
            i.department = i.department; return i;
        }));
      },
      select: function (event:any, ui:any) {
        self.filterempNo1 = ui.item.empNo;
        self.filterempName1 = ui.item.name;
        self.filterempDesg1 = ui.item.designation;
        self.filterempDept1 = ui.item.department;

        return false;
      }
    });
  }

  clearFilter() {
    this.filterassetNo = null;
    this.filterassetId = null;
   // this.filterlocation = null;
 this.filterlocation = '';
    this.filtercategory = null;
    this.filtermodel = null;
    this.filtermanufacturer = null;
    this.filterprocessor = null;
    this.filterram = null;
    this.filterhdd = null;
    this.filterconfig = null;
    this.filtercurrstate = null;
    this.filterempNo = null;
    this.filterempName = null;
    this.filterempDesg = null;
    this.filterempDept = null;
    this.filterempNo1 = null;
    this.filterempName1 = null;
    this.filterempDesg1 = null;
    this.filtertransfer = null;
  }

  statuslist: any[] = [
    { id: 1, name: 'In Use' },
    { id: 2, name: 'In Repair' },
    { id: 3, name: 'Decomissioned' },
    { id: 4, name: 'In store' },
    { id: 5, name: 'Retired' },
    { id: 6, name: 'Dispose' },
    { id: 7, name: 'Transferred' },
    { id: 8, name: 'Sold' }
  ];

  TransferAsset = {} as TransferAsset;

  //For transfer of asset to another user
  onTransfer() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find((x:any)  => x.assetId == this.filterassetId);
      this.TransferAsset = Object.assign({}, value);
      this.TransferAsset.empNo = this.filterempNo1;
      this.TransferAsset.empAd = this.filterempName1;
      this.TransferAsset.sizeType = this.TransferAsset.sizeType ? this.sizeList.find((x:any)  => x.storTxt == this.TransferAsset.sizeType).storId : '';
      this.TransferAsset.ramSize = this.TransferAsset.ramSize ? this.sizeList.find((x:any)  => x.storTxt == this.TransferAsset.ramSize).storId : '';
      this.TransferAsset.assetState = this.TransferAsset.assetState ? this.assStateList.find((x:any)  => x.status == this.TransferAsset.assetState).id : '';
      this.TransferAsset.comDept = this.TransferAsset.comDept ? this.departmentList.find((x:any)  => x.name == this.TransferAsset.comDept).id : '';
      this.TransferAsset.monitorType = this.TransferAsset.monitorType ? this.monType.find((x:any)  => x.type == this.TransferAsset.monitorType).id : '';
      this.TransferAsset.modifiedBy = this.currentUser.employeeId;
      this.TransferAsset.viewStatusApprover = '';
     // this.TransferAsset.statusApprovedDate = null;
        this.TransferAsset.statusApprovedDate = '';
      this.TransferAsset.reportViewStatus = 0;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.TransferAsset.assetId, this.TransferAsset);
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.assetId >= 0) {
        swal({
          title: "Message",
          text: "Asset transfered successfully ",
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


  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

}
