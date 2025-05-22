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
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

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
import { ServiceMasterChanges } from './ServiceMasterChanges.model';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { saveAs } from 'file-saver';

declare var require: any;

@Component({
  selector: 'app-ServiceMasterChanges',
  templateUrl: './ServiceMasterChanges.component.html',
  styleUrls: ['./ServiceMasterChanges.component.css']
})
export class ServiceMasterChangesComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
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

  //servicemasterchangesmodel = {} as ItemCodeExtension;
  // ItemCodeRequestModel = {} as ItemCodeRequest;
  // ItemCodeRequestModelList: ItemCodeRequest[] = [];
  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  servicemasterchangesmodel = {} as ServiceMasterChanges
  servicemasterchangeslist: ServiceMasterChanges[] = [];
  //  ItemCodeExtensionlist: ItemCodeExtension[] = [];
  materialtype: string;
  comments: string;
  filterMaterialCode: string = null;
  status: string = null;
  plantCode: string = null;
  filterrequest: string = null;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  // ItemCodeExtensionFilter: ItemCodeExtension[] = [];

  ServiceMastersearchlist: ServiceMasterChanges[] = [];
  ServiceMasterChangesFilter: ServiceMasterChanges[] = [];
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
  serviceCode: string;
  sacCode: string;
  serviceDescription: string;
  detailedServiceDescription: string;
  uom: string;
  serviceCategory: string;
  servicegroup: string;
  reason: string;

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
    // this.emailid = this.currentUser.email;
    this.status = 'Pending';
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
      this.servicemasterchangeslist = this.jsonData;
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
    this.serviceCode = null;
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.plantCode = null;
    this.status = null;

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
    filterModel.serviceCode = this.serviceCode;
    filterModel.plantCode = this.plantCode
    filterModel.status = this.status == 'Pending' ? 'InProcess,Submitted,ReSubmitted,Reverted,Reverted to initiator' : this.status;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.GET_FILTERED_RESULT_OF_SMC, filterModel).then((data: any) => {
      if (data) {

        this.ServiceMasterChangesFilter = data;

      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.ServiceMasterChangesFilter = [];
    });

  }


  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let code = this.locationList.find(x => x.id == this.currentUser.baselocation);
        this.getAllEntries();
      }
    }).catch(error => {
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
    this.serviceCode = "";
    this.servicemasterchangesmodel = {} as ServiceMasterChanges;
    this.comments = "";
    this.servicemasterchangesmodel.plantCode = "";
  }


  transactionslist: Transactions[] = [];
  gettransactions(reqNo) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data.filter(x=>x.processType=='Service Master Changes');
        //this.transactionslist.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
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

    //var loc = this.locationList.find(x => x.code == this.servicemasterchangesmodel.plantCode);
    //var mat = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId);
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);

    var keyvalue = value.plantCode + ',' + 5;

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
      this.isLoading = false;
      this.Approverslist = [];
    });
  }

  OnClickback() {
    this.resetForm();
    jQuery("#myModal").modal('show');
  }
  onClickNewRequest() {
    this.resetForm();
    this.ServiceMastersearchlist = [];
    //this.ItemCodeRequestModel = Object.assign({},ItemCodeRequest) ;  
    jQuery("#myModal").modal('show');

  }
  reset() {
    if (this.myInputVariable != null || this.myInputVariable != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }
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
  onUserActions(isedit: boolean, servicemasterchages: ServiceMasterChanges, isprint: boolean, value: string) {
    this.isEdit = isedit;
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
    this.gettransactions(servicemasterchages.id);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    if (isedit) {
      //   this.getApproversList(ItemCodeExtension);
      this.getApproversList(servicemasterchages);
      if (servicemasterchages.attachment != null || servicemasterchages.attachment != undefined) {
        this.attachments = servicemasterchages.attachment.split(',');
      }
      this.servicemasterchangesmodel = Object.assign({}, servicemasterchages);
      this.servicemasterchangesmodel.plantCode = servicemasterchages.plantCode;
      this.empId = this.servicemasterchangesmodel.createdBy;
    }


    else {
      servicemasterchages.plantCode = this.loc_code;
      if (servicemasterchages.attachment != null || servicemasterchages.attachment != undefined) {
        this.attachments = servicemasterchages.attachment.split(',');
      }
      this.servicemasterchangesmodel = Object.assign({}, servicemasterchages);
      this.getApproversList(servicemasterchages);
    }
    if (value == 'Copy') {
      servicemasterchages.modifiedBy = null;
      servicemasterchages.modifiedOn = null;
      servicemasterchages.status = null;
      servicemasterchages.attachment = null;
    }
    if (value == 'View') {
      this.Approver1 = true;
      this.Creator = true;
      this.view = true;
    }

    if (isprint) {
      let vc = this.ValuationClasslist.find(x => x.valuationId == this.servicemasterchangesmodel.valuationClass);
      this.valuationClass = vc.valuationId + '-' + vc.valuationDesc;
      let um = this.uomMasterList.find(x => x.uom == this.servicemasterchangesmodel.uom);
      this.Uom = um.uom + '-' + um.description;
      let pg = this.purchasegrouplist.find(x => x.purchaseGroupId == this.servicemasterchangesmodel.purchaseGroup);
      this.purchaseGroup = pg.purchaseGroupId + '-' + pg.purchaseGroupDesc;
      let ln = this.locationList.find(x => x.code == this.servicemasterchangesmodel.plantCode)
      this.locationName = ln.code + '-' + ln.name;
      jQuery("#printModal").modal('show');
    }
    else {
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
        // this.servicemasterchangesmodel.reason = this.reason;
        this.servicemasterchangesmodel.serviceCode = this.serviceCode;
        this.servicemasterchangesmodel.requestedDate = new Date().toLocaleString();
        this.servicemasterchangesmodel.createdBy = this.currentUser.employeeId;
        this.servicemasterchangesmodel.requestedBy = this.currentUser.employeeId;

        // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/serviceMaster/UploadedFiles/';
        if (this.fileslist != null || this.fileslist != undefined) {
          // let file:any='';

          let file: any = this.fileslist[0];
          for (let i = 1; i < this.fileslist.length; i++) {
            file = this.fileslist[i] + ',' + file;
          }
          this.servicemasterchangesmodel.attachment = file;

        }
        this.servicemasterchangesmodel.lastApprover = 'No';
        this.servicemasterchangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
        this.servicemasterchangesmodel.status = status == "Submit" ? "Submitted" : "Created";
        connection = this.httpService.post(APIURLS.BR_SERVICE_MASTER_CHANGES_POST_API, this.servicemasterchangesmodel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          this.id = data.id;
          this.uploadfile();
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = status == 'Save' ? 'Request ' + '' + data.id + '' + 'saved successfully!' : 'Request ' + '' + data.id + '' + ' submitted successfully!';
          jQuery("#saveModal").modal('show');
          if (data.status == "Submitted") {
            this.sendPendingMail(data);
            this.Inserttransactions(data, 0);
          }
          this.getAllEntries();
          this.reset();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error Saving Request..';
      });

    }


  }

  onSubmitEntry(servicemasterchages: ServiceMasterChanges) {

    this.servicemasterchangesmodel = {} as ServiceMasterChanges;
    this.servicemasterchangesmodel = Object.assign({}, servicemasterchages);
    this.errMsg = "";
    let connection: any;
    // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/serviceMaster/UploadedFiles/';
    if (this.fileslist != null || this.fileslist != undefined) {
      for (let i = 0; i < this.fileslist.length; i++) {
        this.servicemasterchangesmodel.attachment = this.servicemasterchangesmodel.attachment + ',' + this.fileslist[i];
      }

    }
    if (this.servicemasterchangesmodel.modifiedOn != null || this.servicemasterchangesmodel.modifiedOn != undefined) {
      this.servicemasterchangesmodel.status = "ReSubmitted";
    }
    else {
      this.servicemasterchangesmodel.status = "Submitted";
    }
    this.servicemasterchangesmodel.modifiedBy = this.currentUser.employeeId;
    //this.servicemasterchangesmodel.modifiedOn = new Date().toLocaleString();
    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemasterchangesmodel.id, this.servicemasterchangesmodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        this.id = this.servicemasterchangesmodel.serviceCode;
        this.uploadfile();
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request ' + '' + this.servicemasterchangesmodel.id + '' + ' Submitted Successfully!';
        jQuery("#saveModal").modal('show');
         this.sendPendingMail(this.servicemasterchangesmodel);
        this.Inserttransactions(this.servicemasterchangesmodel, 0);
        this.getAllEntries();
        this.reset();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request' + '' + this.servicemasterchangesmodel.id;
    });
  }
  Role: any;
  onreview(status) {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;
    if (status == "Rejected") {
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.servicemasterchangesmodel.pendingApprover = '';
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.Role = user.role;
      this.servicemasterchangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }


    this.servicemasterchangesmodel.lastApprover = this.currentUser.fullName;
    this.servicemasterchangesmodel.modifiedBy = this.currentUser.employeeId;
    // this.servicemasterchangesmodel.modifiedOn = new Date().toLocaleString();
    this.servicemasterchangesmodel.status = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemasterchangesmodel.id, this.servicemasterchangesmodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');

        //  var role=this.Approverslist.find(x=>x.role=='Approver')
        if (this.Role == "Approver") {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.servicemasterchangesmodel.id + '' + status + " Successfully!" : "Request " + this.servicemasterchangesmodel.id + " Approved Successfully!";
        }
        else {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.servicemasterchangesmodel.id + '' + status + " Successfully!" : "Request " + this.servicemasterchangesmodel.id + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
            this.sendPendingMail(this.servicemasterchangesmodel);
        }
        // this.sendMail(status, this.servicemasterchangesmodel)
        this.Inserttransactions(this.servicemasterchangesmodel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request" + '' + this.servicemasterchangesmodel.id : "Error Reviewing Request" + '' + this.servicemasterchangesmodel.id;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == "ReverttoInitiator") {
      let usid = this.currentUser.employeeId;
      let user = this.Approverslist.find(x => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
        || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

      this.servicemasterchangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
      this.servicemasterchangesmodel.status = "Reverted to initiator";
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let uid = this.servicemasterchangesmodel.modifiedBy;
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

      this.servicemasterchangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority + 1).priority;
      this.servicemasterchangesmodel.status = "Reverted";
    }

    this.servicemasterchangesmodel.lastApprover = this.currentUser.fullName;
    this.servicemasterchangesmodel.modifiedBy = this.currentUser.employeeId;
    // this.servicemasterchangesmodel.modifiedOn = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemasterchangesmodel.id, this.servicemasterchangesmodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + '' + this.servicemasterchangesmodel.id + '' + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        if (status != "ReverttoInitiator") {
          //   this.sendPendingMail(this.servicemasterchangesmodel);
        }
        // this.sendMail(status, this.servicemasterchangesmodel)
        this.Inserttransactions(this.servicemasterchangesmodel, id)
        this.getAllEntries();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request" + '' + this.servicemasterchangesmodel.id;
    });
  }

  onCreate() {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;

    let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
      || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

    let temp = this.Approverslist.find(x => x.priority == user.priority + 1);
    if (temp != null || temp != undefined) {
      this.servicemasterchangesmodel.pendingApprover = temp.approverId;
      this.servicemasterchangesmodel.status = 'InProcess';
    }
    else {
      this.servicemasterchangesmodel.pendingApprover = 'No';
      this.servicemasterchangesmodel.status = 'Completed';
    }
   // this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    this.servicemasterchangesmodel.lastApprover = this.currentUser.fullName;
    this.servicemasterchangesmodel.modifiedBy = this.currentUser.employeeId;
    //this.servicemasterchangesmodel.modifiedOn = new Date().toLocaleString();
    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_CHANGE_POST_API, this.servicemasterchangesmodel.id, this.servicemasterchangesmodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Service Code " + '' + this.servicemasterchangesmodel.id + '' + " Created Successfully!";
        jQuery("#saveModal").modal('show');
        if (this.servicemasterchangesmodel.pendingApprover != 'No') {
          //   this.sendPendingMail(this.servicemasterchangesmodel);
        }
        this.sendMail(this.servicemasterchangesmodel)
        this.Inserttransactions(this.servicemasterchangesmodel, 1)
        this.getAllEntries();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Creating Service Code..";
    });

  }
  priority: number;
  oncloserequest(status) {
    this.errMsg = "";
    let connection: any;

    if (status == 'Completed') {
      let uid = this.currentUser.employeeId;
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

      this.servicemasterchangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    this.servicemasterchangesmodel.lastApprover = this.currentUser.fullName;
    this.servicemasterchangesmodel.modifiedBy = this.currentUser.employeeId;
    //this.servicemasterchangesmodel.modifiedOn = new Date().toLocaleString();
    this.servicemasterchangesmodel.status = 'Completed';
    this.servicemasterchangesmodel.pendingApprover = 'No';
    this.priority = 7;
    connection = this.httpService.put(APIURLS.BR_SERVICE_MASTER_POST_API, this.servicemasterchangesmodel.id, this.servicemasterchangesmodel);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = "Request " + '' + this.servicemasterchangesmodel.id + '' + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.Inserttransactions(this.servicemasterchangesmodel, 1)
        // this.sendMail('Created', this.ItemCodeRequestModel) 
        this.getAllEntries();
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request" + '' + this.servicemasterchangesmodel.id;
    });
  }
  transactions = {} as Transactions;
  Inserttransactions(data, id) {
    this.errMsg = "";
    let connection: any;
    this.transactions.doneBy = this.currentUser.employeeId;
    // this.transactions.doneOn = new Date().toLocaleString();
    this.transactions.requestNo = data.id;
    this.transactions.comments = this.comments;
    this.transactions.approvalPriority = this.priority;
    this.transactions.transactionType = id;
    this.transactions.processType = "Service Master Changes";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

  }

  sendPendingMail(vendormasterchanges: ServiceMasterChanges) {
    let connection: any;

    connection = this.httpService.sendPutMail(APIURLS.SEND_SERVICE_MOD_MAIL, 'VendorPending', vendormasterchanges);
    connection.then((data: any) => {
        if (data == 200) {
        }
    }).catch(error => {
        this.errMsgPop = 'Error in sending mail..';
    });

}
sendMail(vendormasterchanges: ServiceMasterChanges) {
  let connection: any;

  connection = this.httpService.sendPutMail(APIURLS.SEND_SERVICE_APPROVED_MOD_MAIL, 'VendorCompleted', vendormasterchanges);
  connection.then((data: any) => {
      if (data == 200) {
      }
  }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
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
    // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/serviceMaster/UploadedFiles/';
    connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch(error => {
      this.errMsgPop = 'Error uploading file ..';
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
    this.servicemasterchangesmodel.attachment = attach;
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
        })
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error deleteing file..';
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
  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }


  notFirst = true;

  checkPurchaseGroup() {
    if (this.servicemasterchangesmodel.purchaseGroup == null || this.servicemasterchangesmodel.purchaseGroup == '' || this.servicemasterchangesmodel.purchaseGroup == undefined) this.notFirst = false;
  }

  checkLocation() {
    if (this.servicemasterchangesmodel.plantCode == null || this.servicemasterchangesmodel.plantCode == '' || this.servicemasterchangesmodel.plantCode == undefined) this.notFirst = false;
  }

  checkServiceCategory() {
    if (this.servicemasterchangesmodel.serviceCategory == null || this.servicemasterchangesmodel.serviceCategory == '' || this.servicemasterchangesmodel.serviceCategory == undefined) this.notFirst = false;
  }

  checkUom() {
    if (this.servicemasterchangesmodel.uom == null || this.servicemasterchangesmodel.uom == '' || this.servicemasterchangesmodel.uom == undefined) this.notFirst = false;
  }

  checkValuationClass() {
    if (this.servicemasterchangesmodel.valuationClass == null || this.servicemasterchangesmodel.valuationClass == '' || this.servicemasterchangesmodel.valuationClass == undefined) this.notFirst = false;
  }

  checkServiceGroup() {
    if (this.servicemasterchangesmodel.serviceGroup == null || this.servicemasterchangesmodel.serviceGroup == '' || this.servicemasterchangesmodel.serviceGroup == undefined) this.notFirst = false;
  }

  getCodeDetails() {
    let connection: any;
    this.isLoading = true;
    connection = this.httpService.getByParam(APIURLS.BR_SERVICE_MASTERCHANGES_APPROVERS_GETBY_PARAM_ALL, this.serviceCode)
    connection.then((data) => {
      if (data.length > 0) {
        this.servicemasterchangesmodel.serviceCode = data[0].sapCodeNo
        this.servicemasterchangesmodel.requestedDate = new Date().toLocaleString();
        this.servicemasterchangesmodel.serviceCategory = data[0].serviceCatagory;
        this.servicemasterchangesmodel.plantCode = data[0].plantCode;
        this.servicemasterchangesmodel.sacCode = data[0].sacCode;
        this.servicemasterchangesmodel.serviceDescription = data[0].serviceDescription;
        this.servicemasterchangesmodel.detailedServiceDescription = data[0].detailedDesc;
        this.servicemasterchangesmodel.purchaseGroup = data[0].purchaseGroup;
        this.servicemasterchangesmodel.uom = data[0].uom;
        this.servicemasterchangesmodel.serviceGroup = data[0].serviceGroup;
        this.servicemasterchangesmodel.valuationClass = data[0].valuationClass;
        this.getApproversList(data[0]);
      }
      this.isLoading = false;

    }).catch((error) => {
      this.isLoading = false;

    })
  }


}
