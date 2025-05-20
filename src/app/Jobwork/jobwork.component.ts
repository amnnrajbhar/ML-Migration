import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Router, ActivatedRoute } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { AuthData } from '../auth/auth.model';
import { FormControl } from '@angular/forms';
import swal from 'sweetalert';
import { JobWorkD } from './jobworkd.model';
import { JobWorkM } from './jobworkm.model';
declare var $: any;
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';
import { ToWords } from 'to-words';
import { VendorDetails } from './vendor.model';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';

@Component({
  selector: 'app-jobwork',
  templateUrl: './jobwork.component.html',
  styleUrls: ['./jobwork.component.css']
})
export class JobWorkComponent implements OnInit {
  @ViewChild('userForm') userForm: any;
  searchTerm = new FormControl();
  currentUser: AuthData;
  tableWidget: any;
  path: string;
  fiscalYear: string;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isEdit: boolean;
  isLoading: boolean;
  isLoadingPop: boolean;
  isLoadingBAPI: boolean;
  JobWorkDModel = {} as JobWorkD;
  JobWorkM = {} as JobWorkM;
  JobWorkMModel = {} as JobWorkM;
  JobWorkMModel1 = {} as JobWorkM;
  JobWorkMList: JobWorkM[] = [];
  JobWorkDList: JobWorkD[] = [];
  pO_No: string;
  qtY_RCVD: any;
  entryDateTime: Date = new Date();
  userName: string;
  reason: string;
  gONO: string;
  sendingPersonName: string;

  elementtype: string;
  shipvendor: string;
  billvendor: string;

  mindate: Date = new Date();
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private datePipe: DatePipe, private datePipe1: DecimalPipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  getCurrentFinancialYear() {
    var fiscalyear = "";
    var today = new Date();
    if ((today.getMonth() + 1) <= 3) {
      fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear().toString().substr(-2);
    } else {
      fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1).toString().substr(-2);
    }
    return fiscalyear
  }
  ngOnInit() {
    this.path = this.router.url;

    this.elementtype = "svg";

    this.fiscalYear = this.getCurrentFinancialYear();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userName = this.currentUser.firstName;
      this.getLocationById(this.currentUser.baselocation);
      this.getPlantsassigned(this.currentUser.fkEmpId);
      // this.getAllData();
      this.getLocationList();
      this.getDepartmentList();
      this.getEmployeeList();
      this.getUOMList();
      this.getbase64image();
      //this.getMaterialList();
      this.getVendorList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let table: any = jQuery('#userTable');
    this.tableWidget = table.DataTable({
      "destroy": true,
      "columnDefs": [
        { "orderable": false, "targets": 8 }
      ]
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  getAllData() {
    var filterModel: any = {};
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

    filterModel.challenNo = this.fltrChallenNO;
    filterModel.plant = this.plant;
    filterModel.transporterName = this.fltrtransportername;
    filterModel.fromdate = this.getFormatedDateTime(this.from_date);
    filterModel.todate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_JOB_WORK_FILTER_DATA_API, filterModel).then((data: any) => {
      if (data) {
        this.JobWorkMList = data.filter(x => x.isActive == true);
        this.JobWorkMList.reverse();
        this.getReportData();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.JobWorkMList = [];
    });
  }

  getReportData() {
    var filterModel: any = {};
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

    filterModel.challenNo = this.fltrChallenNO;
    filterModel.plant = this.plant;
    filterModel.transporterName = this.fltrtransportername;
    filterModel.fromdate = this.getFormatedDateTime(this.from_date);
    filterModel.todate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_JOB_WORK_REPORT_DATA_API, filterModel).then((data: any) => {
      if (data) {
        this.JobWorkDCReport = data;

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.JobWorkMList = [];
    });
  }

  locationName: string;
  plant: string;
  getLocationById(lId: number) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.plantList.push(data);
        this.plant = data.code;
        this.locationName = data ? data.code + '-' + data.name : '';
        //this.loadGateOutwardList('load');
        this.getMaterialList(data.code);
        this.getAllData();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plant = '';
      this.locationName = '';
    });
  }
  plantList: any[] = [];
  location: any[] = [];
  baseloc = { fkPlantId: 0, code: '', name: '' }
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data;
        let temp = this.plantList.find(x => x.fkPlantId == this.currentUser.baselocation);
        if (temp == null || temp == undefined) {
          this.location.forEach(element => {
            this.baseloc.fkPlantId = element.id;
            this.baseloc.code = element.code;
            this.baseloc.name = element.name;
          });
          this.plantList.push(this.baseloc);
        }
        this.plant = this.plantList.find(x => x.fkPlantId == this.currentUser.baselocation).code;

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }
  locationGateList = [];
  selGateLocation: any;
  getGateList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATIONGATE_MASTER_ANY_API, this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.locationGateList = data;
        this.selGateLocation = this.locationGateList.find(x => x.gateNo == '1');
        // this.selGateLocation = null;
        // this.selGateLocation = this.locationGateList.find(x => x.gateNo == 'G1');
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationGateList = [];
    });
  }
  locationList: any;
  selDestination: any;
  loccode: any;
  getLocationList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data) {
        this.locationList = data;
        this.selDestination = null;

      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  employeeList = [];
  sendingPERSON: any;
  getEmployeeList() {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API, this.currentUser.baselocation).then((data: any) => {
      if (data.length > 0) {
        this.employeeList = data.map((i) => { i.empfull = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation; return i; });
        this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.currentUser.employeeId);
      }
    }).catch(error => {
      this.isLoading = false;
      this.employeeList = [];
    });
  }
  departmentList = [];
  sendingDEPTNAME: any;
  getDepartmentList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data;
        this.sendingDEPTNAME = this.departmentList.find(x => x.id == this.currentUser.fK_Department);
      }
    }).catch(error => {
      this.isLoading = false;
      this.departmentList = [];
    });
  }
  //Search Filters
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  deliveryModeList = [
    { id: 0, name: 'In Person' },
    { id: 1, name: 'Courier' },
    { id: 2, name: 'Vehicle' }
  ]
  selectedModes: any = null;
  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
    this.selectedModes = [];
  }
  onSelectAll(items: any) {
    this.selectedModes = items;
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.delete = false;
    this.fltrChallenNO = null;
    this.fltrInvoiceNo = null;
    this.fltrtransportername = null;
    this.selectedModes = [];
  }
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  delete: boolean = false;
  fltrChallenNO: string;
  fltrInvoiceNo: string;
  fltrtransportername: string;

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  getGoNO(gONO: string): string {
    return gONO != null ? gONO.toString().padStart(4, '0').toString() : '';
  }
  dynamicArray: any = [];
  dynamicArray1: any = [];
  newDynamic: any = {};
  rowcount: number = 0;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, itemCode: null, itemDesc: null, hsnCode: null, uom: null, batchNo: null, qty: null, packingDetails: null, rate: null, amount: null, stored: "0" };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  materialList: any[] = [];
  setDesc(mtrl) {
    //let matId = this.materialList.find(s => s.type == mtrl.itemCode).id;
    var self = this;
    var data = this.materialList;
    $('#itemCode' + mtrl.id).autocomplete({
      source: function (request, response) {
        let result = data.filter(x => x.material.toLowerCase().includes(mtrl.itemCode));;
        response(result.map((i) => { i.label = i.maktx, i.val = i.matnr, i.uom = i.meins, i.hsn = i.steuc; return i; }));
      },
      select: function (event, ui) {
        mtrl.itemDesc = ui.item.label;
        mtrl.itemCode = ui.item.val;
        mtrl.uom = ui.item.uom;
        mtrl.hsnCode = ui.item.hsn;
        mtrl.stored = "1";
        return false;
      }
    });

  }

  UOMList: any;
  getUOMList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        if (this.isEdit)
          this.UOMList = data;
        else
          this.UOMList = data.filter(x => x.isActive);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.UOMList = [];
    });
  }
  getMaterialList(plant) {
    var filtermodel: any = {};
    var today = new Date();
    var iM_MTART: any[] = [{ mtart: 'RM' },
    { mtart: 'PM' }, { mtart: 'BULK' }, { mtart: 'FG' }, { mtart: 'IS' }];
    //  var  mtart='1';
    // iM_MTART.push(mtart);
    var from_date: any = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    var to_date: any = today;
    filtermodel.iM_FROM_DATE = this.getDateFormate(from_date);
    filtermodel.iM_TO_DATE = this.getDateFormate(to_date);
    filtermodel.iM_MTART = iM_MTART
    filtermodel.iM_PLANT = 'ML15';
    this.httpService.post(APIURLS.BR_RFCBAPI_GET_ITEM_DETAILS_API, filtermodel).then((data: any) => {
      this.isLoading = true;
      if (data.iT_RETURN == null) {
        this.materialList = data.iT_MATERIAL;
        this.materialList = data.iT_MATERIAL.map((i) => { i.material = i.matnr + ', ' + i.maktx; return i; });

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  vendorList: any[] = [];
  vendorList1: any[] = [];

  getVendorList() {
    var filtermodel: any = {};
    var today = new Date();

    //var iM_KTOKK:any[]= [{ ktokk:'IN'},{ ktokk:'IM'},{ktokk:'0007'}];
    var iM_KTOKK: any[] = [{ ktokk: 'IN' }];

    //   var  ktokk='1';

    //   iM_KTOKK.push(ktokk);
    var from_date: any = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    var to_date: any = today;
    filtermodel.iM_FROM_DATE = this.getDateFormate(from_date);
    filtermodel.iM_TO_DATE = this.getDateFormate(to_date);
    filtermodel.iM_KTOKK = iM_KTOKK;
    this.httpService.get(APIURLS.BR_MASTER_VENDOR_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data) {
        this.vendorList = data;
        this.vendorList = this.vendorList.map((i) => { i.vendor = i.name1 + ', ' + i.lifnr + ', ' + i.street + ', ' + i.strSuppl1 + i.mcCity1 + ', ' + i.bezei + ', ' + i.landx + '-' + i.postCode1; return i; });
        this.vendorList1 = data;
        this.vendorList1 = this.vendorList1.map((i) => { i.vendor = i.name1 + ', ' + i.lifnr + ', ' + i.street + ', ' + i.strSuppl1 + i.mcCity1 + ', ' + i.bezei + ', ' + i.landx + '-' + i.postCode1; return i; });

      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  goNoAutocomplete(value) {
    var self = this.JobWorkMModel;
    var data1 = this.vendorList;
    $('#billing1').autocomplete({
      source: function (request, response) {

        let result = data1.filter(x => x.vendor.toLowerCase().includes(value));;
        response(result.map((i) => {
          i.label = i.lifnr + ' - ' + i.name1 + '~ ' + i.street + ', '
            + i.strSuppl1 + i.mcCity1 + ', ' + i.bezei + '~' + i.landx + '-' + i.postCode1 + '~' + i.stcd3,
          i.val = i.name1 + ', ' + i.mcCity1 + ', ' + i.bezei + ', ' + i.landx + '-' + i.postCode1; return i;
        }));

      },
      select: function (event, ui) {
        self.billingAddress = ui.item.label;
        return false;
      }
    });
  }
  goNoAutocomplete1(value) {
    var self = this.JobWorkMModel;
    var data2 = this.vendorList1;
    $('#shippingAddress').autocomplete({
      source: function (request, response) {

        let result = data2.filter(x => x.vendor.toLowerCase().includes(value));;
        response(result.map((i) => {
          i.label == i.lifnr + ' - ' + i.name1 + '~ ' + i.street + ', '
            + i.strSuppl1 + i.mcCity1 + ', ' + i.bezei + '~' + i.landx + '-' + i.postCode1 + '~' + i.stcd3,
          i.val = i.name1 + ', ' + i.mcCity1 + ', ' + i.bezei + ', ' + i.landx + '-' + i.postCode1; return i;
        }));
      },
      select: function (event, ui) {
        self.shippingAddress = ui.item.label;
        return false;
      }
    });
  }
  getGONumInfo(value) {
    this.goNoAutocomplete(value)
  }
  getGONumInfo1() {
    //  this.goNoAutocomplete1()
  }
  Calculateamount(mtrl) {
    mtrl.amount =Math.round( mtrl.qty * mtrl.rate);

    return
  }
  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

  Cancel: boolean = false;
  onGateEntryActions(isedit: boolean, JobWorkM: JobWorkM, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.Cancel = false;
    this.JobWorkMModel = {} as JobWorkM;
    this.dynamicArray = [];
    this.JobWorkDModel = {} as JobWorkD;
    this.resetForm();
    if (isedit && !isprint) {
      this.JobWorkMModel = Object.assign({}, JobWorkM);
      var data = this.JobWorkMModel.jobWorkDViewModel;
      data.forEach(mtrl => {
        let newDynamic = { id: 0, itemCode: null, itemDesc: null, hsnCode: null, uom: null, batchNo: null, qty: null, packingDetails: null, rate: null, amount: null, stored: "0" };
        newDynamic.id = mtrl.id;
        newDynamic.itemCode = mtrl.itemCode;
        newDynamic.itemDesc = mtrl.itemDesc;
        newDynamic.hsnCode = mtrl.hsnCode;
        newDynamic.uom = mtrl.uom;
        newDynamic.batchNo = mtrl.batchNo;
        newDynamic.qty = mtrl.qty;
        newDynamic.packingDetails = mtrl.packingDetails;
        newDynamic.rate = mtrl.rate;
        newDynamic.amount = mtrl.amount;
        this.dynamicArray.push(newDynamic);
      });
      this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.JobWorkMModel.doneBy);
      this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
      // this.sendingDEPTNAME = this.departmentList.find(x => x.name == this.JobWorkMModel.sendinG_DEPT_NM);
      // this.fiscalYear = this.JobWorkMModel.fiN_YEAR;

    }
    else if (JobWorkM.challenNo != null || JobWorkM.challenNo != undefined) {
      this.JobWorkMModel = Object.assign({}, JobWorkM);
      var data = this.JobWorkMModel.jobWorkDViewModel;
      data.forEach(mtrl => {
        let newDynamic = { id: 0, itemCode: null, itemDesc: null, hsnCode: null, uom: null, batchNo: null, qty: null, packingDetails: null, rate: null, amount: null, stored: "0" };
        newDynamic.id = mtrl.id;
        newDynamic.itemCode = mtrl.itemCode;
        newDynamic.itemDesc = mtrl.itemDesc;
        newDynamic.hsnCode = mtrl.hsnCode;
        newDynamic.uom = mtrl.uom;
        newDynamic.batchNo = mtrl.batchNo;
        newDynamic.qty = mtrl.qty;
        newDynamic.packingDetails = mtrl.packingDetails;
        newDynamic.rate = mtrl.rate;
        newDynamic.amount = mtrl.amount;
        this.dynamicArray.push(newDynamic);
      });
      this.sendingPERSON = this.employeeList.find(x => x.employeeId == this.JobWorkMModel.doneBy);
      this.sendingPersonName = this.sendingPERSON.firstName + ' ' + this.sendingPERSON.middleName + ' ' + this.sendingPERSON.lastName;
      // this.sendingDEPTNAME = this.departmentList.find(x => x.name == this.JobWorkMModel.sendinG_DEPT_NM);
      // this.fiscalYear = this.JobWorkMModel.fiN_YEAR;


    }
    else {
      this.JobWorkMModel = {} as JobWorkM;
      let newDynamic = { id: 0, itemCode: null, itemDesc: null, hsnCode: null, uom: null, batchNo: null, qty: null, packingDetails: null, rate: null, amount: null, stored: "0" };
      this.dynamicArray.push(newDynamic);
    }
    if (value == 'Cancel') {
      this.Cancel = true;
    }
    if (isprint) {
      // jQuery("#printModal").modal('show');

      this.onPrint(JobWorkM);
    }
    else {
      jQuery("#myModal").modal('show');
    }
  }

  resetForm(): void {
    this.entryDateTime = new Date();
    this.JobWorkMModel = {} as JobWorkM;
    this.JobWorkDModel = {} as JobWorkD;
    this.JobWorkDList = [];
    this.dynamicArray = [];
    //this.selGateLocation = null;
    this.errMsgPop = '';
    this.errMsg = ''
    this.errMsgModalPop = '';
    this.reason = '';
    this.selDestination = null;
    // this.sendingPERSON = null;
    // this.sendingDEPTNAME = null;
    this.isLoadingPop = false;
    this.isLoadingBAPI = false;
  }
  totalQty: any = 0;
  totalAmount: number = 0;
  rupees: any;
  VendorName: any;
  VendorAddress: any;
  Vendorstate: any;
  city: any;
  pincode: any;
  BAddress1: any
  BAddress2: any
  SAddress1: any
  SAddress2: any
  BGST: any
  SGST: any
  BAddress3: any
  SAddress3: any

  onPrint(JobWorkM) {

    this.totalAmount = 0;
    this.totalQty = 0;
    this.dynamicArray1 = [];
    this.JobWorkMModel1 = Object.assign({}, JobWorkM);
    var temp = this.JobWorkMModel1.billingAddress.split('~');
    this.BAddress1 = temp[0];
    this.BAddress2 = temp[1];
    this.BAddress3 = temp[2];
    this.BGST = temp[3];
    var temp1 = this.JobWorkMModel1.shippingAddress.split('~');
    this.SAddress1 = temp1[0];
    this.SAddress2 = temp1[1];
    this.SAddress3 = temp1[2];
    this.SGST = temp1[3];
    var data = this.JobWorkMModel1.jobWorkDViewModel;
    data.forEach(mtrl => {
      let newDynamic = { id: 0, itemCode: null, itemDesc: null, hsnCode: null, uom: null, batchNo: null, qty: null, packingDetails: null, rate: null, amount: null, stored: "0" };
      newDynamic.id = mtrl.id;
      newDynamic.itemCode = mtrl.itemCode;
      newDynamic.itemDesc = mtrl.itemDesc;
      newDynamic.hsnCode = mtrl.hsnCode;
      newDynamic.uom = mtrl.uom;
      newDynamic.batchNo = mtrl.batchNo;
      newDynamic.qty = mtrl.qty;
      newDynamic.packingDetails = mtrl.packingDetails;
      newDynamic.rate = mtrl.rate;
      newDynamic.amount = mtrl.amount;
      this.totalAmount = (this.totalAmount + mtrl.amount);
      this.totalQty = this.totalQty + mtrl.qty;
      this.dynamicArray1.push(newDynamic);
    });
   // this.totalQty = Math.round(this.totalQty);
    this.totalAmount = Math.round(this.totalAmount);
    const toWords = new ToWords();
    this.rupees = toWords.convert(this.totalAmount, { currency: true })
    swal({
      title: "Are you sure to print?",
      icon: "warning",
      buttons: [true, true],
      dangerMode: false,
    })
      .then((willsave) => {
        if (willsave) {
          this.downloadPdf();
        }
      });

  }


  onSaveEntry() {
    if (!this.isEdit) {
      swal({
        title: "Are you sure to submit?",
        icon: "warning",
        buttons: [true, true],
        dangerMode: false,
      })
        .then((willsave) => {
          if (willsave) {
            this.insertGateOutstock();
          }
        });
    }
    else {
      swal({
        title: "Are you sure to Cancel Entry?",
        icon: "warning",
        buttons: [true, true],
        dangerMode: false,
      })
        .then((willsave) => {
          if (willsave) {
            this.deactivateGateEntry();
          }
        });
    }

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
  insertGateOutstock() {
    this.JobWorkMModel.plant = this.plant
    this.JobWorkMModel.doneBy = this.currentUser.employeeId;
    //this.JobWorkMModel.doneOn = this.getFormatedDateTime(new Date());
    this.JobWorkMModel.challenDate = this.getFormatedDateTime(this.JobWorkMModel.challenDate);
    this.JobWorkMModel.lrDate = this.JobWorkMModel.lrDate != undefined ? this.getFormatedDateTime(this.JobWorkMModel.lrDate) : null;
    this.JobWorkMModel.isActive = true;
    //Insert Material
    var index = 0;
    let lstJobWorkD: JobWorkD[] = [];
    this.dynamicArray.forEach(mtrl => {
      index = index + 1;
      this.JobWorkDModel = {} as JobWorkD;
      this.JobWorkDModel.plant = this.plant
      this.JobWorkDModel.itemCode = mtrl.itemCode;
      this.JobWorkDModel.itemDesc = mtrl.itemDesc;
      this.JobWorkDModel.hsnCode = mtrl.hsnCode;
      this.JobWorkDModel.batchNo = mtrl.batchNo;
      this.JobWorkDModel.uom = mtrl.uom;
      this.JobWorkDModel.qty = +mtrl.qty;
      this.JobWorkDModel.rate = +mtrl.rate;
      this.JobWorkDModel.amount = +mtrl.amount;
      this.JobWorkDModel.packingDetails = mtrl.packingDetails;
      this.JobWorkDModel.doneBy = this.currentUser.employeeId;
      //this.JobWorkDModel.doneOn = this.getFormatedDateTime(new Date());
      this.JobWorkDModel.isActive = true;
      lstJobWorkD.push(this.JobWorkDModel);
    });
    this.JobWorkMModel.jobWorkDViewModel = lstJobWorkD;
    let connection = this.httpService.post(APIURLS.BR_JOB_WORK_INSERT_API, this.JobWorkMModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        this.JobWorkMModel = Object.assign({}, data);
        jQuery('#myModal').modal('hide');
        this.errMsgModalPop = 'Challen ' + data.challenNo + ' saved successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.getAllData();
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.errMsgPop = 'Error saving Header...';
      this.isLoadingPop = false;
    });
  }
  UpdateEntry() {
    this.isLoadingPop = true;
    this.JobWorkMModel.modifiedBy = this.currentUser.employeeId;
    //this.JobWorkMModel.modifiedOn = this.getDateFormate(new Date());
    this.JobWorkMModel.challenDate = this.getFormatedDateTime(this.JobWorkMModel.challenDate);
    this.JobWorkMModel.lrDate = this.JobWorkMModel.lrDate != undefined ? this.getFormatedDateTime(this.JobWorkMModel.lrDate) : null;
    this.dynamicArray.forEach(mtrl => {
      for (let i = 0; i < this.JobWorkMModel.jobWorkDViewModel.length; i++) {
        if (mtrl.id == this.JobWorkMModel.jobWorkDViewModel[i].id) {
          this.JobWorkMModel.jobWorkDViewModel[i].itemCode = mtrl.itemCode;
          this.JobWorkMModel.jobWorkDViewModel[i].itemDesc = mtrl.itemDesc;
          this.JobWorkMModel.jobWorkDViewModel[i].hsnCode = mtrl.hsnCode;
          this.JobWorkMModel.jobWorkDViewModel[i].batchNo = mtrl.batchNo;
          this.JobWorkMModel.jobWorkDViewModel[i].uom = mtrl.uom;
          this.JobWorkMModel.jobWorkDViewModel[i].qty = +mtrl.qty;
          this.JobWorkMModel.jobWorkDViewModel[i].rate = +mtrl.rate;
          this.JobWorkMModel.jobWorkDViewModel[i].amount = +mtrl.amount;
          this.JobWorkMModel.jobWorkDViewModel[i].packingDetails = mtrl.packingDetails;
          this.JobWorkMModel.jobWorkDViewModel[i].modifiedBy = this.currentUser.employeeId;
          //this.JobWorkMModel.jobWorkDViewModel[i].modifiedOn = this.getFormatedDateTime(new Date());
        }
      }

    });
    let connection = this.httpService.put(APIURLS.BR_JOB_WORK_INSERT_API, this.JobWorkMModel.id, this.JobWorkMModel);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        this.errMsgModalPop = 'Updated successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.getAllData();
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving data...';
    });
  }
  CancelEntry() {
    swal({
      title: "Are you sure to Cancel Entry?",
      icon: "warning",
      buttons: [true, true],
      dangerMode: false,
    }).then((willsave)=>{
      if(willsave)
      {
        this.isLoadingPop = true;
        this.JobWorkMModel.isActive = false;
        this.JobWorkMModel.modifiedBy = this.currentUser.employeeId;
       // this.JobWorkMModel.modifiedOn = this.getDateFormate(new Date());
        let connection = this.httpService.put(APIURLS.BR_JOB_WORK_INSERT_API, this.JobWorkMModel.id, this.JobWorkMModel);
        connection.then((data: any) => {
          if (data == 200 || data.id > 0) {
            jQuery('#myModal').modal('hide');
            this.errMsgModalPop = 'Cancelled successfully!';
            swal(this.errMsgModalPop, {
              icon: "success",
            }).then((willsave) => {
              if (willsave) {
                this.getAllData();
              }
            });
          }
          this.isLoadingPop = false;
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving data...';
        });
      }
    })
   
  }
  deactivateGateEntry() {
    this.isLoadingPop = true;
    this.JobWorkMModel.isActive = false;
    this.JobWorkMModel.modifiedBy = this.currentUser.employeeId;
   // this.JobWorkMModel.modifiedOn = this.getDateFormate(new Date());
    let connection = this.httpService.put(APIURLS.BR_JOB_WORK_INSERT_API, this.JobWorkMModel.id, this.JobWorkMModel);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        jQuery('#myModal').modal('hide');
        this.errMsgModalPop = 'Cancelled successfully!';
        swal(this.errMsgModalPop, {
          icon: "success",
        }).then((willsave) => {
          if (willsave) {
            this.getAllData();
          }
        });
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Delete Gate Entry Outward...';
    });
  }
  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Outward - Sub Contracting</title>
          <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
          <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
        </head>
        <body onload="window.print();window.close()">
        <table class="report-container">
          <thead class="report-header">
            <tr>
              <th class="report-header-cell">
                <div class="header-info">
                  Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
                </div>
              </th>
            </tr>
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
        </table>
        </body>
      </html>`
    );
    popupWin.document.close();
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

  downloadPdf() {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED, API DIVISION (ML15) ";
    var ReportName = "Plot No-43-45, IV Phase, KIADB, Bommasandra Industrial Area, Bangalore - 560105, Karnataka";
    var gtin = " GSTIN No: 29AABCM2131N1ZE             CIN No:U24232KA1973PLC002401             Drug Lic No. KTK/25/535/2007 DT-29.08.2017"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
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
        title: 'Job Work DC',
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
      pageMargins: [40, 10, 40, 60],
      pageOrientation: 'landscape',
      // header: function (currentPage, pageCount) {
      //   return {

      //     columns: [
      //       {
      //       pageMargins: [60, 100, 60, 80],
      //       style: 'tableExample',
      //       color: '#444',
      //       table: {
      //         widths: [90, 600, 90],
      //         headerRows: 2,
      //         keepWithHeaderRows: 1,
      //         body: [
      //           [{rowSpan: 2,	image: logo,
      //           width: 50,
      //             alignment: 'center'}
      //           , {text: OrganisationName, 	bold: true, fontSize: 12,color: 'black',alignment: 'center',height:'*'}, 
      //           {rowSpan: 2,text: ['Page ', { text: currentPage.toString() }, ' of ',
      //            { text: pageCount.toString() }], bold: true, fontSize: 10,color: 'black', alignment: 'center'}],
      //            [''
      //             , {stack: [
      //               {text: ReportName, bold: true, fontSize: 10,color: 'black', alignment: 'center',height:'*'},
      //               {text: gtin, bold: true, fontSize: 10,color: 'black', alignment: 'center',height:'*'}
      //             ] },'']
      //         ]
      //       }
      //       }
      //     ],
      //     margin: 20
      //   }
      // },
      footer: function (currentPage, pageCount) {
        return {

          columns: [

            {
              alignment: 'right',
              stack: [
                { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString() }
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

  JobWorkDCReport: any[] = [];
  generateExcel() {
    const title = 'Job Work Challen Register';
    const header = ["Sl NO", "Job Work DC Number", "Job Work DC Date",
      "Ship to Party/Ship from Party", "Ship to Party", "HSN Code",
      "Material Code", "Description of Goods", "Batch No"
      , "UOM", "Quantity", "Rate", "Taxable Value", "Transporter Name", "Vehicle No.", "LR Number", "LR Date", "Mode", "PO Number",
      "GST Number", "State", "Job Work Type", "Type Of Goods"]

    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.JobWorkDCReport.forEach(element => {
      index = index + 1;
      ts = {};
      ts.sl = index;
      ts.challen_No = element.challen_No,
        ts.challen_Date = this.datePipe.transform(element.challen_Date, 'dd/MM/yyyy');
      ts.shippingAddress = element.shippingAddress,
        ts.billingAddress = element.billingAddress,
        ts.hsN_Code = element.hsN_Code,
        ts.item_Code = element.item_Code,
        ts.item_Desc = element.item_Desc,
        ts.batchNo = element.batchNo,
        ts.uom = element.uom,
        ts.qty = element.qty,
        ts.rate = element.rate,
        ts.amount = element.amount,
        ts.transporter_Name = element.transporter_Name,
        ts.vehicle_No = element.vehicle_No,
        ts.lR_No = element.lR_No,
        ts.lR_Date = this.datePipe.transform(element.lR_Date, 'dd/MM/yyyy');
      ts.modeOfTransport = element.modeOfTransport,
        ts.ponumber = element.ponumber;
      ts.gstNumber = element.gstNumber,
        ts.state = element.state,
        ts.jobworkType = "",
        ts.type = '';

      exportList.push(ts);

    });
    var OrganisationName = "Micro Labs Limited, API Plant (ML15). Job Work Challan Register from " + this.datePipe.transform(this.from_date, 'dd/MM/yyyy') + " to " + this.datePipe.transform(this.to_date, 'dd/MM/yyyy');
    const data = exportList;
    //Create workbook and worksheet
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Job Work Challen Register');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    //Blank Row 
    // worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);
    worksheet.mergeCells('A1:W1');
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    //  worksheet.addRows(data);
    // Add Data and Conditional Formatting
    //data.forEach()

    for (let x1 of data) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }
    // data.forEach((element) => {
    //   let eachRow = [];
    //   header.forEach((headers) => {
    //     eachRow.push(element.id);
    //   })   

    //   worksheet.addRow(eachRow); 
    // })
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.getColumn(2).width = 10;
    // worksheet.getColumn(4).width = 20;
    // worksheet.getColumn(5).width = 60;
    // worksheet.getColumn(6).width = 40;
    // worksheet.getColumn(7).width = 10;    
    // worksheet.getColumn(8).width = 20;    
    // worksheet.addRow([]);

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Job Work Challen Register.xlsx');
    })

  }
}
