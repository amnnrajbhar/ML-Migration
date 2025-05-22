import { AuthData } from '../../auth/auth.model'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { debug } from 'util';
import { Location } from '../../masters/employee/location.model';
import { MatAutocompleteTrigger, MatGridTileHeaderCssMatStyler } from '@angular/material';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { Transactions } from '../ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { StorageCondition } from '../Masters/storagecondition/storagecondition.model';
import { TempCondition } from '../Masters/tempcondition/tempcondition.model';
import { Country } from '../Masters/Country/Country.model';
import { stringify } from 'querystring';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { CustomerMaster } from './CustomerMaster.model';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';

declare var require: any;

@Component({
  selector: 'app-CustomerMaster',
  templateUrl: './CustomerMaster.component.html',
  styleUrls: ['./CustomerMaster.component.css']
})
export class CustomerMasterComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  // @ViewChild(NgForm  , { static: false })dataForm: NgForm;
  // @ViewChild(NgForm  , { static: false })PMForm: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKForm: NgForm;
  // @ViewChild(NgForm  , { static: false })RMNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })PMNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })BULKNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })FGNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })LCNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })OSENGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })PPCNGXPForm: NgForm;
  // @ViewChild(NgForm  , { static: false })RMForm: NgForm;
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
  file: File; successMsg: string = "";
  path: string = '';
  locationList: any[] = [[]];
  selectedBaseLocation: any = [];
  baseLocationnotfirst = true;

  //  CustomerMastermodel = {} as ItemCodeExtension;
  // ItemCodeRequestModel = {} as ItemCodeRequest;
  // ItemCodeRequestModelList:ItemCodeRequest[]=[];

  CustomerMastermodel = {} as CustomerMaster
  customermasterlist: CustomerMaster[] = [];
  //  ItemCodeExtensionlist:ItemCodeExtension[]=[];
  materialtype: string;
  comments: string;
  filterMaterialCode: string = null;
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  filterplace: string = null;

  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  CustomerMastersearchlist: CustomerMaster[] = [];
  CustomerMasterFilter: CustomerMaster[] = [];
  emailid: string;
  requestdate: Date;
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  userid: string;
  tdseligible: boolean;

  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;
  isEligibleForTds: any;
  // CustomerMastermodeldata = {} as ItemCodeExtension;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
    , private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //  this.baseLocation = this.currentUser.baselocation;
    this.emailid = this.currentUser.email;
    this.filterstatus = 'Pending';
    this.filterlocation = this.currentUser.baselocation.toString();
    this.userid = this.currentUser.employeeId;
    this.requestdate = new Date(this.today);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
    this.getLocationMaster();;
    this.getAccClerckList();
    this.getAccGroupList();
    this.getCurrencyList();
    this.getPaymentTermList();
    this.getstateList();
    this.getTdsSectionList();
    this.getCountryList();
    this.getCustomerGroupList();
    this.getpricegroupList();
    this.getpricelist();
    this.gettaxclassList();
    this.getbase64image();
    // else
    //  this.router.navigate(["/unauthorized"]);
  }

  uploadedFile(event) {
    this.fileUploaded = event.target.files[0];
    this.readExcel();
  }

  readExcel() {
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
      this.customermasterlist = this.jsonData;
      //this.jsonData = JSON.stringify(this.jsonData);  
      // console.log(this.jsonData);

    }
    readFile.readAsArrayBuffer(this.fileUploaded);
  }

  fileToUpload: File | null = null;
  File: File | null = null;
  files: File[] = []
  handleFileInput(files: FileList) {
    this.errMsg1 = "";
    this.File = files[0];
    // this.files=[];
    for (var i = 0; i < files.length; i++) {
      this.files.push(files[i]);
    }
    this.validateAttcahment();
    this.reset();
  }


  ReadAsBase64(file): Promise<any> {
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
  id: string;
  uploadfile() {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.fileslist1.length; i++) {
      this.formData.append('files', this.fileslist1[i]);
    }
    let connection: any;
    // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/Customer master Files/UploadFiles/';
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error uploading file: ' + error;
    });

  }
  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }
  periodtype: any[] = [
    { id: 1, name: 'Days' },
    { id: 2, name: 'Months' }
  ];
  statuslist: any[] = [
    { id: 1, name: 'Created' },
    { id: 2, name: 'Submitted' },
    { id: 3, name: 'Pending' },
    { id: 4, name: 'Rejected' },
    { id: 5, name: 'Completed' },
    { id: 6, name: 'Deleted' }
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
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filterlocation = null;
    this.filterstatus = null;
    this.filterrequest = null;
    this.filterplace = null;

  }
  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
  }
  PaymentTermList: any[] = [];
  getPaymentTermList() {
    this.httpService.get(APIURLS.BR_PAYMENT_TERM_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.PaymentTermList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.PaymentTermList = [];
    });
  }
  pricegrouplist: any[] = [];
  getpricegroupList() {
    this.httpService.get(APIURLS.BR_PRICE_GROUP_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.pricegrouplist = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.pricegrouplist = [];
    });
  }
  pricelist: any[] = [];
  getpricelist() {
    this.httpService.get(APIURLS.BR_PRICE_LIST_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.pricelist = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.pricelist = [];
    });
  }
  CustomerGroupList: any[] = [];
  getCustomerGroupList() {
    this.httpService.get(APIURLS.BR_CUSTOMER_GROUP_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.CustomerGroupList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.CustomerGroupList = [];
    });
  }
  taxclassList: any[] = [];
  gettaxclassList() {
    this.httpService.get(APIURLS.BR_TAX_CLASS_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.taxclassList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.taxclassList = [];
    });
  }
  TdsSectionList: any[] = [];
  getTdsSectionList() {
    this.httpService.get(APIURLS.BR_TDS_SECTION_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.TdsSectionList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.TdsSectionList = [];
    });

  }

  AccGroupList: any[] = [];
  getAccGroupList() {
    this.httpService.get(APIURLS.BR_ACCOUNT_GROUP_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.AccGroupList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.AccGroupList = [];
    });
  }
  AccClerckList: any[] = [];
  getAccClerckList() {
    this.httpService.get(APIURLS.BR_ACC_CLERCK_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.AccClerckList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.AccClerckList = [];
    });

  }
  countrylist: any[] = [];
  getCountryList() {
    this.httpService.get(APIURLS.BR_MASTER_COUNTRY_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.countrylist = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.countrylist = [];
    });
  }
  stateList: any[] = [];
  stateList1: any[] = [];
  getstateList() {
    this.httpService.get(APIURLS.BR_STATE_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.stateList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.stateList = [];
    });
  }
  getstatelist(id) {
    this.stateList1 = this.stateList.filter(x => x.land1 == id);
  }
  currencyList: any[] = [];
  getCurrencyList() {
    this.httpService.get(APIURLS.BR_CURRENCY_POST_API).then((data: any) => {
      if (data.length > 0) {
        this.currencyList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.currencyList = [];
    });

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
    // filterModel.materialCode =this.filterMaterialCode;
    filterModel.requestNo = this.filterrequest;
    filterModel.place = this.filterplace;
    filterModel.location = this.filterlocation == null ? '' : this.locationList.find(x => x.id == this.filterlocation).code;
    filterModel.status = this.filterstatus == 'Pending' ? 'Created,InProcess,Submitted,ReSubmitted,Reverted,Reverted to initiator' : this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_CUSTOMER_MASTER_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        if (this.filterstatus == 'Pending') {
          this.CustomerMasterFilter = data.filter(x => x.pendingApprover == this.currentUser.fullName || x.requestedBy == this.currentUser.employeeId);
          this.CustomerMasterFilter.reverse();
        }
        else {
          this.CustomerMasterFilter = data;
          this.CustomerMasterFilter.reverse();
        }
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.CustomerMasterFilter = [];
    });

  }
  continue: boolean = false;
  getSearchResult() {
    this.isLoading = true;
    let td = new Date();
    this.continue = false;
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
    filterModel.place = this.CustomerMastermodel.city;
    filterModel.country = this.CustomerMastermodel.countryId;
    filterModel.status = 'Completed';
    filterModel.name = this.CustomerMastermodel.name;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_CUSTOMER_MASTER_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.CustomerMastersearchlist = data;
        this.CustomerMastersearchlist.reverse();
      }
      this.continue = true;
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.CustomerMastersearchlist = [];
    });


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
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.locationList = [];
    });
  }



  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }

  resetForm() {
    this.CustomerMastermodel = {} as CustomerMaster;
    this.comments = "";
  }


  transactionslist: Transactions[] = [];
  gettransactions(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        // this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  Approverslist: WorkFlowApprovers[] = [];

  Aprlpriority: number;

  getApproversList(value) {

    // this.Approver1 = false;
    // this.Approver2 = false;
    // this.Creator = false;
    // this.Review = false;
    // this.Closure = false;
    this.CustomerMastermodel = Object.assign({}, value);
    if (!this.isEdit) {
      var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
    }
    else {
      var loc = this.locationList.find(x => x.code == this.CustomerMastermodel.plantCode);
    }

    //var mat = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId);
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);
    var keyvalue = loc.code + '~' + this.CustomerMastermodel.customerType + ',' + 4;
    this.KeyValue = keyvalue;
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        this.Approverslist = this.Approverslist.filter(x => x.isActive == true);
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;
        let Appr1 = this.Approverslist.find(x => x.priority == 1 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);

        if (Appr1 != null || Appr1 != undefined) {
          this.Approverid1 = Appr1.approverId;
          this.Approver1 = true;
          this.Review = true;
          this.Aprlpriority = Appr1.priority;
        }
        let Appr2 = this.Approverslist.find(x => x.priority == 2 && x.approverId == empid ||
          x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
          x.parllelApprover3 == empid || x.parllelApprover4 == empid);
        if (Appr2 != null || Appr2 != undefined) {
          this.Approver1 = true;
          this.Approver2 = true;
          this.Approverid2 = Appr2.approverId;
          this.Review = true;
          this.Aprlpriority = Appr2.priority;
        }
        let Appr3 = this.Approverslist.find(x => x.approverId == empid ||
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
          let temp = this.Approverslist.find(x => x.priority == ad.approvalPriority &&
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
                ad.status = this.approverstatuslist.find(x => x.id == ad.approvalPriority).name;
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
          let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority &&
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
        this.Approverslist = this.Approverslist.sort((a, b) => {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        this.transactionslist = this.transactionslist.sort((a, b) => {
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
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.Approverslist = [];
    });
  }

  OnClickback() {
    this.resetForm();
    jQuery("#searchModal").modal('show');
  }
  onClickNewRequest() {
    this.resetForm();
    this.continue = false;
    this.CustomerMastersearchlist = [];
    //this.ItemCodeRequestModel = Object.assign({},ItemCodeRequest) ;  
    jQuery("#searchModal").modal('show');

  }
  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
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


  empId: string;
  view: boolean = false;
  attachments: any[] = [];
  locationname: string;
  onUserActions(isedit: boolean, customermaster: CustomerMaster, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.continue = false;
    this.resetForm();
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    // this.reset();
    this.files = [];
    this.fileslist = [];
    this.fileslist1 = [];
    this.view = false;
    this.errMsg1 = "";
    this.Approverslist = [];
    this.transactionslist = [];
    this.attachments = [];
    this.isLoadingPop = false;
    this.getHistory(customermaster.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      //   this.getApproversList(ItemCodeExtension);
      this.getApproversList(customermaster);
      this.stateList1 = this.stateList.filter(x => x.land1 == customermaster.countryId);
      if (customermaster.attachments != null || customermaster.attachments != undefined) {
        this.attachments = customermaster.attachments.split(',');
      }
      this.attachments.filter(x => x.name != null || undefined)
      this.CustomerMastermodel = Object.assign({}, customermaster);
      this.empId = this.CustomerMastermodel.createdBy;
    }

    if (value == 'View') {
      this.Approver1 = true;
      this.Creator = true;
      this.view = true;
    }
    if (value == 'Copy') {
      customermaster.modifiedBy = null;
      customermaster.modifiedDate = null;
      customermaster.approveStatus = null;
      customermaster.attachments = null
    }
    if (customermaster.attachments != null || customermaster.attachments != undefined) {
      this.attachments = customermaster.attachments.split(',');
    }
    this.stateList1 = this.stateList.filter(x => x.land1 == customermaster.countryId);
    this.CustomerMastermodel = Object.assign({}, customermaster);
    this.getApproversList(customermaster);
    if (isprint) {
      let ln = this.locationList.find(x => x.code == this.CustomerMastermodel.plantCode);
      this.locationname = ln.code + '-' + ln.name;
      this.CustomerMastermodel.accountGroupId = this.AccGroupList.find(x => x.accountGroupId == this.CustomerMastermodel.accountGroupId).accountGroupName;
      this.CustomerMastermodel.countryId = this.countrylist.find(x => x.land1 == this.CustomerMastermodel.countryId).landx;
      this.CustomerMastermodel.state = this.stateList.find(x => x.id == this.CustomerMastermodel.state).bezei;
      this.CustomerMastermodel.currencyId = this.currencyList.find(x => x.waers == this.CustomerMastermodel.currencyId).isocd;
      this.CustomerMastermodel.paymentTermId = this.PaymentTermList.find(x => x.paymentTermId == this.CustomerMastermodel.paymentTermId).paymentTermName;
      this.CustomerMastermodel.accountClerkId = this.AccClerckList.find(x => x.accClerkId == this.CustomerMastermodel.accountClerkId).accClerkDesc;
      this.CustomerMastermodel.customerGroup = this.CustomerGroupList.find(x => x.cGroupId == this.CustomerMastermodel.customerGroup).cGroupName;
      this.CustomerMastermodel.priceGroup = this.pricegrouplist.find(x => x.pGroupId == this.CustomerMastermodel.priceGroup).pGroupName;
      this.CustomerMastermodel.priceList = this.pricelist.find(x => x.pListId == this.CustomerMastermodel.priceList).pListName;
      this.CustomerMastermodel.taxType = this.taxclassList.find(x => x.tClassId == this.CustomerMastermodel.taxType).tClassName;

      jQuery("#printModal").modal('show');
    }
    else {
      jQuery("#searchModal").modal('hide');
      jQuery('#myModal').modal('show');
    }
  }

  isValid: boolean = false;
  validatedForm: boolean = true;

  onSaveEntry(status) {
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
        this.CustomerMastermodel.id = 0;
        this.CustomerMastermodel.requestNo = null;
        this.CustomerMastermodel.modifiedBy = null;
        this.CustomerMastermodel.modifiedDate = null;
        this.CustomerMastermodel.sapCodeNo = null;
        this.CustomerMastermodel.sapCodeExists = null;
        this.CustomerMastermodel.sapCreationDate = null;
        this.CustomerMastermodel.sapCreatedBy = null;
        var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
        this.CustomerMastermodel.plantCode = loc.code;
        this.CustomerMastermodel.createdBy = this.currentUser.employeeId;
        this.CustomerMastermodel.requestedBy = this.currentUser.employeeId;
        //  this.CustomerMastermodel.requestDate=new Date().toLocaleString();
        // this.CustomerMastermodel.createdDate=new Date().toLocaleString();
        // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/Customer master Files/UploadFiles/';
        if (this.fileslist != null || this.fileslist != undefined) {
          // let file:any='';

          let file: any = this.fileslist[0];
          for (let i = 1; i < this.fileslist.length; i++) {
            file = this.fileslist[i] + ',' + file;
          }
          this.CustomerMastermodel.attachments = file;

        }
        //this.CustomerMastermodel.attachments=file;
        this.CustomerMastermodel.lastApprover = this.CustomerMastermodel.approveStatus == "Reverted to initiator" ? this.CustomerMastermodel.lastApprover : "No";
        this.CustomerMastermodel.pendingApprover = status == "Submit" ? this.Approverslist.find(x => x.priority == 1).approverId : this.currentUser.employeeId;
        this.CustomerMastermodel.approveStatus = status == "Submit" ? "Submitted" : "Created";

        connection = this.httpService.post(APIURLS.BR_CUSTOMER_MASTER_POST_API, this.CustomerMastermodel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          this.id = data.requestNo;
          this.RequestNo = data.requestNo;
          this.uploadfile();
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = status == 'Save' ? 'Request ' + data.requestNo + ' saved successfully!' : 'Request ' + data.requestNo + ' Submitted Successfully!';
          jQuery("#saveModal").modal('show');
          if (data.approveStatus == "Submitted") {
            this.sendPendingMail(data);
            this.InsertHistory();
          }
          this.getAllEntries();
          this.reset();
        }
      }).catch(error => {
        console.log(error);
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request: ' + error;
      });
    }
  }

  onSubmitEntry(customermaster: CustomerMaster) {
    this.CustomerMastermodel = {} as CustomerMaster;
    this.CustomerMastermodel = Object.assign({}, customermaster);
    this.errMsg = "";
    let connection: any;
    if (this.CustomerMastermodel.modifiedDate != null || this.CustomerMastermodel.modifiedDate != undefined) {
      this.CustomerMastermodel.approveStatus = "ReSubmitted";
    }
    else {
      this.CustomerMastermodel.approveStatus = "Submitted";
    }
    // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/Customer master Files/UploadFiles/';
    if (this.fileslist != null || this.fileslist != undefined) {
      for (let i = 0; i < this.fileslist.length; i++) {
        this.CustomerMastermodel.attachments = this.CustomerMastermodel.attachments + ',' + this.fileslist[i];
      }

    }
    this.CustomerMastermodel.modifiedBy = this.currentUser.employeeId;

    this.CustomerMastermodel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
    this.CustomerMastermodel.approvers = this.Approverslist;
    
    connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CREATESAVEDENTRY, this.CustomerMastermodel.id, this.CustomerMastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.id = this.CustomerMastermodel.requestNo;
        this.uploadfile();
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request ' + this.CustomerMastermodel.requestNo + ' Submitted Successfully!';
        jQuery("#saveModal").modal('show');
        this.sendPendingMail(this.CustomerMastermodel);
        // this.Updatetransactions(this.CustomerMastermodel, 0);
        this.getAllEntries();
        this.reset();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request ' + this.CustomerMastermodel.requestNo + ": " + error;
    });
  }
  Role: any;
  onreview(status) {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;
    if (status == "Rejected") {
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);
      this.CustomerMastermodel.pendingApprover = '';
      this.priority = this.Approverslist.find(x => x.priority == temp.approvalPriority).priority;
    }
    else {
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

      this.CustomerMastermodel.pendingApprover = this.transactionsHistory.find(x => x.approvalPriority == temp.approvalPriority + 1).doneBy;
      this.priority = this.Approverslist.find(x => x.priority == temp.approvalPriority).priority;
    }


    this.CustomerMastermodel.lastApprover = this.currentUser.fullName;
    this.CustomerMastermodel.modifiedBy = this.currentUser.employeeId;
    //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();
    this.CustomerMastermodel.approveStatus = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_POST_API, this.CustomerMastermodel.id, this.CustomerMastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');

        // var role=this.Approverslist.find(x=>x.role=='Approver')
        if (this.Role == "Approver") {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.CustomerMastermodel.requestNo + status + " Successfully!" : "Request " + this.CustomerMastermodel.requestNo + " Approved Successfully!";
        }
        else {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.CustomerMastermodel.requestNo + status + " Successfully!" : "Request " + this.CustomerMastermodel.requestNo + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
          this.sendPendingMail(this.CustomerMastermodel)
        }
        this.sendMail(status, this.CustomerMastermodel)
        this.Updatetransactions(this.CustomerMastermodel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request " + this.CustomerMastermodel.requestNo + ": " + error : "Error Reviewing Request " + this.CustomerMastermodel.requestNo + ": " + error;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == "ReverttoInitiator") {
      let uid = this.currentUser.employeeId;
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

      this.CustomerMastermodel.pendingApprover = temp.doneBy;
      this.CustomerMastermodel.approveStatus = "Reverted to initiator";
      this.priority = this.Approverslist.find(x => x.priority == temp.approvalPriority).priority;
    }
    else {
      let uid = this.CustomerMastermodel.modifiedBy;
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

      this.CustomerMastermodel.pendingApprover = temp.doneBy;
      this.priority = this.Approverslist.find(x => x.priority == temp.approvalPriority).priority;
      this.CustomerMastermodel.approveStatus = "Reverted";
    }

    this.CustomerMastermodel.lastApprover = this.currentUser.fullName;
    this.CustomerMastermodel.modifiedBy = this.currentUser.employeeId;
    //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_POST_API, this.CustomerMastermodel.id, this.CustomerMastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + '' + this.CustomerMastermodel.requestNo + '' + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        if (status != "ReverttoInitiator") {
          this.sendPendingMail(this.CustomerMastermodel)
        }

        this.sendMail(status, this.CustomerMastermodel)
        this.Updatetransactions(this.CustomerMastermodel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request " + this.CustomerMastermodel.requestNo + ": " + error;
    });
  }

  onCreate() {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;

    let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
      || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

    if (temp != null || temp != undefined) {

      let appr = this.transactionsHistory.find(x => x.approvalPriority == temp.approvalPriority + 1);
      if (appr != null || appr != undefined) {
        this.CustomerMastermodel.pendingApprover = appr.doneBy;
      }
      else {
        this.CustomerMastermodel.pendingApprover = 'No';
        this.CustomerMastermodel.approveStatus = 'Completed';
      }
    }
    this.priority = this.Approverslist.find(x => x.priority == temp.approvalPriority).priority;
    this.CustomerMastermodel.lastApprover = this.currentUser.fullName;
    this.CustomerMastermodel.modifiedBy = this.currentUser.employeeId;
    //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();
    this.CustomerMastermodel.sapCreatedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;
    
    connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_POST_API, this.CustomerMastermodel.id, this.CustomerMastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Customer Code " + '' + this.CustomerMastermodel.sapCodeNo + '' + " Created Successfully!";
        jQuery("#saveModal").modal('show');
        if (this.CustomerMastermodel.pendingApprover != 'No') {
          this.sendPendingMail(this.CustomerMastermodel)
        }
        this.sendMail('Created', this.CustomerMastermodel)
        this.Updatetransactions(this.CustomerMastermodel, 1)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Creating Customer Code " + this.CustomerMastermodel.sapCodeNo + ": " + error;
    });

  }
  priority: number;
  oncloserequest(status) {
    this.errMsg = "";
    let connection: any;

    if (status == 'Completed') {
      let uid = this.currentUser.employeeId;
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

      this.CustomerMastermodel.pendingApprover = temp.doneBy;
    }
    this.CustomerMastermodel.lastApprover = this.currentUser.fullName;
    this.CustomerMastermodel.modifiedBy = this.currentUser.employeeId;
    //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();
    this.CustomerMastermodel.approveStatus = 'Completed';
    this.CustomerMastermodel.pendingApprover = 'No';
    this.priority = 7;
    connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_POST_API, this.CustomerMastermodel.id, this.CustomerMastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + '' + this.CustomerMastermodel.sapCodeNo + '' + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.Updatetransactions(this.CustomerMastermodel, 1)
        // this.sendMail('Created', this.ItemCodeRequestModel)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request " + this.CustomerMastermodel.sapCodeNo + ": " + error;
    });
  }
  transactions = {} as Transactions;
  Inserttransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    this.transactions.doneBy = this.currentUser.employeeId;
    //this.transactions.doneOn = new Date().toLocaleString();
    this.transactions.requestNo = data.requestNo;
    this.transactions.comments = this.comments;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.processType = "Customer Master Request";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

  }

  sendMail(type, customermaster: CustomerMaster) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_CUSTOMER_MASTER_EMAIL_API, 'CM' + '-' + type, customermaster);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });

  }

  sendPendingMail(customermaster: CustomerMaster) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_CUSTOMER_MASTER_PENDING_EMAIL_API, 'CustomerPending', customermaster);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });

  }
  downloadFile(reqNo, value) {

    // console.log(filename);
    if (value.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        if (data != undefined) {
          var FileSaver = require('file-saver');
          const imageFile = new File([data], value, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);


        }
      }).catch(error => {
        console.log(error);
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
  deletefile(item, name) {

    if (this.attachments.length > 1) {
      const index = this.attachments.indexOf(name);
      this.attachments.splice(index, 1);
    }
    let attach: any = this.attachments[0];
    for (let i = 1; i < this.attachments.length; i++) {
      attach = this.attachments[i] + ',' + attach;
    }
    item.attachments = attach;
    this.CustomerMastermodel.attachments = attach;
    let connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_POST_API, item.id, item);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        swal({
          title: "Message",
          text: "file deleted successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        })
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleting file: ' + error;
    });
  }

  removefile(name) {
    const index = this.fileslist.indexOf(name);
    this.fileslist.splice(index, 1);
  }
  print(): void {
    // this.printElement(document.getElementById("print-section"));
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
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
            <tr>
            <td class="report-header-cell">
              <div class="header-info">
                Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
              </div>
            </td>
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
  printReason: any;
  printModel: any;

  showprintmodel(data: CustomerMaster) {
    this.printReason = null;
    this.printModel = {};
    this.printModel = Object.assign({}, data);
    jQuery("#printReasonModal").modal('show');
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
  downloadPdf(value) {
    this.InsertPrintLog();
    jQuery("#printModal").modal('hide');
    jQuery("#printReasonModal").modal('hide');
    let locid = this.locationList.find(x => x.code == value.plantCode);
    // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
    var printContents = document.getElementById('print-section').innerHTML;
    // var temp1=this.locationList.find(x=>x.id==this.currentUser.baselocation);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locid.code + '-' + locid.name;
    //var name=this.requestType.toLocaleUpperCase();
    var ReportName = 'Customer Master Request Form';
    var reason = this.printReason;
    var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
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
        title: 'Customer Master request form',
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
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
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
    pdfMake.createPdf(docDefinition).open();
  }


  InsertPrintLog() {
    this.errMsg = "";
    let connection: any;
    let model: any = {};
    model.process = "Customer Master";
    model.printingReason = this.printReason;
    model.printedBy = this.currentUser.employeeId;
    model.printedOn = new Date().toLocaleString();
    model.requestNo = this.CustomerMastermodel.requestNo;
    connection = this.httpService.post(APIURLS.BR_PRINT_LOG_INSERT, model);

  }

  notFirst = true;

  checkAccountGroup() {
    if (this.CustomerMastermodel.accountGroupId == null || this.CustomerMastermodel.accountGroupId == '' || this.CustomerMastermodel.accountGroupId == undefined) this.notFirst = false;
  }

  checkCountry() {
    if (this.CustomerMastermodel.countryId == null || this.CustomerMastermodel.countryId == '' || this.CustomerMastermodel.countryId == undefined) this.notFirst = false;
  }

  checkState() {
    if (this.CustomerMastermodel.state == null || this.CustomerMastermodel.state == '' || this.CustomerMastermodel.state == undefined) this.notFirst = false;
  }

  checkPriceGroup() {
    if (this.CustomerMastermodel.priceGroup == null || this.CustomerMastermodel.priceGroup == '' || this.CustomerMastermodel.priceGroup == undefined) this.notFirst = false;
  }

  checkPriceList() {
    if (this.CustomerMastermodel.priceList == null || this.CustomerMastermodel.priceList == '' || this.CustomerMastermodel.priceList == undefined) this.notFirst = false;
  }

  checkTaxType() {
    if (this.CustomerMastermodel.taxType == null || this.CustomerMastermodel.taxType == '' || this.CustomerMastermodel.taxType == undefined) this.notFirst = false;
  }

  checkCurrency() {
    if (this.CustomerMastermodel.currencyId == null || this.CustomerMastermodel.currencyId == '' || this.CustomerMastermodel.currencyId == undefined) this.notFirst = false;
  }

  checkPaymentTerm() {
    if (this.CustomerMastermodel.paymentTermId == null || this.CustomerMastermodel.paymentTermId == '' || this.CustomerMastermodel.paymentTermId == undefined) this.notFirst = false;
  }

  checkAccountClerk() {
    if (this.CustomerMastermodel.accountClerkId == null || this.CustomerMastermodel.accountClerkId == '' || this.CustomerMastermodel.accountClerkId == undefined) this.notFirst = false;
  }

  checkTDSCode() {
    if (this.CustomerMastermodel.tdsCode == null || this.CustomerMastermodel.tdsCode == '' || this.CustomerMastermodel.tdsCode == undefined) this.notFirst = false
  }


  //excel upload methods
  isSubmitting: boolean;
  errorlist: string;
  uploadfiles(files: File) {
    // this.id='VM001';
    this.file = files[0];
  }

  upload(): any {
    let connection: any;
    this.isSubmitting = true;
    this.isLoading = true;

    const formData: FormData = new FormData();
    formData.append('file', this.file, this.file.name);
    
    connection = this.httpService.ExcelUploadForTD(APIURLS.BR_INSERTCUSTOMERMASTER, this.currentUser.employeeId, formData);
    connection.then((data: any) => {
      if (data) {
        if (data[0].type == 'E') {
          this.isLoading = false;
          this.errorlist = 'Error List';
          data.forEach(element => {
            this.errorlist = this.errorlist + '\n' + element.message;

          });

          alert(this.errorlist);
          this.reset();
          return;
        }
        else {
          let reqNoList: any[] = [];
          let reqnumber: string = '';
          if (data.length > 0) {
            reqNoList = data.filter(x => x.id > 0);
          }
          reqNoList.forEach(element => {
            reqnumber = reqnumber + "\n" + element.requestNo;
          });

          this.isLoading = false;
          swal({
            title: "Message",
            text: "Excel uploaded successfully with request numbers : " + reqnumber,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.reset();
      }

    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.errMsgPop = 'Error uploading file: ' + error;
    });
  }

  isMasterSel: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.CustomerMasterFilter.length; i++) {
      this.CustomerMasterFilter[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.CustomerMasterFilter.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.CustomerMasterFilter.length; i++) {
      if (this.CustomerMasterFilter[i].isSelected)
        this.checkedlist.push(this.CustomerMasterFilter[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  bulkApprove(status) {
    this.errMsg = "";
    let dt: any;
    this.checkedRequestList.forEach(element => {
      element.approveStatus = status;
      let connection = this.httpService.post(APIURLS.BR_UPDATE_BULKCS, element);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          dt = data;
        }
        this.isLoadingPop = false;
        this.getAllEntries();
      }).catch(error => {
        console.log(error);
        this.isLoadingPop = false;
        this.errMsgPop = 'Error in bulk approve: ' + error;
      });
    });
    if (dt == 200) {
      var req = this.checkedRequestList.map(x => x.requestNo).join();
      this.errMsgPop1 = "Requests " + req + " approved successfully."
    }
  }

  KeyValue: any;
  InsertHistory() {
    this.isLoading = true;
    this.httpService.get(APIURLS.INSERT_SAP_TRANSACION_HISTORY + "/" + this.KeyValue + "/" + this.RequestNo).then((data: any) => {
      if (data) {


      }
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
    });
  }
  RequestNo: any;
  Updatetransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    let temp = this.transactionsHistory.find(x => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
      || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
      x.parallelApprover4 == this.currentUser.employeeId) && x.transactionType == null);
    temp.comments = this.comments;
    temp.doneBy = this.currentUser.employeeId;
    temp.transactionType = id;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, temp.id, temp);
    connection.then((data) => {
      if (data == 200) {
        if (id == '4') {
          if (this.isEdit) {
            var loc = this.locationList.find(x => x.code == this.CustomerMastermodel.plantCode);
          }
          else {
            var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
          }

          var keyvalue = loc.code + '~' + this.CustomerMastermodel.customerType + ',' + 4;
          this.KeyValue = keyvalue;
          this.RequestNo = this.CustomerMastermodel.requestNo;
          this.InsertHistory();
        }
      }
    })

  }

  transactionsHistory: any[] = [];
  getHistory(reqNo) {
    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.httpService.getByParam(APIURLS.GET_SAP_REQUEST_HISTORY, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionsHistory = data;
        let temp = this.transactionsHistory.find(x => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
          || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
          x.parallelApprover4 == this.currentUser.employeeId) && x.transactionType == null);

        if (temp) {
          if (temp.approvalPriority == '1') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
          }
          if (temp.approvalPriority == '2') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
          }
          if (temp.approvalPriority == '3' || temp.approvalPriority == '4' || temp.approvalPriority == '5') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
          }
          if (temp.role == 'Creator') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
            this.Creator = true;
          }
          if (temp.role == 'Closure') {
            this.Approverid1 = temp.doneBy;
            this.Approver1 = true;
            this.Review = true;
            this.Aprlpriority = temp.approvalPriority;
            this.Approverid2 = temp.doneBy;
            this.Creator = true;
            this.Closure = true;
          }
        }
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.transactionsHistory = [];
    });
  }
}
