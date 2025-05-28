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

import * as XLSX from 'xlsx';
//import * as FileSaver from 'file-saver';
import { VendorMasterChanges } from './VendorMasterChanges.model';
//import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';

declare var require: any;


@Component({
    selector: 'app-VendorMasterChanges',
    templateUrl: './VendorMasterChanges.component.html',
    styleUrls: ['./VendorMasterChanges.component.css']
})
export class VendorMasterChangesComponent {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;

@ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;


    // @ViewChild(NgForm  , { static: false })dataForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })PMForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })BULKForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })RMNGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })PMNGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })BULKNGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })FGNGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })LCNGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })OSENGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })PPCNGXPForm!: NgForm;
    // @ViewChild(NgForm  , { static: false })RMForm!: NgForm;
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
    file!: File; successMsg: string = "";
    path: string = '';
    locationList: any[] = [[]];
    selectedBaseLocation: any = [];
    baseLocationnotfirst = true;

    //vendormasterchangesmodel = {} as ItemCodeExtension;
    //ItemCodeRequestModel = {} as ItemCodeRequest;
    //ItemCodeRequestModelList:ItemCodeRequest[]=[];

    vendormasterchangesmodel = {} as VendorMasterChanges
    vendormasterchangeslist: VendorMasterChanges[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype!: string
    comments: string
    filterMaterialCode: string = ' ';
    filterstatus: string = ' ';
    filterlocation: string = ' ';
    filterrequest: string = ' ';
    filterplace: string = ' ';
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    VendorMasterFilter: VendorMasterChanges[] = [];
    vendormastersearchlist: VendorMasterChanges[] = [];

    emailid!: string

    requestdate!: Date;
    Approver1: boolean = false;
    Approverid1: string = "";
    Approverid2: string = "";
    Approver2: boolean = false;
    Creator: boolean = false;
    Review: boolean = false;
    Closure: boolean = false;
    userid!: string

    storeData: any;
    jsonData: any;
    fileUploaded!: File;
    worksheet: any;
    vendorCode: string
    status: string
    vendorName: string

    //vendormastermodeldata = {} as ItemCodeExtension;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
        , private http: HttpClient, private datePipe: DatePipe) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }
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
     const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
        //  this.baseLocation = this.currentUser.baselocation;
        this.emailid = this.currentUser.email;
        this.userid = this.currentUser.employeeId;
        this.requestdate = new Date(this.today);
        this.filterstatus = 'Pending';
        this.filterlocation = this.currentUser.baselocation.toString();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // if (chkaccess == true) {

        this.getAllEntries();
        this.getLocationMaster();
        this.getstateList();
        this.getVendorTypelist();
        this.getCountryList();
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
            this.vendormasterchangeslist = this.jsonData;
            //this.jsonData = JSON.stringify(this.jsonData);  
            // console.log(this.jsonData);

        }
        readFile.readAsArrayBuffer(this.fileUploaded);
    }

    VendorTypeList: any[] = [];
    getVendorTypelist() {
        this.httpService.get(APIURLS.BR_VENDOR_TYPE_POST_API).then((data: any) => {
            if (data.length > 0) {
                this.VendorTypeList = data;
            }
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.VendorTypeList = [];
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
        }).catch((error)=> {
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
        }).catch((error)=> {
            this.isLoading = false;
            this.stateList = [];
        });
    }
    getstatelist(id:any) {
        this.stateList1 = this.stateList.filter((x:any)  => x.land1 == id);
    }

    locationAllList: any[] = [[]];
    getLocation(id:any) {
        let temp = this.locationAllList.find(e => e.id == id);
        return temp ? temp.code : '';
    }
    getloc(loc:any) {
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
    vendorcatlist: any[] = [
        { id: 'RM', name: 'Raw Material Vendor' },
        { id: 'PM', name: 'Packing Material Vendor' },
        { id: 'GM', name: 'General Material & Service Vendor' }
    ];
    vendorsubcatlist: any[] = [
        { id: 1, name: 'RM Supplier' },
        { id: 2, name: 'RM Manufacture' },
        { id: 3, name: 'RM Supplier & Manufacturer' },
        { id: 4, name: 'PM Supplier' },
        { id: 5, name: 'PM Manufacture' },
        { id: 6, name: 'PM Supplier & Manufacturer' },
        { id: 5, name: 'Supplier' },
        { id: 6, name: 'Service' }
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
        this.vendorCode = "";
        this.vendorName = "";
        this.status = "";

    }


    location(id:any) {
        let loc = this.locationList.find((x:any)  => x.id == id);
        return loc ? loc.code : "";
    }

    getAllEntries() {
        this.isLoading = true;
        let td = new Date();
        let formatedFROMdate: string
        let formatedTOdate: string
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

        filterModel.vendorCode = this.vendorCode;
        filterModel.vendorName = this.vendorName;
        filterModel.status = this.status == 'Pending' ? 'InProcess,Submitted,ReSubmitted,Reverted,Reverted to initiator' : this.status;
        filterModel.fromDate = this.getFormatedDateTime(this.from_date);
        filterModel.toDate = this.getFormatedDateTime(this.to_date);
        this.httpService.post(APIURLS.GET_FILTERED_RESULT_OF_VMC, filterModel).then((data: any) => {
            if (data) {
                if (this.status == 'Pending') {
                    this.VendorMasterFilter = data.filter((x:any)  => x.pendingApprover == this.currentUser.fullName || x.requestedBy == this.currentUser.employeeId);
                    this.VendorMasterFilter.reverse();
                }
                else {
                    this.VendorMasterFilter = data;
                    this.VendorMasterFilter.reverse();
                }
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.VendorMasterFilter = [];
        });

    }
    continue: boolean = false;
    getSearchResult() {
        this.isLoading = true;
        let td = new Date();
        let formatedFROMdate: string
        let formatedTOdate: string
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
        filterModel.place = this.vendormasterchangesmodel.city;
        filterModel.status = 'Completed';
        filterModel.name = this.vendormasterchangesmodel.vendorName;
        filterModel.country = this.vendormasterchangesmodel.country;
        filterModel.fromDate = this.getFormatedDateTime(this.from_date);
        filterModel.toDate = this.getFormatedDateTime(this.to_date);
        this.httpService.post(APIURLS.BR_VENDOR_MASTER_FILTER_API, filterModel).then((data: any) => {
            if (data) {
                this.vendormastersearchlist = data;
                this.vendormastersearchlist.reverse();
            }
            this.continue = true;
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.vendormastersearchlist = [];
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

    fileToUpload: File | null = null;
    File: File | null = null;
    name: string
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


    ReadAsBase64(file:any): Promise<any> {
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
    id: string
    uploadfile() {
        // debugger;
        // this.id='VM001';
        this.formData = new FormData();
        for (var i = 0; i < this.fileslist1.length; i++) {
            this.formData.append('files', this.fileslist1[i]);
        }
        // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/vendorDocuments/temp/';
        let connection: any;
        connection = this.httpService.fileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.id, this.formData);
        connection.then((data: any) => {
            this.isLoading = false;
            if (data == 200) {
                // console.log('copied file to server')
                //this.imageFlag = true;
            }
        }).catch((error)=> {
            this.errMsgPop = 'Error uploading file ..';
        });

    }


    currentUser!: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }

    resetForm() {
        this.errMsg1 = "";
        this.vendorCode = null;
        this.vendormasterchangesmodel = {} as VendorMasterChanges;
        this.comments = "";
        this.vendormasterchangesmodel.reason = "";

    }


    transactionslist: Transactions[] = [];
    gettransactions(reqNo:any) {
        this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.transactionslist = data.filter((x:any)=>x.processType=='Vendor Master Changes');;
                //this.transactionslist.reverse();
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.transactionslist = [];
        });

    }
    Approverslist: WorkFlowApprovers[] = [];
    accountGroupList: any[] = [];
    Aprlpriority!: number;
    getApproversList(value:any) {

        // this.Approver1 = false;
        // this.Approver2 = false;
        // this.Creator = false;
        // this.Review = false;
        // this.Closure = false;
        //this.vendormasterchangesmodel = Object.assign({}, value);
        if (!this.isEdit) {
            var loc = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation);
        }
        else {
            var loc = this.locationList.find((x:any)  => x.id == value.locationId);
        }

        // var accgrp = this.AccGroupList.find((x:any)  => x.accountGroupId == this.vendormasterchangesmodel.accountGroupId);
        // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);
        // var group = accgrp.accountGroupName == 'Import' ? 'Import' : 'Local';
        //var keyvalue = loc.code + '~' + group + ',' + 3;

        var keyvalue = loc.code + '~' + value.vendorCat + '~' + value.vendorSubCat + ',' + 3;

        this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL, keyvalue).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.Approverslist = data;
                this.Approverslist = this.Approverslist.filter((x:any)  => x.isActive == true);
                let empid = this.currentUser.employeeId
                let empName = this.currentUser.fullName;

                let Appr1 = this.Approverslist.find((x:any)  => x.priority == 1 && x.approverId == empid ||
                    x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
                    x.parllelApprover3 == empid || x.parllelApprover4 == empid);

                if (Appr1 != null || Appr1 != undefined) {
                    this.Approverid1 = Appr1.approverId;
                    this.Approver1 = true;
                    this.Review = true;
                    this.Aprlpriority = Appr1.priority;
                }
                let Appr2 = this.Approverslist.find((x:any)  => x.priority == 2 && x.approverId == empid ||
                    x.parllelApprover1 == empid || x.parllelApprover2 == empid ||
                    x.parllelApprover3 == empid || x.parllelApprover4 == empid);
                if (Appr2 != null || Appr2 != undefined) {
                    this.Approver1 = true;
                    this.Approver2 = true;
                    this.Approverid2 = Appr2.approverId;
                    this.Review = true;
                    this.Aprlpriority = Appr2.priority;
                }
                let Appr3 = this.Approverslist.find((x:any)  => x.approverId == empid ||
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
                    let temp = this.Approverslist.find((x:any)  => x.priority == ad.approvalPriority &&
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
                                ad.status = this.approverstatuslist.find((x:any)  => x.id == ad.approvalPriority).name;
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
                    let temp1 = this.transactionslist.find((x:any)  => x.approvalPriority == ad.priority &&
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
                this.Approverslist = this.Approverslist.sort((a:any, b:any) => {
                    if (a.priority > b.priority) return 1;
                    if (a.priority < b.priority) return -1;
                    return 0;
                });
                this.transactionslist = this.transactionslist.sort((a:any, b:any) => {
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
        }).catch((error)=> {
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
        this.continue = false;
        this.vendormastersearchlist = [];
        //this.ItemCodeRequestModel = Object.assign({},ItemCodeRequest) ;  
        jQuery("#myModal").modal('show');

    }
    reset() {
        if (this.myInputVariable != null || this.myInputVariable != undefined) {
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

    empId: string
    view: boolean = false;
    locationName: string
    attachments: any[] = [];
    onUserActions(isedit: boolean, vendormasterchanges: VendorMasterChanges, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.view = false;
        this.Approver1 = false;
        this.Approver2 = false;
        this.Creator = false;
        this.Review = false;
        this.Closure = false;
        this.continue = false;
        this.errMsg1 = "";
        this.transactionslist = [];
        this.Approverslist = [];
        this.attachments = [];
        this.fileslist = [];
        this.files = [];
        this.fileslist1 = [];
        this.isLoadingPop = false;
        //this.reset();
        this.gettransactions(vendormasterchanges.id);
        // this.dataForm.form.markAsPristine();
        // this.dataForm.form.markAsUntouched();
        // this.dataForm.form.updateValueAndValidity();
        if (isedit) {
            //   this.getApproversList(ItemCodeExtension);
            this.vendorCode=vendormasterchanges.vendorCode;
            this.getCodeDetails();
            
           // this.getApproversList(vendormasterchanges);
            if (vendormasterchanges.attachments != null || vendormasterchanges.attachments != undefined) {
                this.attachments = vendormasterchanges.attachments.split(',');
            }
            this.vendormasterchangesmodel = Object.assign({}, vendormasterchanges);
            this.stateList1 = this.stateList.filter((x:any)  => x.land1 == this.vendormasterchangesmodel.country);
            // this.vendormasterchangesmodel.accountGroupId=this.AccGroupList.find(x=>x.accountGroupId == vendormasterchanges.accountGroupId).accountGroupId;
            this.empId = this.vendormasterchangesmodel.createdBy;
        }
        if (value == 'Copy') {
            vendormasterchanges.modifiedBy = null;
            vendormasterchanges.modifiedDate = null;
            vendormasterchanges.status = null;
            vendormasterchanges.sapCodeNo = null;
            vendormasterchanges.attachments = null;
        }
        if (vendormasterchanges.attachments != null || vendormasterchanges.attachments != undefined) {
            this.attachments = vendormasterchanges.attachments.split(',');
        }
        this.vendormasterchangesmodel = Object.assign({}, vendormasterchanges);
        this.stateList1 = this.stateList.filter((x:any)  => x.land1 == this.vendormasterchangesmodel.country);
        if (this.vendormasterchangesmodel.vendorCat != null || this.vendormasterchangesmodel.vendorCat != undefined) {
            this.getApproversList(vendormasterchanges);
        }
        if (value == 'View') {
            this.Approver1 = true;
            this.Creator = true;
            this.view = true;
        }

        if (isprint) {
            let ln = this.locationList.find((x:any)  => x.id == this.vendormasterchangesmodel.locationId)
            this.locationName = ln.code + '-' + ln.name;
            this.vendormasterchangesmodel.vendorCat = this.vendorcatlist.find((x:any)  => x.id == this.vendormasterchangesmodel.vendorCat).name;
            this.vendormasterchangesmodel.vendorSubCat = this.vendorsubcatlist.find((x:any)  => x.id == this.vendormasterchangesmodel.vendorSubCat).name;
            this.vendormasterchangesmodel.typeOfVendor = this.VendorTypeList.find((x:any)  => x.vCode == this.vendormasterchangesmodel.typeOfVendor).vDescription;
            this.vendormasterchangesmodel.country = this.countrylist.find((x:any)  => x.land1 == this.vendormasterchangesmodel.country).landx;
            this.vendormasterchangesmodel.state = this.stateList.find((x:any)  => x.id == this.vendormasterchangesmodel.state).bezei;
            jQuery("#printModal").modal('show');
        }
        else {
            jQuery("#myModal").modal('hide');
            jQuery('#myModal').modal('show');

        }
    }

    isValid: boolean = false;
    validatedForm: boolean = true;

    onSaveEntry(status:any) {
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
                this.vendormasterchangesmodel.vendorCode = this.vendorCode;
                this.vendormasterchangesmodel.createdBy = this.currentUser.employeeId;
                this.vendormasterchangesmodel.createdDate = new Date().toLocaleString();
                this.vendormasterchangesmodel.requestedDate = new Date().toLocaleString();
                this.vendormasterchangesmodel.requestedBy = this.currentUser.employeeId;
                this.vendormasterchangesmodel.plant = this.currentUser.baselocation.toString();
                // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/vendorDocuments/temp/';
                if (this.fileslist != null || this.fileslist != undefined) {
                    // let file:any='';         
                    let file: any = this.fileslist[0];
                    for (let i = 1; i < this.fileslist.length; i++) {
                        file = this.fileslist[i] + ',' + file;
                    }
                    this.vendormasterchangesmodel.attachments = file;
                }
                this.vendormasterchangesmodel.lastApprover = 'No';
                this.vendormasterchangesmodel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == 1).approverId;
                this.vendormasterchangesmodel.status = status == "Submit" ? "Submitted" : "Created";
                connection = this.httpService.post(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, this.vendormasterchangesmodel);
            }
            connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data == 200 || data.id > 0) {
                    this.id = data.id;
                    this.uploadfile()
                    jQuery("#myModal").modal('hide');
                    this.errMsgPop1 = status == 'Save' ? 'Request ' + '' + data.id + '' + ' saved successfully!' : 'Request ' + '' + data.id + '' + ' Submitted Successfully!';
                    jQuery("#saveModal").modal('show');
                    if (data.status == "Submitted") {
                       this.sendPendingMail(data);
                        this.Inserttransactions(data, 0);
                    }
                    this.getAllEntries();
                    this.reset();
                }
            }).catch((error)=> {
                this.isLoadingPop = false;
                this.errMsgPop = 'Error saving Request..';
            });
        }
    }

    onSubmitEntry(vendormasterchanges: VendorMasterChanges) {

        this.vendormasterchangesmodel = {} as VendorMasterChanges;
        this.vendormasterchangesmodel = Object.assign({}, vendormasterchanges);
        this.errMsg = "";
        let connection: any;
        if (this.vendormasterchangesmodel.modifiedDate != null || this.vendormasterchangesmodel.modifiedDate != undefined) {
            this.vendormasterchangesmodel.status = "ReSubmitted";
        }
        else {
            this.vendormasterchangesmodel.status = "Submitted";
        }
        //let filepath='jsp/EMicro Files/ESS/sapMasterRequest/vendorDocuments/temp/';
        if (this.fileslist != null || this.fileslist != undefined) {
            for (let i = 0; i < this.fileslist.length; i++) {
                this.vendormasterchangesmodel.attachments = this.vendormasterchangesmodel.attachments + ',' + this.fileslist[i];
            }

        }
        this.vendormasterchangesmodel.modifiedBy = this.currentUser.employeeId;
        // this.vendormasterchangesmodel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, this.vendormasterchangesmodel.id, this.vendormasterchangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                this.id = this.vendormasterchangesmodel.id.toString();
                this.uploadfile();

                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Request ' + this.vendormasterchangesmodel.id + '' + ' submitted successfully!';
                jQuery("#saveModal").modal('show');
                this.sendPendingMail(this.vendormasterchangesmodel);
                this.Inserttransactions(this.vendormasterchangesmodel, 0)
                this.getAllEntries();
                this.reset();
            }
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error Submitting Request ' + '' + this.vendormasterchangesmodel.id;
        });
    }
    Role: any;
    onreview(status:any) {
        this.errMsg = "";
        let connection: any;
        let uid = this.currentUser.employeeId;
        if (status == "Rejected") {
            let user = this.Approverslist.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
            this.vendormasterchangesmodel.pendingApprover = '';
            this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
        }
        else {
            let user = this.Approverslist.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
            this.Role = user.role;
            this.vendormasterchangesmodel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == user.priority + 1).approverId;
            this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
        }


        this.vendormasterchangesmodel.lastApprover = this.currentUser.fullName;
        this.vendormasterchangesmodel.modifiedBy = this.currentUser.employeeId;
        // this.vendormasterchangesmodel.modifiedDate = new Date().toLocaleString();
        this.vendormasterchangesmodel.status = status == "Rejected" ? status : status;
        connection = this.httpService.put(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, this.vendormasterchangesmodel.id, this.vendormasterchangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('hide');

                //  var role=this.Approverslist.find(x=>x.role=='Approver')
                if (this.Role == "Approver") {
                    this.errMsgPop1 = status == "Rejected" ? "Request " + this.vendormasterchangesmodel.id + '' + status + " Successfully!" : "Request " + this.vendormasterchangesmodel.id + " Approved Successfully!";
                }
                else {
                    this.errMsgPop1 = status == "Rejected" ? "Request " + this.vendormasterchangesmodel.id + '' + status + " Successfully!" : "Request " + this.vendormasterchangesmodel.id + " Reviewed Successfully!";
                }
                jQuery("#saveModal").modal('show');
                let id = status == "Rejected" ? 2 : 1;
                if (status != "Rejected") {
                   this.sendPendingMail(this.vendormasterchangesmodel);
                }
               // this.sendMail(status, this.vendormasterchangesmodel)
                this.Inserttransactions(this.vendormasterchangesmodel, id)
                this.getAllEntries();
            }
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = status == "Rejected" ? "Error Rejecting Request.." + '' + this.vendormasterchangesmodel.id : "Error Reviewing Request " + '' + this.vendormasterchangesmodel.id;
        });
    }

   onRevertRequest(status:any) {
        this.errMsg = "";
        let connection: any;
        if (status == "ReverttoInitiator") {
            let usid = this.currentUser.employeeId;
            let user = this.Approverslist.find((x:any)  => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
                || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

            this.vendormasterchangesmodel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == 1).approverId;
            this.vendormasterchangesmodel.status = "Reverted to initiator";
            this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
        }
        else {
            let uid = this.vendormasterchangesmodel.modifiedBy;
            let user = this.Approverslist.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

            this.vendormasterchangesmodel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == user.priority).approverId;
            this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority + 1).priority;
            this.vendormasterchangesmodel.status = "Reverted";
        }

        this.vendormasterchangesmodel.lastApprover = this.currentUser.fullName;
        this.vendormasterchangesmodel.modifiedBy = this.currentUser.employeeId;
        // this.vendormasterchangesmodel.modifiedDate = new Date().toLocaleString();

        connection = this.httpService.put(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, this.vendormasterchangesmodel.id, this.vendormasterchangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = "Request " + '' + this.vendormasterchangesmodel.id + '' + " Reverted Successfully!";
                jQuery("#saveModal").modal('show');
                let id = status == "ReverttoInitiator" ? 4 : 3;
                if (status != "ReverttoInitiator") {
            //        this.sendPendingMail(this.vendormasterchangesmodel);
                }
           //     this.sendMail(status, this.vendormasterchangesmodel);
                this.Inserttransactions(this.vendormasterchangesmodel, id)
                this.getAllEntries();
            }
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Reverting Request " + '' + this.vendormasterchangesmodel.id;
        });
    }

    onCreate() {
        this.errMsg = "";
        let connection: any;
        let uid = this.currentUser.employeeId;

        let user = this.Approverslist.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
            || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

        let temp = this.Approverslist.find((x:any)  => x.priority == user.priority + 1);
        if (temp != null || temp != undefined) {
            this.vendormasterchangesmodel.pendingApprover = temp.approverId;
            this.vendormasterchangesmodel.status = 'InProcess';
        }
        else {
            this.vendormasterchangesmodel.pendingApprover = 'No';
            this.vendormasterchangesmodel.status = 'Completed';
        }
       // this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
        this.vendormasterchangesmodel.lastApprover = this.currentUser.fullName;
        this.vendormasterchangesmodel.modifiedBy = this.currentUser.employeeId;
        this.vendormasterchangesmodel.modifiedDate = new Date().toLocaleString();

        connection = this.httpService.put(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, this.vendormasterchangesmodel.id, this.vendormasterchangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = "Vendor Code " + '' + this.vendormasterchangesmodel.vendorCode + '' + " Modified Successfully!";
                jQuery("#saveModal").modal('show');
                this.sendMail(this.vendormasterchangesmodel);
                if (this.vendormasterchangesmodel.pendingApprover != 'No') {
             //       this.sendPendingMail(this.vendormasterchangesmodel);
                }
                this.Inserttransactions(this.vendormasterchangesmodel, 1)
                this.getAllEntries();
            }
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Creating Vendor Code..";
        });

    }
    priority!: number;
    oncloserequest(status) {
        this.errMsg = "";
        let connection: any;

        if (status == 'Completed') {
            let uid = this.currentUser.employeeId;
            let user = this.Approverslist.find((x:any)  => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

            this.vendormasterchangesmodel.pendingApprover = this.Approverslist.find((x:any)  => x.priority == user.priority + 1).approverId;
            this.priority = this.Approverslist.find((x:any)  => x.priority == user.priority).priority;
        }
        this.vendormasterchangesmodel.lastApprover = this.currentUser.fullName;
        this.vendormasterchangesmodel.modifiedBy = this.currentUser.employeeId;
        //  this.vendormasterchangesmodel.modifiedDate = new Date().toLocaleString();
        this.vendormasterchangesmodel.status = 'Completed';
        this.vendormasterchangesmodel.pendingApprover = 'No';
        this.priority = 7;
        connection = this.httpService.put(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, this.vendormasterchangesmodel.id, this.vendormasterchangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = "Request " + '' + this.vendormasterchangesmodel.id + '' + " Closed Successfully!";
                jQuery("#saveModal").modal('show');
                this.Inserttransactions(this.vendormasterchangesmodel, 1)
                //this.sendMail('VM-Created', this.vendormasterchangesmodel)
                this.getAllEntries();
            }
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Closing Request" + '' + this.vendormasterchangesmodel.id;
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
        this.transactions.processType = "Vendor Master Changes";
        connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

    }

    sendMail( vendormasterchanges: VendorMasterChanges) {
        let connection: any;

        connection = this.httpService.sendPutMail(APIURLS.SEND_VENDOR_APPROVED_MOD_MAIL, 'VM', vendormasterchanges);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch((error)=> {
            this.errMsgPop = 'Error in sending mail..';
        });

    }

    sendPendingMail(vendormasterchanges: VendorMasterChanges) {
        let connection: any;

        connection = this.httpService.sendPutMail(APIURLS.SEND_VENDOR_MOD_MAIL, 'VendorPending', vendormasterchanges);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch((error)=> {
            this.errMsgPop = 'Error in sending mail..';
        });

    }
    downloadFile(reqNo:any, value:any) {

        // console.log(filename);
        if (value.length > 0) {
            this.httpService.getFile(APIURLS.BR_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
                // console.log(data);
                // let temp_name = this.visitorsList1.find((s:any) => s.id == id).name;
                if (data != undefined) {
                   // var FileSaver = require('file-saver');
                    const imageFile = new File([data], value, { type: 'application/doc' });
                    // console.log(imageFile);
                //      FileSaver.saveAs(imageFile);


                }
            }).catch((error)=> {
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
    deletefile(item:any, name:any) {
        //let attach:any='';
        if (this.attachments.length > 1) {
            const index = this.attachments.indexOf(name);
            this.attachments.splice(index, 1);
        }
        let attach: any = this.attachments[0];
        for (let i = 1; i < this.attachments.length; i++) {
            attach = this.attachments[i] + ',' + attach;
        }
        item.attachments = attach;
        this.vendormasterchangesmodel.attachments = attach;
        let connection = this.httpService.put(APIURLS.BR_VENDOR_MASTER_CHANGES_CREATION_POST_API, item.id, item);
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
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error deleteing file..';
        });
    }
    removefile(name:any) {
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

    showprintmodel(data: VendorMasterChanges) {
        this.printReason = null;
        this.printModel = {};
        this.printModel = Object.assign({}, data);
        jQuery("#printReasonModal").modal('show');
    }
    image!: string
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
        let locid = this.locationList.find((x:any)  => x.id == value.locationId);
        // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
        var printContents = document.getElementById('print-section').innerHTML;
        // var temp1=this.locationList.find(x=>x.id==this.currentUser.baselocation);
        var OrganisationName = "MICRO LABS LIMITED" + ', ' + locid.code + '-' + locid.name;
        //var name=this.requestType.toLocaleUpperCase();
        var ReportName = 'Vendor Master Request Form';
        var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
        var now = new Date();
        var reason = this.printReason;
        var jsDate = this.setFormatedDateTime(now);
        var logo = this.image;
        /*var htmnikhitml = htmlToPdfmake(`<html>
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
        })*/
        var docDefinition = {
            info: {
                title: 'Vendor Master request form',
            },

            content: [
                //htmnikhitml,
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
            header: function (currentPage:any, pageCount:any) {
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
                                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' + ' This document printed electronically through Unnati v1.0 software' },
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
        //pdfMake.createPdf(docDefinition).open();
    }

    InsertPrintLog() {
        this.errMsg = "";
        let connection: any;
        let model: any = {};
        model.process = "Vendor Master";
        model.printingReason = this.printReason;
        model.printedBy = this.currentUser.fullName;
        model.printedOn = new Date().toLocaleString();
        model.requestNo = this.vendormasterchangesmodel.id;
        connection = this.httpService.post(APIURLS.BR_PRINT_LOG_INSERT, model);

    }


    notFirst = true;

    checkStatus() {
        // console.log(this.selParentRole.length+'<->'+this.notFirst);
        // console.log('item:'+this.selParentRole);
        if (this.filterstatus == null || this.filterstatus == '' || this.filterstatus == undefined) this.notFirst = false;
    }



    checkCountry() {
        if (this.vendormasterchangesmodel.country == null || this.vendormasterchangesmodel.country == '' || this.vendormasterchangesmodel.country == undefined) this.notFirst = false;
    }

    checkVenTyp() {
        if (this.vendormasterchangesmodel.typeOfVendor == null || this.vendormasterchangesmodel.typeOfVendor == '' || this.vendormasterchangesmodel.typeOfVendor == undefined) this.notFirst = false;
    }

    checkState() {
        if (this.vendormasterchangesmodel.state == null || this.vendormasterchangesmodel.state == '' || this.vendormasterchangesmodel.state == undefined) this.notFirst = false;
    }

    getCodeDetails() {
        let connection: any;
        this.isLoading = true;
        connection = this.httpService.getByParam(APIURLS.BR_VENDOR_MASTERCHANGES_APPROVERS_GETBY_PARAM_ALL, this.vendorCode)
        connection.then((data:any) => {
            if (data.length > 0) {
                this.vendormasterchangesmodel.vendorCode = data[0].sapCodeNo
                this.vendormasterchangesmodel.vendorType = data[0].typeOfVendor;
                this.vendormasterchangesmodel.vendorName = data[0].name;
                this.vendormasterchangesmodel.address = data[0].address1;
                this.vendormasterchangesmodel.city = data[0].city;
                this.vendormasterchangesmodel.state = data[0].state;
                this.vendormasterchangesmodel.gstinNumber = data[0].gstinNumber;
                this.vendormasterchangesmodel.country = data[0].countryId;

                this.getApproversList(data[0]);
            }
            this.isLoading = false;

        }).catch((error) => {
            this.isLoading = false;
        })
    }

}