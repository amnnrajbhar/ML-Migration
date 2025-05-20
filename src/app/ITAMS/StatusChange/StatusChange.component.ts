import { Component, OnInit, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { StatusChange } from './StatusChange.model';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
declare var $: any;

@Component({
  selector: 'app-StatusChange',
  templateUrl: './StatusChange.component.html',
  styleUrls: ['./StatusChange.component.css']
})
export class StatusChangeComponent implements OnInit {

  public tableWidget: any;
  currentUser: AuthData;
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
  assStateList: any;
  locationList: any;
  dashboardcategory: any;
  dashboardassetstate: any;
  dashboardusage: any;
  filterstatus: any;
  filternature: any;
  sizeList: any;
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
  newDynamic: { id: number; filtersoftType: any; filtersoftName: string; filterlicType: any; filterprodKey: string; filterversion: string; filterexpDate: any; };
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
  assetList: any;
  filtermodel: any;
  filtermanufacturer: any;
  filterpartNo: any;
  filterserialNo: any;
  filterprocessor: any;
  filtercurrstate: any;
  filterassetNo: any;
  filteripAddress: any;
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
    console.log(this.path);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.getAssetStateList();
    this.getLocationMaster();
    this.getPlantsassigned(this.currentUser.fkEmpId);
    // this.getAssetList();
    this.getSizeList();
    this.getMonType();
    this.getDepartList();
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
      this.isLoading = false;
      this.locationList = [];
    });
  }

  plantList:any[]=[];
  getPlantsassigned(id)
  {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter(x=>{ return x.isActive;}).map((i) => { i.location = i.code + '-' + i.name; return i; });;          
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });          
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  getAssetStateList() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_STATE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.assStateList = data;
        console.log(this.assStateList);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.assStateList = [];
    });
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

  getMonType() {
    this.httpService.amsget(APIURLS.BR_GET_AMS_MONITOR_TYPE_MASTER).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.monType = data;
        console.log(this.monType);
      }
    }).catch(error => {
      this.monType = [];
    });
  }

  getMonitorType(id) {
    let temp = this.monType.find(x => x.id == id);
    return temp ? temp.type : '';
  }

  // getAssetList() {
  //   this.errMsg = "";
  //   this.isLoading = true;
  //   this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_DETAILS_MASTER).then((data: any) => {
  //     if (data.length > 0) {
  //       this.assetList = data;
  //       this.initDatatable();
  //       this.isLoading = false;
  //     }
  //   }).catch(error => {
  //     this.isLoading = false;
  //     this.assetList = [];
  //   });
  // }

  setList(asset) {
    if (asset.length > 5) {
      var self = this;
      var filterModel: any = {};
      $('#assetNo').autocomplete({
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
          self.filteripAddress = ui.item.ipAddress;
          self.filterconfig = ui.item.config;
          self.filtercurrstate = ui.item.assetState;
          return false;
        }
      });
    }
  }

  clearFilter() {
    this.filterassetNo = null;
    this.filterassetId = null;
    this.filterlocation = null;
    this.filtercategory = null;
    this.filtermodel = null;
    this.filtermanufacturer = null;
    this.filterpartNo = null;
    this.filterserialNo = null;
    this.filterprocessor = null;
    this.filterram = null;
    this.filterhdd = null;
    this.filteripAddress = null;
    this.filterconfig = null;
    this.filtercurrstate = null;
    this.filterstatus = null;
    this.filternature = null;
  }

  statuslist: any[] = [
    // { id: 1, name: 'In Use' },
    // { id: 2, name: 'In Repair' },
    // { id: 3, name: 'Decomissioned' },
    // { id: 4, name: 'In store' },
    { id: 5, name: 'Retired' },
    { id: 6, name: 'Dispose' },
    { id: 7, name: 'Transferred' },
    { id: 8, name: 'Sold' }
  ];

  getstatus(id) {
    let temp = this.statuslist.find(x => x.id == id);
    return temp ? temp.name : '';
  }

  StatusChange = {} as StatusChange;

  //For updating the status of asset
  onUpdate() {
    this.errMsg = "";
    let connection: any;
    if (!this.isEdit) {
      let value = this.assetList.find(x => x.assetId == this.filterassetId);
      this.StatusChange = Object.assign({}, value);
      this.StatusChange.assetState = this.statuslist.find(x => x.name == this.filterstatus).id;
      this.StatusChange.natureofActivities = this.filternature;
      this.StatusChange.monitorType = this.StatusChange.monitorType != '' ? this.monType.find(x => x.type == this.StatusChange.monitorType).id : null;
      this.StatusChange.ramSize = this.StatusChange.ramSize != '' ? this.sizeList.find(x => x.storTxt == this.StatusChange.ramSize).id : null;
      this.StatusChange.sizeType = this.StatusChange.sizeType != '' ? this.sizeList.find(x => x.storTxt == this.StatusChange.sizeType).id : null;
      this.StatusChange.comDept = this.StatusChange.comDept != '' ? this.departmentList.find(x => x.name == this.StatusChange.comDept).id : null;
      this.StatusChange.modifiedBy = this.currentUser.employeeId;
      this.StatusChange.viewStatusApprover = null;
      this.StatusChange.statusApprovedDate = null;
      this.StatusChange.reportViewStatus = 0;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_ASSET_DATA, this.StatusChange.assetId, this.StatusChange);
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
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }


  closeSaveModal() {
    ////console.log('testpop')
    jQuery("#myModal").modal('hide');
    // this.getEvents();
    // window.location.reload();
  }

}
