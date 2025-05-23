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
//import { debug } from 'util';
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
import { ExcelService } from '../../shared/excel-service';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ServiceMaster } from '../ServiceMasterCreation/ServiceMasterCreation.model';
import { VendorMaster } from '../VendorMaster/VendorMaster.model';
import { CustomerMaster } from '../CustomerMaster/CustomerMaster.model';
import { saveAs } from 'file-saver';
import { Serialization } from '../ItemCodeCreation/Serialization.model';
import { CodeCreationInputs } from './CodeCreationInputs.model';
import { CodeCreationOutputs } from './codecreationoutputs.model';
declare var require: any;

@Component({
  selector: 'app-Masscodecreation',
  templateUrl: './Masscodecreation.component.html',
  styleUrls: ['./Masscodecreation.component.css']
})
export class MassCodeCreationComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild('myInput') myInputVariable: ElementRef;
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
  errMsgModalPop: string = "";
  path: string = '';
  locationList: any[] = [[]];

  exportList: any[];
  filterstatus: string = null;
  filterlocation: string = null;
  filterrequest: string = null;
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  SAP_from_date: any = null;
  SAP_to_date: any = null;
  filtertype: string = null;
  reportdata: any[] = [];
  comments: any;
  tdseligible: any;
  filterBy: string = null;
  filtermaterialtype: string = null;
  filtermaterialgroup: string = null;
  emailid: string;
  // ItemCodeExtensionModeldata = {} as ItemCodeExtension;

  constructor(private appService: AppComponent, private httpService: HttpService, private excelService: ExcelService, private router: Router) { }

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
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
    this.output = false;
    this.getMastersdata();
  }


  approverstatuslist: any[] = [
    { id: 1, name: 'Reviewed' },
    { id: 2, name: 'Reviewed' },
    { id: 3, name: 'Reviewed' },
    { id: 4, name: 'Approved' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Created' },
    { id: 7, name: 'Closed' }
  ];
  materialList: any[] = [
    { id: 10, type: 'LC', description: 'Lab Chemicals' },
    { id: 12, type: 'PPC', description: 'Promotional, Ptd & Compliments' },
    { id: 13, type: 'OSE', description: 'Operational Supplies and Equipment' }
  ];

  storageconditionlist: StorageCondition[] = [];
  tempconditionlist: TempCondition[] = [];
  PackSizelist: any[] = [];
  Divisionlist: any[] = [];
  Brandlist: any[] = [];
  Strengthlist: any[] = [];
  departmentList: any[] = [];
  countrylist: Country[] = [];
  DmfGradelist: DmfGrade[] = [];
  purchasegrouplist: PurchaseGroup[] = [];
  processlist: ProcessMaster[] = [];
  materialgroupList: MaterialGroup[] = [];
  materialList1: MaterialType[] = [];
  uomMasterList: UOM[] = [];
  storagelocationlist: StorageLocation[] = [];
  storagelocationlist1: StorageLocation[] = [];
  ValuationClasslist: any[] = [];
  ValuationClasslist1: any[] = [];
  pharmagradelist: PharmaGrade[] = [];
  TherapeuticSegmentlist: any[] = [];
  GenericNamelist: any[] = [];
  PackageMaterialGroup: any[] = [];

  masterslist: any[] = [];
  getMastersdata() {
    this.httpService.post(APIURLS.BR_GET_MASTERS_DATA_API, '').then((data: any) => {
      if (data) {
        this.masterslist = data;
        //let master:any;
        this.masterslist.forEach(master => {
          let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
          this.storageconditionlist = master.storageCondition;          
          this.storageconditionlist.sort((a, b) => { return collator.compare(a.stoCondCode, b.stoCondCode) });
          this.tempconditionlist = master.tempCondition;
          this.tempconditionlist.sort((a, b) => { return collator.compare(a.tempConId, b.tempConId) });
          this.PackSizelist = master.packSize;
          this.PackSizelist.sort((a, b) => { return collator.compare(a.packSizeCode, b.packSizeCode) });
          this.Divisionlist = master.division;
          this.Divisionlist.sort((a, b) => { return collator.compare(a.divCode, b.divCode) });
          this.departmentList = master.departmentMaster;
          this.departmentList.sort((a, b) => { return collator.compare(a.name, b.name) });
          this.pharmagradelist = master.pharmaGrade;   
          this.pharmagradelist.sort((a, b) => { return collator.compare(a.pharmaGradeId.toString(), b.pharmaGradeId.toString()) });      
          this.purchasegrouplist = master.purchaseGroup;
          this.purchasegrouplist.sort((a, b) => { return collator.compare(a.purchaseGroupId, b.purchaseGroupId) });
          this.locationList = master.locationMaster;
          this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
          //this.materialList = master.materialType;
          this.materialgroupList = master.materialGroup;
          this.materialgroupList.sort((a, b) => { return collator.compare(a.materialGroupId, b.materialGroupId) });
          this.countrylist = master.country;
          this.countrylist.sort((a, b) => { return collator.compare(a.landx, b.landx) });
          this.DmfGradelist = master.dmfGrade;
          this.DmfGradelist.sort((a, b) => { return collator.compare(a.dmfGradeId, b.dmfGradeId) });
          this.processlist = master.storageCondition;          
          this.GenericNamelist = master.genericName;
          this.GenericNamelist.sort((a, b) => { return collator.compare(a.genNameCode, b.genNameCode) });
          this.TherapeuticSegmentlist = master.therapeuticSegment;
          this.TherapeuticSegmentlist.sort((a, b) => { return collator.compare(a.therSegCode, b.therSegCode) });
          this.ValuationClasslist = master.valuationClass;
          this.ValuationClasslist.sort((a, b) => { return collator.compare(a.valuationId, b.valuationId) });
          this.storagelocationlist = master.storageLocation;
          this.storagelocationlist.sort((a, b) => { return collator.compare(a.storageLocationId, b.storageLocationId) });
          this.Brandlist = master.brand;
          this.Brandlist.sort((a, b) => { return collator.compare(a.brandCode, b.brandCode) });
          this.Strengthlist = master.strength;
          this.Strengthlist.sort((a, b) => { return collator.compare(a.strengthCode, b.strengthCode) });
          this.uomMasterList = master.uomMaster;
          this.uomMasterList.sort((a, b) => { return collator.compare(a.uom, b.uom) });
          this.PackageMaterialGroup = master.packageMaterialGroup;
          this.PackageMaterialGroup.sort((a, b) => { return collator.compare(a.packingMaterialGroupId, b.packingMaterialGroupId) });
        
        });


      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.masterslist = [];
    });

  }


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
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.filterlocation = null;
    this.filterstatus = null;
    this.filterrequest = null;
    this.filtertype = null;
    this.filtermaterialtype = null;
    this.filterBy = null;
    this.filtermaterialgroup = null;
  }


  location(id) {
    let loc = this.locationList.find(x => x.id == id);
    return loc ? loc.code : "";
  }
  ItemCodeRequestFilter: any[] = [];
  getAllEntries() {
    this.isLoading = true;
    this.output = false;
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
    this.filterstatus = 'Pending';
    filterModel.materialType = this.filtermaterialtype == null ? '10,12,13' : this.filtermaterialtype;
    filterModel.location = this.filterlocation;
    filterModel.requestNo = this.filterrequest;
    filterModel.count = this.filterBy;
    filterModel.materialGroupId = this.filtermaterialgroup;
    filterModel.creator='1';
    filterModel.status = this.filterstatus == 'Pending' ? 'InProcess,Submitted,ReSubmitted,Reverted,Reverted to initiator' : this.filterstatus;
    filterModel.fromDate = this.getFormatedDateTime(this.from_date);
    filterModel.toDate = this.getFormatedDateTime(this.to_date);
    this.httpService.post(APIURLS.BR_ITEMCODE_REQUEST_FILTER_API, filterModel).then((data: any) => {
      if (data) {
        this.ItemCodeRequestFilter = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.ItemCodeRequestFilter = [];
    });

  }


  currentUser: AuthData;
  ngAfterViewInit() {
    this.initDatatable();
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
  materialtype(id) {
    let mat_type = this.materialList.find(x => x.id == id);
    return mat_type ? mat_type.type : "";
  }

  getloc(loc) {
    let loccode = loc.keyValue.split('~');
    return loccode ? loccode[0] : '';
  }
  transactionslist: Transactions[] = [];
  gettransactions(value) {
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, value.requestNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.transactionslist = data;
        this.transactionslist = this.transactionslist.filter(x => x.approvalPriority != null);
        //this.transactionslist.reverse();
        this.getApproversList(value);
      }
      else {
        this.getApproversList(value);
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.transactionslist = [];
    });

  }
  ItemCodeRequestModel = {} as ItemCodeRequest;
  Approverslist: WorkFlowApprovers[] = [];
  Approver1: boolean = false;
  Approverid1: string = "";
  Approverid2: string = "";
  Approver2: boolean = false;
  Creator: boolean = false;
  Review: boolean = false;
  Closure: boolean = false;
  serializer: boolean;
  serializerid: boolean;
  Aprlpriority: number;
  getApproversList(value) {

    this.Approver1 = false;
    this.Approver2 = false;
    this.Creator = false;
    this.Review = false;
    this.Closure = false;
    this.Approverslist = [];
    this.ItemCodeRequestModel = Object.assign({}, value);
    var loc = this.locationList.find(x => x.id == this.ItemCodeRequestModel.locationId);
    var mat = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId);

    if (mat.type == 'FG') {
      var keyvalue = loc.code + '~' + mat.type + '~' + this.ItemCodeRequestModel.storageLocationId + '~' + this.ItemCodeRequestModel.domesticOrExports + '~' + this.ItemCodeRequestModel.market + ',' + 1;
    }
    else {
      var keyvalue = loc.code + '~' + mat.type + '~' + this.ItemCodeRequestModel.storageLocationId + ',' + 1;
    }
    // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);   
    this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.Approverslist = data;
        let empid = this.currentUser.employeeId
        let empName = this.currentUser.fullName;
        if (mat.type == 'FG') {
          let temp = this.Approverslist.find(x => x.role == 'Creator');
          let temp1 = this.Approverslist.find(x => x.priority == temp.priority - 1);
          if (temp1.approverId == empid || temp1.parllelApprover1 == empid || temp1.parllelApprover2 == empid ||
            temp1.parllelApprover3 == empid || temp1.parllelApprover4 == empid) {
            this.serializer = true;
            this.serializerid = true;
            this.ItemCodeRequestModel.serializedFromDate = new Date().toLocaleString();
          }
        }
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
          this.Aprlpriority = Appr3.priority;
          this.Review = true;
          if (Appr3.role == 'Creator') {
            this.Creator = true;
            this.serializer = true;
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
          let temp = this.Approverslist.find(x => x.priority == ad.approvalPriority);
          if (temp != undefined) {
            if (ad.transactionType == 1) {
              if (temp.role == 'Creator') {
                ad.status = 'Completed'
              }
              else {
                ad.status = this.approverstatuslist.find(x => x.id == ad.approvalPriority).name;
              }
            }
            else if (ad.transactionType == 3 || ad.transactionType == 4) {
              ad.status = ad.transactionType == 3 ? "Reverted To Previous Approver " : " Reverted to Initiator";
            }
            else {
              ad.status = ad.transactionType == 2 ? "Rejected" : "";
            }
            ad.approverName = temp.approverName;
            ad.department = temp.department;
            ad.role = temp.role;
          }


        });
        this.Approverslist.forEach((ad) => {
          let temp1 = this.transactionslist.find(x => x.approvalPriority == ad.priority);
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
  dynamicArray: any = [];
  newDynamic: any = {};
  rowcount: number = 0;
  addRows() {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = {
      id: this.rowcount, reqNo: null, aun: null, packLevel: null, quantity: null,
      gtin: null, nationalCode: null, nCodeT: null, stored: "0"
    };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }

  view: boolean = false;
  empId: string;

  onUserActions(isedit: boolean, ItemCodeRequest: ItemCodeRequest, view: string) {
    this.isEdit = isedit;
    this.dynamicArray = [];
    this.transactionslist = [];
    this.comments = null;
    if(view=='View')
    {
      this.view = true;
    }
    else{
      this.view = false;
    }
    
    // this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.gettransactions(ItemCodeRequest);
    this.getApproversList(ItemCodeRequest);
    let type = this.materialList.find(x => x.id.toString() == ItemCodeRequest.materialTypeId);
    this.storagelocationlist1 = this.storagelocationlist.filter(x => x.matType == type.type);
    this.ValuationClasslist1 = this.ValuationClasslist.filter(x => x.matType == type.type);
    if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
      ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
    }
    if (ItemCodeRequest.pharmacopGrade != null || ItemCodeRequest.pharmacopGrade != undefined) {
      ItemCodeRequest.qcSpecification = this.pharmagradelist.find(x => x.pharmaGradeDesc == ItemCodeRequest.pharmacopGrade).pharmaGradeId.toString();
    }
    if (type.type == 'FG') {
      this.getserializationdetails(ItemCodeRequest.requestNo);
    }
    this.empId = this.ItemCodeRequestModel.createdBy;
    let locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
    this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
    if (locid.plantType == 0) {
      var modal = '#' + type.type + 'NGXPModal';
      jQuery(modal).modal('show');
    }
    else {
      var modal = '#' + type.type + 'Modal';
      jQuery(modal).modal('show');
    }
  }

  getserializationdetails(reqNo) {
    this.httpService.getByParam(APIURLS.BR_SERIALIZATION_DATA_GETBY_PARAM_API, reqNo).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        data.forEach(mtrl => {
          let serializedata = {} as Serialization;
          serializedata.id = mtrl.id;
          serializedata.aun = mtrl.aun;
          serializedata.packLevel = mtrl.packLevel;
          serializedata.quantity = mtrl.quantity;
          serializedata.gtin = mtrl.gtin;
          serializedata.nationalCode = mtrl.nationalCode;
          serializedata.nCodeT = mtrl.nCodeT;
          serializedata.lastModifiedBy = this.currentUser.employeeId;
          serializedata.lastModifiedOn = new Date().toLocaleString();
          this.dynamicArray.push(serializedata);

        });
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }

  sendMail(type, ItemCodeRequest: ItemCodeRequest) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODEREQUEST_EMAIL_API, type, ItemCodeRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }

  downloadFile(value) {

    // console.log(filename);
    if (value.attachments.length > 0) {
      this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, value.id, value.attachments).then((data: any) => {
        // console.log(data);
        // let temp_name = this.visitorsList1.find(s => s.id == id).name;
        if (data != undefined) {
          var FileSaver = require('file-saver');
          const imageFile = new File([data], value.attachments, { type: 'application/doc' });
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

  isMasterSel: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.ItemCodeRequestFilter.length; i++) {
      this.ItemCodeRequestFilter[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.ItemCodeRequestFilter.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any;
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.ItemCodeRequestFilter.length; i++) {
      if (this.ItemCodeRequestFilter[i].isSelected)
        this.checkedlist.push(this.ItemCodeRequestFilter[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  requestslist: CodeCreationInputs[] = [];
  ReqOutput: CodeCreationOutputs[] = [];
  CraeteInSAP() {
    this.isLoading=true;
    this.requestslist = [];
    this.ReqOutput = [];
    this.checkedRequestList.forEach(element => {
      let mat = this.materialList.find(x => x.id == element.materialTypeId).type;
      let loc = this.locationList.find(x => x.id == element.locationId).code;
      let request = {} as CodeCreationInputs;
      request.alanD1 = 'IN';
      request.aland = 'IN';
      if (mat == 'OSE' || mat == 'LC') {
        request.authGroup = mat;
      }
      else {
        request.authGroup = 'ZPPC'
      }
      request.availCheck = 'CH';
      request.beskz = 'X';
      request.bstme = '';
      request.classNumber = '23';
      request.classType = 'LAB_CHEM_GEN';
      request.disls = 'EX';
      request.dismm = 'ND';
      if (mat == 'PPC') {
        if(element.divisionId.length>1)
        {
          request.divisionId = element.divisionId;
        }
        else{
          request.divisionId = '0'+element.divisionId;
        }
      }
      else {
        request.divisionId = '90';
      }
      request.dwerk = loc;
      request.eisbe = 0;
      request.ekwsl = '1';
      request.externalMatGroup = 'NOS';
      request.ferth = element.prodInspMemo;
      request.genItemCatGroup = 'NORM';
      request.gewei = 'KG';
      request.grossWeight = 1;
      request.grossWeightSpecified = true;
      request.industrySector = 'P';
      request.insmk = '';
      request.iprkz = '';
      request.kondm = '14';
      request.ktgrm = 'M1';
      request.kzech = '';
      request.ladgr = '0003';
      request.lgfsb = element.storageLocationId;
      request.lgort = element.storageLocationId;
      request.lgpro = element.storageLocationId;
      request.locationId = loc;
      request.losgr = '1';
      request.materialGroupId = element.materialGroupId;
      request.materialLongName = element.materialLongName;
      request.materialShortName = element.materialShortName;
      request.materialTypeId = mat;
      request.matnr = '';
      request.mhdhb = element.shelfLife;
      request.mtpos = 'NORM';
      request.mvgR1 = '999';
      request.mvgR2 = '999';
      request.mvgR3 = '999';
      request.mvgR4 = '3';
      request.mvgR5 = '999';
      request.netWeight = '1';
      request.p_TDLINE = element.materialLongName;
      request.peinh = '1';
      request.perkz = 'M';
      request.plifz = '7';
      if (loc == 'ML03') {
        request.profitCenter = 'ML01';
      }
      else if (loc == 'ML26') {
        request.profitCenter = 'ML00';
      }
      else if (loc == 'ML25') {
        request.profitCenter = 'ML11';
      }
      else if (loc == 'ML28') {
        request.profitCenter = 'ML68';
      }
      else if (loc == 'ML30') {
        request.profitCenter = 'ML53';
      }
      else if (loc == 'ML93') {
        request.profitCenter = 'ML58';
      }
      else if (loc == 'ML29') {
        request.profitCenter = 'ML00';
      }
      else {
        request.profitCenter = loc;
      }
      request.purchaseGroupId = element.purchaseGroupId;
      if (mat == 'OSE') {
        request.qmata = 'OSE';
      }
      else if (mat == 'LC') {
        request.qmata = 'ZLAB';
      }
      else {
        request.qmata = 'ZPPC';
      }
      request.raube = '';
      request.rdmhd = '';
      request.requestNo = element.requestNo;
      request.rgekz = '1';
      request.s_TDLINE = element.materialLongName;
      request.saleS_VIEW = 'X';
      request.sbdkz = '1';
      request.sktof = 'X';
      request.steuc = element.hsnCode;
      request.stprs = '0';
      request.tatyP1 = 'JOIG';
      request.tatyp = 'JOIG';
      request.taxkM1 = '0';
      request.taxkm = '0';
      request.tempb = '';
      request.tragr = 'NOVA';
      request.unitOfMeasId = element.unitOfMeasId;
      request.valuationClass = element.valuationClass;
      request.versg = '1';
      request.vkorg = '1000';
      request.vprsv = 'S';
      request.vrkme = '';
      request.vtweg = '10';
      request.webaz = '5';
      request.xchpf = 'X';
      this.requestslist.push(request);
    });
    this.isLoading=true;
    let connection = this.httpService.post(APIURLS.BR_RFCBAPI_CODE_CREATION__API, this.requestslist);
    connection.then((data: any) => {
      this.isLoading = true;

      if (data != null) {
        this.ReqOutput = data;
        this.updaterequests();
        this.getAllEntries();
        this.isMasterSel = false;
        this.checkUncheckAll();
        this.output = true;
      }
      else {
        swal({
          title: "Message",
          text: "Error Creating Code",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        })
      }
      this.isLoading=false;
    });
    this.isLoading=false;
  }

  RequestList: any[] = [];
  output: boolean;
  updaterequests() {
    this.RequestList=[];
    this.checkedRequestList.forEach(element => {
      this.ReqOutput.forEach(req => {
        if (req.message == 'Material Created without Classification' || req.message == 'Material Created with Classification') {
          if (element.requestNo == req.reqno) {
            element.sapCodeNo = req.matnr;
            element.sapMessage = req.message;
            element.message = 'Mass Approved';
            element.sapStatus = req.type;
            element.modifiedBy=this.currentUser.employeeId;
            //element.sapCreationDate=req.erdat;
            this.RequestList.push(element);
          }
        }
        // else {
        //   swal({
        //     title: "Message",
        //     text: req.message + "For Request No" + req.reqno,
        //     icon: "warning",
        //     dangerMode: false,
        //     buttons: [false, true]
        //   })
        // }
      })
    });
    if (this.RequestList.length > 0) {
      this.ItemCodeRequestModel.requests = this.RequestList;
      let connection = this.httpService.post(APIURLS.BR_UPDATE_MULTIPLE_REQUESTS_API, this.ItemCodeRequestModel);
      connection.then((data: any) => {
        this.isLoadingPop = true;
        if (data != null || data == 200 || data.id > 0) {

        }
      }).catch(error => {
        this.isLoading = false;
      });
    }

  }

  fileslist: any[] = [];
  fileslist1: File[] = [];
  
  attachments: any[] = [];
  matType: any;
  
  files: File[] = [];
  DmfGradelist1:any[]=[];
  dynamicArrayB:any[]=[];
  AllApproversList: WorkFlowApprovers[] = [];
  loc: boolean;
  
  GetAllApprovers() {
    this.loc = false;
    this.httpService.get(APIURLS.BR_MASTER_APPROVERS_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.AllApproversList = data.filter(x => x.isActive);
        let id = this.currentUser.employeeId;
        let user = this.AllApproversList.find(x => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);
        if (user != null || user != undefined) {
          this.loc = true;
        }
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.AllApproversList = [];
    });
  }

  onUserActions1(isedit: boolean, ItemCodeRequest: ItemCodeRequest, isprint: boolean, view) {
    this.isEdit = isedit;
    // this.resetForm();
    this.errMsg1 = "";
    this.files = [];
    this.fileslist = [];
    this.fileslist1 = [];
    this.Approverslist = [];
    this.dynamicArray = [];
    this.dynamicArrayB = [];
    this.transactionslist = [];
    this.view = false;
    this.comments = null;
    this.attachments = [];
    this.serializationdatalist=[];
    // this.reset();
    this.isLoadingPop = false;
    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.gettransactions(ItemCodeRequest.requestNo);
    // this.dataForm.form.markAsPristine();
    // this.dataForm.form.markAsUntouched();
    // this.dataForm.form.updateValueAndValidity();
    this.DmfGradelist1 = this.DmfGradelist;
    if (isedit) {
      this.getApproversList(ItemCodeRequest);
      if (ItemCodeRequest.attachements != null || ItemCodeRequest.attachements != undefined) {
        this.attachments = ItemCodeRequest.attachements.split(',');
      }
      let type = this.materialList.find(x => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.storagelocationlist1 = this.storagelocationlist.filter(x => x.matType == type.type);
      this.ValuationClasslist1 = this.ValuationClasslist.filter(x => x.matType == type.type);
      if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
        ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
      }
      var name = this.materialList.find(x => x.id == +ItemCodeRequest.materialTypeId).type;
      if (ItemCodeRequest.pharmacopGrade != null || ItemCodeRequest.pharmacopGrade != undefined) {
        ItemCodeRequest.qcSpecification = this.pharmagradelist.find(x => x.pharmaGradeDesc == ItemCodeRequest.pharmacopGrade).pharmaGradeId.toString();
      }


      if (name == 'RM') {
        ItemCodeRequest.typeOfMaterial = 'R';
        ItemCodeRequest.firstAlphaRaw = ItemCodeRequest.materialShortName.charAt(0);
        ItemCodeRequest.company = '100';
      }
      if (name == 'PM') {
        ItemCodeRequest.type = 'P';
        ItemCodeRequest.company = '100';
      }
      if (name == 'FG') {
        this.getserializationdetails(ItemCodeRequest.requestNo);
      }
      if (name == 'BULK') {
        ItemCodeRequest.excipientsCheck = ItemCodeRequest.excipientsCheck == undefined ? '' : ItemCodeRequest.excipientsCheck = ItemCodeRequest.excipientsCheck.trim();
        ItemCodeRequest.immediatePackMatCheck = ItemCodeRequest.immediatePackMatCheck == undefined ? '' : ItemCodeRequest.immediatePackMatCheck.trim();
        ItemCodeRequest.manufactMatch = ItemCodeRequest.manufactMatch == undefined ? '' : ItemCodeRequest.manufactMatch.trim();
        ItemCodeRequest.punchesOrDiesMatch = ItemCodeRequest.punchesOrDiesMatch == undefined ? '' : ItemCodeRequest.punchesOrDiesMatch.trim();
        ItemCodeRequest.testingSpecMatch = ItemCodeRequest.testingSpecMatch == undefined ? '' : ItemCodeRequest.testingSpecMatch.trim();
        ItemCodeRequest.sameMarCustCount = ItemCodeRequest.sameMarCustCount == undefined ? '' : ItemCodeRequest.sameMarCustCount.trim();
        ItemCodeRequest.productMatch = ItemCodeRequest.productMatch == undefined ? '' : ItemCodeRequest.productMatch.trim();
        ItemCodeRequest.qualitycomplyspecification = ItemCodeRequest.qualitycomplyspecification == undefined ? '' : ItemCodeRequest.qualitycomplyspecification.trim();
        this.dynamicArrayB = ItemCodeRequest.expVendordetails
      }
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      // this.appArtAttachment = this.ItemCodeRequestModel.appArtAttachment;
      // this.colArtAttachment = this.ItemCodeRequestModel.colArtAttachment;
      // this.diaAttachment = this.ItemCodeRequestModel.diaAttachment;
      // this.shadeCardAttachment = this.ItemCodeRequestModel.shadeCardAttachment;
      this.empId = this.ItemCodeRequestModel.createdBy;


    }

    else {
      if (view == 'Copy') {
        ItemCodeRequest.attachements = null;
        ItemCodeRequest.modifiedBy = null;
        ItemCodeRequest.modifiedDate = null;
        ItemCodeRequest.approveType = null;
        ItemCodeRequest.appArtAttachment = null;
        ItemCodeRequest.colArtAttachment = null;
        ItemCodeRequest.diaAttachment = null;
        ItemCodeRequest.shadeCardAttachment = null;
       // this.cleardata(ItemCodeRequest);
        ItemCodeRequest.locationId = ItemCodeRequest.locationId.toString();
      }
      else{
        ItemCodeRequest.locationId = this.currentUser.baselocation.toString();
      }
      if (ItemCodeRequest.packingMaterialGroup != null || ItemCodeRequest.packingMaterialGroup != undefined) {
        ItemCodeRequest.packingMaterialGroup = ItemCodeRequest.packingMaterialGroup.trim();
      }
      //this.ItemCodeRequestModel.locationId = this.currentUser.baselocation.toString();

     
      let type = this.materialList.find(x => x.id.toString() == ItemCodeRequest.materialTypeId);
      this.ValuationClasslist1 = this.ValuationClasslist.filter(x => x.matType == type.type);
      this.storagelocationlist1 = this.storagelocationlist.filter(x => x.matType == type.type);
      //this.ValuationClasslist=this.ValuationClasslist.filter(x=>x.matType==type.type);
      this.getApproversList(ItemCodeRequest);
      if (ItemCodeRequest.attachements != null || ItemCodeRequest.attachements != undefined) {
        this.attachments = ItemCodeRequest.attachements.split(',');
      }
      this.matType = ItemCodeRequest.materialTypeId;
      this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
      // this.appArtAttachment = this.ItemCodeRequestModel.appArtAttachment;
      // this.colArtAttachment = this.ItemCodeRequestModel.colArtAttachment;
      // this.diaAttachment = this.ItemCodeRequestModel.diaAttachment;
      // this.shadeCardAttachment = this.ItemCodeRequestModel.shadeCardAttachment;
      var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
      if (name == 'FG') {
        this.newDynamic = {
          id: this.rowcount, reqNo: null, aun: "", packLevel: "", quantity: "",
          gtin: null, nationalCode: null, nCodeT: null, stored: "0"
        };
        this.dynamicArray.push(this.newDynamic);
        this.getserializationdetails(ItemCodeRequest.requestNo);
      }
      // this.newDynamicB = {  id: this.rowcount, requestNo: null, excepientsDetails: "", vendorDetails: "", stored: "0" };
      // this.dynamicArrayB.push(this.newDynamicB);
    }
    if (view == 'View') {
      this.isLoadingPop = false;
      this.Approver1 = true;
      this.Approver2 = true;
      this.Creator = true;
      this.serializer = true;
      this.view = true;
    }


    if (isprint) {
      this.isLoadingPop = false;
    //  this.printModal();
    }
    else {
      jQuery("#searchModal").modal('hide');
      let name = this.materialList.find(x => x.id == +ItemCodeRequest.materialTypeId).type;
      let id = this.currentUser.employeeId;
      let locid: any;
      let user = this.AllApproversList.find(x => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);
      if (user != null || user != undefined) {
        locid = this.locationList.find(x => x.id == +ItemCodeRequest.locationId);
      }
      else {
        locid = this.locationList.find(x => x.id == +ItemCodeRequest.locationId);
      }
      var modal = '#' + name + 'NGXPModal';
      jQuery(modal).modal('show');
    }
  }

  priority: number;
  serializationdatalist: Serialization[] = [];
  Role: any;
  onreview(status) {
    this.errMsg = "";
    let connection: any;
    let uid = this.currentUser.employeeId;
    if (status == "Rejected") {
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.ItemCodeRequestModel.pendingApprover = '';
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
      this.Role = user.role;
      this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }

    var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
    if (name == 'FG' && this.dynamicArray.length > 0) {
      this.dynamicArray.forEach(mtrl => {
        let serializedata = {} as Serialization;
        serializedata.id = mtrl.id;
        serializedata.aun = mtrl.aun;
        serializedata.packLevel = mtrl.packLevel;
        serializedata.quantity = mtrl.quantity;
        serializedata.gtin = mtrl.gtin;
        serializedata.nationalCode = mtrl.nationalCode;
        serializedata.nCodeT = mtrl.nCodeT;
        serializedata.lastModifiedBy = this.currentUser.employeeId;
        //serializedata.lastModifiedOn = new Date().toLocaleString();
        this.serializationdatalist.push(serializedata);

      });
    }
    this.ItemCodeRequestModel.globalSerializationViewModel = this.serializationdatalist;
    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    //this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeRequestModel.approveType = status == "Rejected" ? status : status;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find(x => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');  

        //var role=this.Approverslist.find(x=>x.role=='Approver')
        if (this.Role == "Approver") {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeRequestModel.requestNo + '' + status + " Successfully!" : "Request " + this.ItemCodeRequestModel.requestNo + " Approved Successfully!";
        }
        else {
          this.errMsgPop1 = status == "Rejected" ? "Request " + this.ItemCodeRequestModel.requestNo + '' + status + " Successfully!" : "Request " + this.ItemCodeRequestModel.requestNo + " Reviewed Successfully!";
        }
        jQuery("#saveModal").modal('show');
        let id = status == "Rejected" ? 2 : 1;
        if (status != "Rejected") {
          this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        }
        this.sendMail(status, this.ItemCodeRequestModel)
        this.Inserttransactions(this.ItemCodeRequestModel, id)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = status == "Rejected" ? "Error Rejecting Request" + ' ' + this.ItemCodeRequestModel.requestNo : "Error Reviewing Request" + ' ' + this.ItemCodeRequestModel.requestNo;
    });
  }

  onRevertRequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == "ReverttoInitiator") {
      let usid = this.currentUser.employeeId;
      let user = this.Approverslist.find(x => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
        || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

      this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
      this.ItemCodeRequestModel.approveType = "Reverted to initiator";
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    else {
      let uid = this.ItemCodeRequestModel.modifiedBy;
      let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
        || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

      this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority + 1).priority;
      this.ItemCodeRequestModel.approveType = "Reverted";
    }

    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
    //this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find(x => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');      
        this.errMsgPop1 = "Request " + this.ItemCodeRequestModel.requestNo + " Reverted Successfully!";
        jQuery("#saveModal").modal('show');
        let id = status == "ReverttoInitiator" ? 4 : 3;
        this.sendMail(status, this.ItemCodeRequestModel)
        if (this.ItemCodeRequestModel.approveType != "Reverted to initiator") {
          this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        }
        this.Inserttransactions(this.ItemCodeRequestModel, id)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Reverting Request " + ' ' + this.ItemCodeRequestModel.requestNo;
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
      this.ItemCodeRequestModel.pendingApprover = temp.approverId;
      this.ItemCodeRequestModel.approveType = 'InProcess';
    }
    else {
      this.ItemCodeRequestModel.pendingApprover = 'No';
      this.ItemCodeRequestModel.approveType = 'Completed';
    }
    this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeRequestModel.sapCreatedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;
    this.ItemCodeRequestModel.sapCreationDate = new Date().toLocaleString();

    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find(x => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');     
        this.errMsgPop1 = "Item Code " + this.ItemCodeRequestModel.sapCodeNo + " Created Successfully!";
        jQuery("#saveModal").modal('show');
        this.sendMail('Created', this.ItemCodeRequestModel)
        if (this.ItemCodeRequestModel.pendingApprover != 'No') {
          this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        }
        this.Inserttransactions(this.ItemCodeRequestModel, 1)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Creating Item Code..";
    });

  }

  oncloserequest(status) {
    this.errMsg = "";
    let connection: any;
    if (status == 'close') {
      this.ItemCodeRequestModel.sapStatusFlag = 1;
    }
    let uid = this.currentUser.employeeId;
    let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
      || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
    if (status == 'Completed') {

      this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
      this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    }
    this.ItemCodeRequestModel.lastApprover = this.currentUser.fullName;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.ItemCodeRequestModel.approveType = 'Completed';
    this.ItemCodeRequestModel.pendingApprover = 'No';
    this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let uid = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
        if (user != null || user != undefined) {
          locid = this.locationList.find(x => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');     
        this.errMsgPop1 = "Request " + '' + this.ItemCodeRequestModel.requestNo + '' + " Closed Successfully!";
        jQuery("#saveModal").modal('show');
        this.Inserttransactions(this.ItemCodeRequestModel, 1)
        this.sendMail('Created', this.ItemCodeRequestModel)
        this.getAllEntries();
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = "Error Closing Request" + '' + this.ItemCodeRequestModel.requestNo;
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
    this.transactions.processType = "Item Code Request";
    connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

  }

  

  sendPendingMail(type, ItemCodeRequest: ItemCodeRequest) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_ITEM_CODE_PENDING_EMAIL_API, type, ItemCodeRequest);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });

  }


  onSubmitEntry(ItemCodeRequest: ItemCodeRequest) {
    // this.gettransactions(ItemCodeRequest.requestNo);
    //this.getApproversList(ItemCodeRequest);

    this.ItemCodeRequestModel = {} as ItemCodeRequest;
    this.ItemCodeRequestModel = Object.assign({}, ItemCodeRequest);
    this.errMsg = "";
    let connection: any;
    // if (this.ItemCodeRequestModel.modifiedDate != null || this.ItemCodeRequestModel.modifiedDate != undefined) {
    //   this.ItemCodeRequestModel.approveType = "ReSubmitted";
    // }
    // else {
    //   this.ItemCodeRequestModel.approveType = "Submitted";
    // }
    // let filepath='';
    // let mat=this.materialList.find(x=>x.id == +this.ItemCodeRequestModel.materialTypeId).type;
    // if(mat=='RM')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/Raw Materials Files/UploadFiles/'
    // }
    // else if(mat=='PM')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/PackageMaterial Files/UploadFiles/'
    // }
    // else if(mat=='BULK')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/BulkMaterial Files/UploadFiles/'
    // }
    // else if(mat=='FG')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/FG Materials Files/UploadFiles/'
    // }
    // if(mat=='LC')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/LC Files/UploadFiles/'
    // }
    // if(mat=='PPC')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/PPC Files/UploadFiles/'
    // }
    // if(mat=='OSE')
    // {
    //   filepath='jsp/EMicro Files/ESS/sapMasterRequest/OSE Files/UploadFiles/'
    // }
    if (this.fileslist != null || this.fileslist != undefined) {
      for (let i = 0; i < this.fileslist.length; i++) {
        this.ItemCodeRequestModel.attachements = this.ItemCodeRequestModel.attachements + ',' + this.fileslist[i];
      }

    }
    // this.ItemCodeRequestModel.appArtAttachment = this.appArtAttachment;
    // this.ItemCodeRequestModel.colArtAttachment = this.colArtAttachment;
    // this.ItemCodeRequestModel.diaAttachment = this.diaAttachment;
    // this.ItemCodeRequestModel.shadeCardAttachment = this.shadeCardAttachment;
    this.ItemCodeRequestModel.modifiedBy = this.currentUser.employeeId;
   // this.ItemCodeRequestModel.modifiedDate = new Date().toLocaleString();
    this.comments = this.ItemCodeRequestModel.reasonForrequisition;
    this.ItemCodeRequestModel.pendingApprover = this.Approverslist.find(x => x.role == "Creator").approverId;   
    connection = this.httpService.put(APIURLS.BR_ITEMCODE_REQUEST_POST_API, this.ItemCodeRequestModel.id, this.ItemCodeRequestModel);
    connection.then((data: any) => {
      this.isLoadingPop = true;
      if (data == 200 || data.id > 0) {
        var name = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId).type;
        let id = this.currentUser.employeeId;
        let locid: any;
        let user = this.AllApproversList.find(x => x.approverId == id || x.parllelApprover1 == id || x.parllelApprover2 == id || x.parllelApprover3 == id || x.parllelApprover4 == id);
        if (user != null || user != undefined) {
          locid = this.locationList.find(x => x.id == +this.ItemCodeRequestModel.locationId);
        }
        else {
          locid = this.locationList.find(x => x.id == this.currentUser.baselocation);
        }
        if (locid.plantType == 0) {
          var modal = '#' + name + 'NGXPModal';
          jQuery(modal).modal('hide');
        }
        else {
          var modal = '#' + name + 'Modal';
          jQuery(modal).modal('hide');
        }
        // jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Request ' + this.ItemCodeRequestModel.requestNo + ' Submitted Successfully!';
        jQuery("#saveModal").modal('show');
      //  this.id = this.ItemCodeRequestModel.id.toString();
       // this.uploadfile();
       // this.Inserttransactions(this.ItemCodeRequestModel, 0);
        //this.sendPendingMail("Pending", this.ItemCodeRequestModel)
        this.getAllEntries();
        //this.reset();
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error Submitting Request' + '' + this.ItemCodeRequestModel.requestNo;
    });
  }
}
