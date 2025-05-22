import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppService } from '../../shared/app.service';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { AuthData } from '../../auth/auth.model';
import { FormControl } from '@angular/forms';
import { SparesRequest } from './SparesRequest.model';
import swal from 'sweetalert';
//import { forEach } from '@angular/router/src/utils/collection';
//import { filter } from 'rxjs-compat/operator/filter';
// import { FileSaver }  from 'angular-file-saver';
// import { saveAs } from 'file-saver';
declare var $: any;

@Component({
  selector: 'app-SparesRequest',
  templateUrl: './SparesRequest.component.html',
  styleUrls: ['./SparesRequest.component.css']
})
export class SparesRequestComponent implements OnInit {

@ViewChild('filterForm', { static: false }) filterForm: any;

  searchTerm = new FormControl();
  currentUser: AuthData;
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
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  requestList: any;
  newDynamic: {};
  materialList: any[] = [];
  filtermaterialCode: any;
  filtermaterialDesc: any;
  filterquantity: any;
  SparesRequestmodel = {} as SparesRequest;
  userList: any;
  empListCon: any;
  filterempNo: any;
  filterempAd: any;
  filterdesg: any;
  filterrequestNo: any;
  filteruseType: any;
  filterreqType: any;
  filterrequestDate: any;
  filterreceiverCompany: any;
  filterreqReason: any;
  filterassetId1: any;
  filterlocation1: any;
  filtercategory1: any;
  assetList: any;
  filterassetNo1: any;
  filterrecCom: any;
  filterrecName: any;
  filterrecNo: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private route: ActivatedRoute) { }


  ngOnInit() {
    // this.path = this.router.url;
    // console.log(this.path);
    // var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getUserMasterList();
    this.getAssetList();
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

  getUserMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_ACTIVE_API_GET).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
        this.empListCon = data.map((i) => { i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.department + '-' + i.designation; return i; });
        this.initDatatable();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }

  setDet(mtrl) {
    var self = this;
    var data = this.empListCon;
    $('#empNo').autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.employeeId.includes(mtrl));;
        response(result.map((i) => {
          i.label = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation,
            i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName, i.empNo = i.employeeId, i.designation = i.designation; return i;
        }));
      },
      select: function (event, ui) {
        self.filterempNo = ui.item.empNo;
        self.filterempAd = ui.item.name;
        self.filterdesg = ui.item.designation;
        return false;
      }
    });
  }

  rowcount: number = 1;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, filtermaterialCode: null, filtermaterialDesc: null, filterquantity: null };
    this.materialList.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.materialList.length > 1) {
      const index = this.materialList.indexOf(item);
      this.materialList.splice(index, 1);
    }
  }

  resetForm() {
    this.errMsg = "";
    this.filtermaterialCode = null;
    this.filtermaterialDesc = null;
    this.filterquantity = null;
    this.filterrequestNo = null;
    this.filterrequestDate = null;
    this.filterreceiverCompany = null;
    this.filterempNo = null;
    this.filterempAd = null;
    this.filterdesg = null;
    this.filterreqReason = null;
    this.filterrecCom = null;
    this.filteruseType = null;
    this.filterassetId1 = null;
    this.filterassetNo1 = null;
    this.filterlocation1 = null;
    this.filtercategory1 = null;

  }

  onUserActions(isedit: boolean, SparesRequest: SparesRequest, isprint: boolean) {
    this.isEdit = isedit;
    this.resetForm();
    jQuery("#searchModal").modal('hide');
    jQuery('#myModal').modal('show');
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
    filterModel.FromDate = this.getFormatedDateTime(this.from_date);
    filterModel.ToDate = this.getFormatedDateTime(this.to_date);
    filterModel.TypeofUse = this.filterreqType;

    this.httpService.amspost(APIURLS.BR_GET_AMS_SPARES_REQUEST, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.requestList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
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

  getAssetList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.amsget(APIURLS.BR_GET_AMS_ASSET_DETAILS_MASTER).then((data: any) => {
      if (data.length > 0) {
        this.assetList = data;
        this.initDatatable();
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
      this.assetList = [];
    });
  }

  setList(asset) {
    var self = this;
    var data = this.assetList;
    $('#assetNo1').autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.assetNo.includes(asset));
        response(result.map((i) => {
          i.label = i.assetNo; return i;
        }));
      },
      select: function (event, ui) {
        self.filterassetId1 = ui.item.assetId;
        self.filterlocation1 = ui.item.location;
        self.filtercategory1 = ui.item.category;
        self.filterassetNo1 = ui.item.assetNo;
      }
    });
  }

  clearFilter() {
    this.from_date = null;
    this.to_date = null;
    this.filterrequestNo = null;
    this.filterreqType = null;
  }

  onSaveEntry(status) {
    this.errMsg = "";
    let connection: any;

    if (!this.isEdit) {
     
      this.materialList.forEach(mtrl => {
        let filtermodel: any = {};
        filtermodel.materialCode = mtrl.filtermaterialCode;
        filtermodel.materialDesc = mtrl.filtermaterialDesc;
        filtermodel.materialQty = mtrl.filterquantity;
        filtermodel.typeofUse = this.filteruseType;
        filtermodel.employeeNumber = this.filterempNo;
        filtermodel.employeeName = this.filterempAd;
        filtermodel.employeeDesg = this.filterdesg;
        filtermodel.receiverName = this.filterrecName;
        filtermodel.receiverNumber = this.filterrecNo;
        filtermodel.receiverCompany = this.filterrecCom;
        filtermodel.requestReason = this.filterreqReason;
        filtermodel.assetId = this.filterassetId1;
        filtermodel.assetNo = this.filterassetNo1;
        filtermodel.location = this.filterlocation1;
        filtermodel.category = this.filtercategory1;
        connection = this.httpService.amspost(APIURLS.BR_GET_AMS_REQUEST_APPROVE, filtermodel);
      });
      
    }
    connection.then((output: any) => {
      this.isLoadingPop = false;
      if (output == 200 || output.requestNo > 0) {

        swal({
          title: "Message",
          text: "Spare Request No " + output.requestNo + " created",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Request..';
    });
  }

  approveRequest() {
    this.errMsg = "";
    let connection: any;
    this.checkedRequestList.forEach(element => {
      let value = this.requestList.find(x => x.requestNo == element.requestNo);
      this.SparesRequestmodel = Object.assign({}, value);
      this.SparesRequestmodel.approvedBy = this.currentUser.employeeId;
      connection = this.httpService.amsput(APIURLS.BR_GET_AMS_REQUEST_APPROVE, this.SparesRequestmodel.requestNo, this.SparesRequestmodel);
    }),
      connection.then((output: any) => {
        this.isLoadingPop = false;
        if (output == 200 || output.requestNo >= 0) {
          swal({
            title: "Message",
            text: "Request approved successfully ",
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


  isMasterSel: boolean = false;
  isAllSelected() {
    this.isMasterSel = this.requestList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }

  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.requestList.length; i++) {
      if (this.requestList[i].isSelected)
        this.checkedlist.push(this.requestList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }
}
