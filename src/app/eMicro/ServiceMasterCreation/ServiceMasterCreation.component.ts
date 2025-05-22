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
import { MatAutocompleteTrigger } from '@angular/material';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { ItemCodeExtension } from '../ItemCodeExtension/ItemCodeExtension.model';
import { ProcessMaster } from '../Masters/ProcessMaster/ProcessMaster.model';
import { MaterialGroup } from '../Masters/MaterialGroup/MaterialGroup.model';
import { StorageLocation } from '../Masters/StorageLocation/StorageLocation.model';
import { MaterialType } from '../../masters/material/materialtype.model';
import { UOM } from '../../masters/uom/uom.model';
import { DmfGrade } from '../Masters/dmfgrademaster/dmfgrademaster.model';
import { PharmaGrade } from '../Masters/PharmacopeialGrade/PharmacopeialGrade.model';
import { PurchaseGroup } from '../Masters/PurchaseGroup/PurchaseGroup.model';
import { Transactions } from '../ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { StorageCondition } from '../Masters/storagecondition/storagecondition.model';
import { TempCondition } from '../Masters/tempcondition/tempcondition.model';
import { Country } from '../Masters/Country/Country.model';
import { stringify } from 'querystring';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ServiceMaster } from './ServiceMasterCreation.model';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { saveAs } from 'file-saver';
declare var require: any;

@Component({
  selector: 'app-ServiceMasterCreation',
  templateUrl: './ServiceMasterCreation.component.html',
  styleUrls: ['./ServiceMasterCreation.component.css']
})
export class ServiceMasterCreationComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  // @ViewChild(NgForm) dataForm: NgForm;
  // @ViewChild(NgForm) PMForm: NgForm;
  // @ViewChild(NgForm) BULKForm: NgForm;
  // @ViewChild(NgForm) RMNGXPForm: NgForm;
  // @ViewChild(NgForm) PMNGXPForm: NgForm;
  // @ViewChild(NgForm) BULKNGXPForm: NgForm;
  // @ViewChild(NgForm) FGNGXPForm: NgForm;
  // @ViewChild(NgForm) LCNGXPForm: NgForm;
  // @ViewChild(NgForm) OSENGXPForm: NgForm;
  // @ViewChild(NgForm) PPCNGXPForm: NgForm;
  // @ViewChild(NgForm) RMForm: NgForm;
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

  //servicemastermodel = {} as ItemCodeExtension;
  // ItemCodeRequestModel = {} as ItemCodeRequest;
  // ItemCodeRequestModelList: ItemCodeRequest[] = [];
  @ViewChild('myInput') myInputVariable: ElementRef;

  servicemastermodel = {} as ServiceMaster
  servicemasterliist: ServiceMaster[] = [];
  //  ItemCodeExtensionlist: ItemCodeExtension[] = [];
  materialtype: string;
  comments: string;
  filterMaterialCode: string = null;
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  // ItemCodeExtensionFilter: ItemCodeExtension[] = [];

  ServiceMastersearchlist: ServiceMaster[] = [];
  ServiceMasterFilter: ServiceMaster[] = [];
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
  loc_code: string;

  storeData: any;
  jsonData: any;
  fileUploaded: File;
  worksheet: any;

  // ItemCodeExtensionModeldata = {} as ItemCodeExtension;

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


    this.getLocationMaster();
    this.getserviceCategoryList();
    this.getservicegroupList();
    this.getUOMMasterList();
    this.getpurchasegroupList();
    this.getValuationClassList();
    this.getbase64image();
    // }
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
      this.servicemasterliist = this.jsonData;
      //this.jsonData = JSON.stringify(this.jsonData);  
      // console.log(this.jsonData);

    }
    readFile.readAsArrayBuffer(this.fileUploaded);
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

  }


  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
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
    filterModel.location = this.filterlocation == null ? '' : this.locationList.find(x => x.id == this.filterlocation).code;
    filterModel.requestNo = this.filterrequest;
    filterModel.status = this.filterstatus == 'Pending' ? 'Created,InProcess,Submitted,ReSubmitted,Reverted,Reverted to initiator' : this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_SERVICE_MASTER_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        if (this.filterstatus == 'Pending') {
          this.ServiceMasterFilter = data.filter(x => x.pendingApprover == this.currentUser.fullName || x.requestedBy == this.currentUser.employeeId);
          this.ServiceMasterFilter.reverse();
        }
        else {
          this.ServiceMasterFilter = data;
          this.ServiceMasterFilter.reverse();
        }
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ServiceMasterFilter = [];
    });

  }
  continue: boolean = false;
  getSearchResult() {
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
    filterModel.serviceCatagory = this.servicemastermodel.serviceCatagory;
    filterModel.status = 'Completed';
    filterModel.serviceDescription = this.servicemastermodel.serviceDescription;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_SERVICE_MASTER_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.ServiceMastersearchlist = data;
        this.ServiceMastersearchlist.reverse();
      }
      this.continue = true;
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ServiceMastersearchlist = [];
    });


  }

  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let code = this.locationList.find(x => x.id == this.currentUser.baselocation);
        this.loc_code = code.code;
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.locationList = [];
    });
  }

  servicegrouplist: any[] = [];
  getservicegroupList() {
    this.httpService.get(APIURLS.BR_SERVICE_GROUP_POST_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.servicegrouplist = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.servicegrouplist = [];
    });
  }
  serviceCategorylist: any[] = [];
  getserviceCategoryList() {
    this.httpService.get(APIURLS.BR_SERVICE_CATEGORY_POST_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.serviceCategorylist = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.serviceCategorylist = [];
    });
  }
  purchasegrouplist: any[] = [];
  getpurchasegroupList() {
    this.httpService.get(APIURLS.BR_MASTER_PURCHASE_GROUP_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.purchasegrouplist = data;
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.purchasegrouplist = [];
    });
  }
  uomMasterList: any[] = [];
  getUOMMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_UOM_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.uomMasterList = data.filter(x => x.isActive);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.uomMasterList = [];
    });
  }
  ValuationClasslist: any[] = [];
  getValuationClassList() {
    this.httpService.get(APIURLS.BR_MASTER_VALUATION_CLASS_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.ValuationClasslist = data;
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.ValuationClasslist = [];
    });
  }
  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }
  fileslist: any[] = [];
  resetForm() {

    this.servicemastermodel = {} as ServiceMaster;
    this.comments = "";
    this.servicemastermodel.plantCode = this.loc_code;
  }


  transactionslist: Transactions[] = [];
  gettransactions(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        //this.transactionslist.reverse();
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

  view: boolean = false;
  getApproversList(value) {

    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.servicemastermodel = Object.assign({}, value);
    //var loc = this.locationList.find(x => x.code == this.servicemastermodel.plantCode);
    //var mat = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId);
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);

    var keyvalue = this.servicemastermodel.plantCode + ',' + 5;
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
    this.ServiceMastersearchlist = [];
    //this.ItemCodeRequestModel = Object.assign({},ItemCodeRequest) ;  
    jQuery("#searchModal").modal('show');

  }
  reset() {
    if (this.myInputVariable != null || this.myInputVariable != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }
  fileslist1: File[] = [];
  validateAttachment() {
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

  removefile(name) {
    const index = this.fileslist.indexOf(name);
    this.fileslist.splice(index, 1);
  }
  empId: string;
  valuationClass: string;
  Uom: string;
  purchaseGroup: string;
  locationName: string;
  attachments: any[] = [];
  onUserActions(isedit: boolean, servicemaster: ServiceMaster, isprint: boolean, value: string) {
    this.isEdit = isedit;
    this.continue = false;
    this.resetForm();
    this.fileslist = [];
    this.files = [];
    this.fileslist1 = [];
    this.Approverslist = [];
    this.transactionslist = [];
    this.view = false;
    this.errMsg1 = "";
    this.attachments = [];
    // this.reset();
    this.isLoadingPop = false;
    this.getHistory(servicemaster.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      //   this.getApproversList(ItemCodeExtension);
      this.getApproversList(servicemaster);
      if (servicemaster.attachment != null || servicemaster.attachment != undefined) {
        this.attachments = servicemaster.attachment.split(',');
      }
      this.servicemastermodel = Object.assign({}, servicemaster);
      this.servicemastermodel.plantCode = servicemaster.plantCode;
      this.empId = this.servicemastermodel.createdBy;
    }


    else {
      servicemaster.plantCode = this.loc_code;
      if (servicemaster.attachment != null || servicemaster.attachment != undefined) {
        this.attachments = servicemaster.attachment.split(',');
      }
      this.servicemastermodel = Object.assign({}, servicemaster);
      this.getApproversList(servicemaster);
    }
    if (value == 'Copy') {
      servicemaster.modifiedBy = null;
      servicemaster.modifiedDate = null;
      servicemaster.appSatus = null;
      servicemaster.attachment = null;
    }
    if (value == 'View') {
      this.Approver1 = true;
      this.Creator = true;
      this.view = true;
    }

    if (isprint) {
      let vc = this.ValuationClasslist.find(x => x.valuationId == this.servicemastermodel.valuationClass);
      this.valuationClass = vc.valuationId + '-' + vc.valuationDesc;
      let um = this.uomMasterList.find(x => x.uom == this.servicemastermodel.uom);
      this.Uom = um.uom + '-' + um.description;
      let pg = this.purchasegrouplist.find(x => x.purchaseGroupId == this.servicemastermodel.purchaseGroup);
      this.purchaseGroup = pg.purchaseGroupId + '-' + pg.purchaseGroupDesc;
      let ln = this.locationList.find(x => x.code == this.servicemastermodel.plantCode)
      this.locationName = ln.code + '-' + ln.name;
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
        this.servicemastermodel.id = 0;
        this.servicemastermodel.requestNo = null;
        this.servicemastermodel.modifiedBy = null;
        this.servicemastermodel.modifiedDate = null;
        this.servicemastermodel.sapCodeNo = null;
        this.servicemastermodel.sapCodeExists = null;
        this.servicemastermodel.sapCreationDate = null;
        this.servicemastermodel.sapCreatedBy = null;
        this.servicemastermodel.createdBy = this.currentUser.employeeId;
        // this.servicemastermodel.requestDate = new Date().toLocaleString();
        this.servicemastermodel.requestedBy = this.currentUser.employeeId;
        //   this.servicemastermodel.createdDate = new Date().toLocaleString();
        // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/serviceMaster/UploadedFiles/';
        if (this.fileslist != null || this.fileslist != undefined) {
          // let file:any='';

          let file: any = this.fileslist[0];
          for (let i = 1; i < this.fileslist.length; i++) {
            file = this.fileslist[i] + ',' + file;
          }
          this.servicemastermodel.attachment = file;

        }
        this.servicemastermodel.lastApprover = this.servicemastermodel.appSatus == "Reverted to initiator" ? this.servicemastermodel.lastApprover : "No";
        this.servicemastermodel.pendingApprover = status == "Submit" ? this.Approverslist.find(x => x.priority == 1).approverId : this.currentUser.employeeId;
        this.servicemastermodel.appSatus = status == "Submit" ? "Submitted" : "Created";

        connection = this.httpService.post(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemastermodel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          this.id = data.requestNo;
          this.RequestNo = data.requestNo;
          this.uploadfile();
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = status == 'Save' ? 'Request ' + data.requestNo + ' saved successfully!' : 'Request ' + data.requestNo + ' submitted successfully!';
          jQuery("#saveModal").modal('show');
          if (data.appSatus == "Submitted") {
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

  onSubmitEntry(servicemaster: ServiceMaster) {

    this.servicemastermodel = {} as ServiceMaster;
    this.servicemastermodel = Object.assign({}, servicemaster);
    this.errMsg = "";
    let connection: any;
    // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/serviceMaster/UploadedFiles/';
    if (this.fileslist != null || this.fileslist != undefined) {
      for (let i = 0; i < this.fileslist.length; i++) {
        this.servicemastermodel.attachment = this.servicemastermodel.attachment + ',' + this.fileslist[i];
      }

    }
    if (this.servicemastermodel.modifiedDate != null || this.servicemastermodel.modifiedDate != undefined) {
      this.servicemastermodel.appSatus = "ReSubmitted";
    }
    else {
      this.servicemastermodel.appSatus = "Submitted";
    }
    this.servicemastermodel.modifiedBy = this.currentUser.employeeId;

    this.servicemastermodel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
    this.servicemastermodel.approvers = this.Approverslist;

    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_CREATESAVEDENTRY, this.servicemastermodel.id, this.servicemastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.id = this.servicemastermodel.requestNo;
        this.uploadfile();
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request ' + this.servicemastermodel.requestNo + ' Submitted Successfully!';
        jQuery("#saveModal").modal('show');
        this.sendPendingMail(this.servicemastermodel);
        // this.Updatetransactions(this.servicemastermodel, 0);
        this.getAllEntries();
        this.reset();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request ' + this.servicemastermodel.requestNo + ": " + error;
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
      this.servicemastermodel.pendingApprover = '';
      //  this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);
      //  this.Role=user.role;
      this.servicemastermodel.pendingApprover = temp.doneBy;
      //  this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }

    this.servicemastermodel.lastApprover = this.currentUser.fullName;
    this.servicemastermodel.modifiedBy = this.currentUser.employeeId;
    // this.servicemastermodel.modifiedDate = new Date().toLocaleString();
    this.servicemastermodel.appSatus = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemastermodel.id, this.servicemastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');

        //  var role=this.Approverslist.find(x=>x.role=='Approver')
        if (this.Role == "Approver") {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.servicemastermodel.requestNo + '' + status + " Successfully!" : "Request " + this.servicemastermodel.requestNo + " Approved Successfully!";
        }
        else {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.servicemastermodel.requestNo + '' + status + " Successfully!" : "Request " + this.servicemastermodel.requestNo + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
          this.sendPendingMail(this.servicemastermodel);
        }
        this.sendMail(status, this.servicemastermodel)
        this.Updatetransactions(this.servicemastermodel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request " + this.servicemastermodel.requestNo + ": " + error : "Error Reviewing Request " + this.servicemastermodel.requestNo + ": " + error;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == "ReverttoInitiator") {
      let uid = this.currentUser.employeeId;
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

      this.servicemastermodel.pendingApprover = temp.doneBy;
      this.servicemastermodel.appSatus = "Reverted to initiator";
      // this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let uid = this.servicemastermodel.modifiedBy;
      let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
        || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

      this.servicemastermodel.pendingApprover = temp.doneBy;
      // this.priority = this.Approverslist.find(x => x.priority == user.priority + 1).priority;
      this.servicemastermodel.appSatus = "Reverted";
    }

    this.servicemastermodel.lastApprover = this.currentUser.fullName;
    this.servicemastermodel.modifiedBy = this.currentUser.employeeId;
    // this.servicemastermodel.modifiedDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemastermodel.id, this.servicemastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + '' + this.servicemastermodel.requestNo + '' + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        this.getAllEntries();
        if (status != "ReverttoInitiator") {
          this.sendPendingMail(this.servicemastermodel);
        }
        this.sendMail(status, this.servicemastermodel);
        this.Updatetransactions(this.servicemastermodel, id);
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request " + this.servicemastermodel.requestNo + ": " + error;
    });
  }

  onCreate() {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;

    let temp = this.transactionsHistory.find(x => (x.doneBy == uid || x.parallelApprover1 == uid || x.parallelApprover2 == uid
      || x.parallelApprover3 == uid || x.parallelApprover4 == uid) && x.transactionType == null);

    // let temp = this.Approverslist.find(x => x.priority == user.priority + 1);
    if (temp != null || temp != undefined) {
      let appr = this.transactionsHistory.find(x => x.approvalPriority == temp.approvalPriority + 1);
      if (appr != null || appr != undefined) {
        this.servicemastermodel.pendingApprover = appr.doneBy;
      }
      else {
        this.servicemastermodel.pendingApprover = 'No';
        this.servicemastermodel.appSatus = 'Completed';
      }
      // this.servicemastermodel.pendingApprover = temp.doneBy;
      // this.servicemastermodel.appSatus = 'InProcess';
    }
    // else {
    //   this.servicemastermodel.pendingApprover = 'No';
    //   this.servicemastermodel.appSatus = 'Completed';
    // }

    // this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    this.servicemastermodel.lastApprover = this.currentUser.fullName;
    this.servicemastermodel.modifiedBy = this.currentUser.employeeId;
    //this.servicemastermodel.modifiedDate = new Date().toLocaleString();
    this.servicemastermodel.sapCreatedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;

    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemastermodel.id, this.servicemastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Service Code " + '' + this.servicemastermodel.sapCodeNo + '' + " Created Successfully!";
        jQuery("#saveModal").modal('show');
        this.getAllEntries();
        if (this.servicemastermodel.pendingApprover != 'No') {
          this.sendPendingMail(this.servicemastermodel);
        }
        this.sendMail('Created', this.servicemastermodel);
        this.Updatetransactions(this.servicemastermodel, 1);
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Creating Service Code: " + error;
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

      this.servicemastermodel.pendingApprover = temp.doneBy;
      //  this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    this.servicemastermodel.lastApprover = this.currentUser.fullName;
    this.servicemastermodel.modifiedBy = this.currentUser.employeeId;
    //this.servicemastermodel.modifiedDate = new Date().toLocaleString();
    this.servicemastermodel.appSatus = 'Completed';
    this.servicemastermodel.pendingApprover = 'No';
    this.priority = 7;
    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemastermodel.id, this.servicemastermodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + '' + this.servicemastermodel.requestNo + '' + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.getAllEntries();
        this.Updatetransactions(this.servicemastermodel, 1);
        // this.sendMail('Created', this.ItemCodeRequestModel) 
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request " + this.servicemastermodel.requestNo + ": " + error;
    });
  }
  transactions = {} as Transactions;
  Inserttransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    this.transactions.doneBy = this.currentUser.employeeId;
    // this.transactions.doneOn = new Date().toLocaleString();
    this.transactions.requestNo = data.requestNo;
    this.transactions.comments = this.comments;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.processType = "Service Master Request";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);
  }

  sendMail(type, servicemaster: ServiceMaster) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_SERVICE_MASTER_EMAIL_API, 'SM' + '-' + type, servicemaster);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });
  }

  sendPendingMail(servicemaster: ServiceMaster) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_SERVICE_MASTER_PENDING_EMAIL_API, 'ServicePending', servicemaster);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      console.log(error);
      this.errMsgPop = 'Error in sending mail: ' + error;
    });
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
      //  this.attachments.push(this.files[i].name);
    }

    this.validateAttachment();
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
    // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/serviceMaster/UploadedFiles/';
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
    //let attach:any='';
    if (this.attachments.length > 1) {
      const index = this.attachments.indexOf(name);
      this.attachments.splice(index, 1);
    }
    let attach: any = this.attachments[0];
    for (let i = 1; i < this.attachments.length; i++) {
      attach = this.attachments[i] + ',' + attach;
    }
    item.attachment = attach;
    this.servicemastermodel.attachment = attach;
    let connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, item.id, item);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        swal({
          title: "Message",
          text: "file deleted successfully",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
      }
    }).catch(error => {
      console.log(error);
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleting file: ' + error;
    });
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

  showprintmodel(data: ServiceMaster) {
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
    jQuery("#printModal").modal('hide');
    jQuery("#printReasonModal").modal('hide');
    this.InsertPrintLog();
    let locid = this.locationList.find(x => x.code == value.plantCode);
    // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
    var printContents = document.getElementById('print-section').innerHTML;
    // var temp1=this.locationList.find(x=>x.id==this.currentUser.baselocation);
    var OrganisationName = "MICRO LABS LIMITED" + ', ' + locid.code + '-' + locid.name;
    //var name=this.requestType.toLocaleUpperCase();
    var ReportName = 'Service Master Request Form';
    var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
    var now = new Date();
    var reason = this.printReason;
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
        title: 'Service Master request form',
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
    model.process = "Service Master";
    model.printingReason = this.printReason;
    model.printedBy = this.currentUser.employeeId;
    model.printedOn = new Date().toLocaleString();
    model.requestNo = this.servicemastermodel.requestNo;
    connection = this.httpService.post(APIURLS.BR_PRINT_LOG_INSERT, model);
  }

  notFirst = true;

  checkPurchaseGroup() {
    if (this.servicemastermodel.purchaseGroup == null || this.servicemastermodel.purchaseGroup == '' || this.servicemastermodel.purchaseGroup == undefined) this.notFirst = false;
  }

  checkLocation() {
    if (this.servicemastermodel.plantCode == null || this.servicemastermodel.plantCode == '' || this.servicemastermodel.plantCode == undefined) this.notFirst = false;
  }

  checkServiceCategory() {
    if (this.servicemastermodel.serviceCatagory == null || this.servicemastermodel.serviceCatagory == '' || this.servicemastermodel == undefined) this.notFirst = false;
  }

  checkUom() {
    if (this.servicemastermodel.uom == null || this.servicemastermodel.uom == '' || this.servicemastermodel.uom == undefined) this.notFirst = false;
  }

  checkValuationClass() {
    if (this.servicemastermodel.valuationClass == null || this.servicemastermodel.valuationClass == '' || this.servicemastermodel.valuationClass == undefined) this.notFirst = false;
  }

  checkServiceGroup() {
    if (this.servicemastermodel.serviceGroup == null || this.servicemastermodel.serviceGroup == '' || this.servicemastermodel.serviceGroup == undefined) this.notFirst = false;
  }

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

    connection = this.httpService.ExcelUploadForTD(APIURLS.BR_INSERTSERVICEMASTER, this.currentUser.employeeId, formData);
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
    for (var i = 0; i < this.ServiceMasterFilter.length; i++) {
      this.ServiceMasterFilter[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.ServiceMasterFilter.every(function (item: any) {
      return item.isSelected == true;
    });
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.ServiceMasterFilter.length; i++) {
      if (this.ServiceMasterFilter[i].isSelected) {
        this.checkedlist.push(this.ServiceMasterFilter[i]);
      }
    }
    this.checkedRequestList = this.checkedlist;
  }

  bulkApprove(status) {
    this.errMsg = "";
    let dt: any;
    this.checkedRequestList.forEach(element => {
      element.approveStatus = status;
      let connection = this.httpService.post(APIURLS.BR_UPDATE_BULKSR, element);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          dt = data;
        }
      }).catch(error => {
        console.log(error);
        this.isLoadingPop = false;
        this.errMsgPop = 'Error: ' + error;
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
            var loc = this.locationList.find(x => x.code == this.servicemastermodel.plantCode);
          }
          else {
            var loc = this.locationList.find(x => x.id == this.currentUser.baselocation);
          }

          var keyvalue = loc.code + ',' + 5;
          this.KeyValue = keyvalue;
          this.RequestNo = this.servicemastermodel.requestNo;
          this.InsertHistory();
        }
      }
    });
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
