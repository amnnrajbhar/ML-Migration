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
// import { MatAutocompleteTrigger, MatGridTileHeaderCssMatStyler } from '@angular/material';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';

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
import { parse, stringify } from 'querystring';
import { ItemCodeRequest } from '../ItemCodeCreation/ItemCodeCreation.model';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { CustomerMasterChanges } from './CustomerMasterChanges.model';
import { saveAs } from 'file-saver';
//import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { CustomerMaster } from '../CustomerMaster/CustomerMaster.model';
import { HttpClient } from '@angular/common/http';
declare var require: any;

@Component({
    selector: 'app-CustomerMasterChanges',
    templateUrl: './CustomerMasterChanges.component.html',
    styleUrls: ['./CustomerMasterChanges.component.css']
})
export class CustomerMasterChangesComponent implements OnInit {
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

    formData: FormData = new FormData();
    file: File; successMsg: string = "";
    path: string = '';
    locationList: any[] = [[]];
    selectedBaseLocation: any = [];
    baseLocationnotfirst = true;

    CustomerMastermodel = {} as CustomerMaster;
    CustomerMasterChangesmodel = {} as CustomerMasterChanges
    customermasterchangeslist: CustomerMasterChanges[] = [];
    comments: string;
    customercode: string;
    customername: string = null;
    address: string = null;
    status: string;
    country: string = null;
    state: string = null;
    requestno: string = null;
    city: string = null;
    gstno: string = null;
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    CustomerMasterChangessearchlist: CustomerMasterChanges[] = [];
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
    storeData: any;
    jsonData: any;
    fileUploaded: File;
    worksheet: any;
    priority: number;
    filterlocation: string;
    gstinnumber: string;
    sapCodeNo: any;
    Role: string;
    filterrequest: any;
    filterplace: any;
    filterstatus: string;
    CustomerMastersearchlist: any[];
    customerName: any;


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
        this.status = 'Pending';
        this.filterlocation = this.currentUser.baselocation.toString();
        this.userid = this.currentUser.employeeId;
        this.requestdate = new Date(this.today);
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // if (chkaccess == true) {
        this.getLocationMaster();
        this.getstateList();
        this.getCountryList();
        this.getCustomerGroupList();
        this.getbase64image();
        // else
        //  this.router.navigate(["/unauthorized"]);
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
            this.errMsgPop = 'Error uploading file ..';
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
        this.status = null;
        this.customercode = null;
        this.customername = "";
        this.requestno = null;
    }

    location(id) {
        let loc = this.locationList.find(x => x.id == id);
        return loc ? loc.code : "";
    }

    CustomerGroupList: any[] = [];
    getCustomerGroupList() {
        this.httpService.get(APIURLS.BR_CUSTOMER_GROUP_POST_API).then((data: any) => {
            if (data.length > 0) {
                this.CustomerGroupList = data;
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CustomerGroupList = [];
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
            this.isLoading = false;
            this.stateList = [];
        });
    }

    getstatelist(id) {
        this.stateList1 = this.stateList.filter(x => x.land1 == id);
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
        filterModel.customerCode = this.customercode;
        filterModel.customerName = this.customerName;
        filterModel.status = this.status;
        // filterModel.status = this.filterstatus;
        filterModel.fromDate = this.getFormatedDateTime(this.from_date);
        filterModel.toDate = this.getFormatedDateTime(this.to_date);
        this.httpService.post(APIURLS.GET_FILTERED_RESULT_OF_CMC, filterModel).then((data: any) => {
            if (data) {
                this.CustomerMasterChangessearchlist = data;
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CustomerMasterChangessearchlist = [];
        });

    }

    continue: boolean = false;


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



    currentUser: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }

    resetForm() {
        this.customercode = null;
        this.CustomerMasterChangesmodel = {} as CustomerMasterChanges;
        this.comments = "";
    }


    transactionslist: Transactions[] = [];
    gettransactions(reqNo) {
        this.httpService.getByParam(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API, reqNo).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.transactionslist = data.filter(x=>x.processType=='Customer Master Changes');;
                // this.transactionslist.reverse();
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

    getApproversList(value) {

        // this.Approver1 = false;
        // this.Approver2 = false;
        // this.Creator = false;
        // this.Review = false;
        // this.Closure = false;

        //var mat = this.materialList.find(x => x.id == +this.ItemCodeRequestModel.materialTypeId);
        // var matgrp=this.materialgroupList.find(x=>x.materialGroupId==this.ItemCodeRequestModel.materialGroupId);

        var keyvalue = this.CustomerMasterChangesmodel.plant + '~' + this.CustomerMasterChangesmodel.customerType + ',' + 4;
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
        jQuery("#searchModal").modal('show');
    }
    onClickNewRequest() {
        this.resetForm();
        this.continue = false;
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
                            text: "file with name" + (this.files[j].name) + "already Exists",
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


    transactions = {} as Transactions;
    Inserttransactions(data, id) {
        this.errMsg = "";
        let connection: any;
        this.transactions.doneBy = this.currentUser.employeeId;
        //this.transactions.doneOn = new Date().toLocaleString();
        this.transactions.requestNo = data.id;
        this.transactions.comments = this.CustomerMasterChangesmodel.comments;
        this.transactions.approvalPriority = this.priority;
        this.transactions.transactionType = id;
        this.transactions.processType = "Customer Master Changes";
        connection = this.httpService.post(APIURLS.BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API, this.transactions);

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

        if (this.attachments.length > 1) {
            const index = this.attachments.indexOf(name);
            this.attachments.splice(index, 1);
        }
        let attach: any = this.attachments[0];
        for (let i = 1; i < this.attachments.length; i++) {
            attach = this.attachments[i] + ',' + attach;
        }
        item.attachments = attach;
        this.CustomerMasterChangesmodel.attachments = attach;
        let connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, item.id, item);
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

    showprintmodel(data: CustomerMasterChanges) {
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
        pdfMake.createPdf(docDefinition).open();
    }

    onSubmitEntry(customermasterchanges: CustomerMasterChanges) {

        this.CustomerMasterChangesmodel = {} as CustomerMasterChanges;
        this.CustomerMasterChangesmodel = Object.assign({}, customermasterchanges);
        this.errMsg = "";
        let connection: any;
        if (this.CustomerMasterChangesmodel.modifiedDate != null || this.CustomerMasterChangesmodel.modifiedDate != undefined) {
            this.CustomerMasterChangesmodel.status = "ReSubmitted";
        }
        else {
            this.CustomerMasterChangesmodel.status = "Submitted";
        }
        // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/Customer master Files/UploadFiles/';
        if (this.fileslist != null || this.fileslist != undefined) {
            for (let i = 0; i < this.fileslist.length; i++) {
                this.CustomerMasterChangesmodel.attachments = this.CustomerMasterChangesmodel.attachments + ',' + this.fileslist[i];
            }

        }
        this.CustomerMasterChangesmodel.modifiedBy = this.currentUser.employeeId;
        //this.CustomerMasterChangesmodel.modifiedDate=new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, this.CustomerMasterChangesmodel.id, this.CustomerMasterChangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                this.id = this.CustomerMasterChangesmodel.id.toString();
                this.uploadfile();
                jQuery("#searchModal").modal('hide');
                this.errMsgPop1 = 'Request Submitted Successfully!';
                jQuery("#saveModal").modal('show');
                this.Inserttransactions(this.CustomerMasterChangesmodel, 0);
                this.getAllEntries();
                this.reset();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error Submitting Request ';
        });
    }

    InsertPrintLog() {
        this.errMsg = "";
        let connection: any;
        let model: any = {};
        model.process = "Customer Master Changes";
        model.printingReason = this.printReason;
        model.printedBy = this.currentUser.fullName;
        model.printedOn = new Date().toLocaleString();
        model.requestNo = this.CustomerMasterChangesmodel.id;
        connection = this.httpService.post(APIURLS.BR_PRINT_LOG_INSERT, model);
    }

    notFirst = true;

    checkState() {
        if (this.CustomerMasterChangesmodel.state == null || this.CustomerMasterChangesmodel.state == '' || this.CustomerMasterChangesmodel.state == undefined) this.notFirst = false;
    }

    checkCountry() {
        if (this.CustomerMasterChangesmodel.country == null || this.CustomerMasterChangesmodel.country == '' || this.CustomerMasterChangesmodel.country == undefined) this.notFirst = false;
    }

    empId: string;
    view: boolean = false;
    attachments: any[] = [];
    locationname: string;
    onUserActions(isedit: boolean, customermasterchanges: CustomerMasterChanges, isprint: boolean, value: string) {
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
        this.gettransactions(customermasterchanges.id);
        // this.dataForm.form.markAsPristine();
        // this.dataForm.form.markAsUntouched();
        // this.dataForm.form.updateValueAndValidity();
        if (isedit) {
            //   this.getApproversList(ItemCodeExtension);
            this.getApproversList(customermasterchanges);

            this.stateList1 = this.stateList.filter(x => x.land1 == customermasterchanges.country);
            if (customermasterchanges.attachments != null || customermasterchanges.attachments != undefined) {
                this.attachments = customermasterchanges.attachments.split(',');
            }
            this.attachments.filter(x => x.name != null || undefined)
            this.CustomerMasterChangesmodel = Object.assign({}, customermasterchanges);
            this.customercode = this.CustomerMasterChangesmodel.customerCode;
            this.CustomerMasterChangesmodel.reasonForrequisition = this.CustomerMasterChangesmodel.reason;
            this.empId = this.CustomerMasterChangesmodel.createdBy;
        }

        if (value == 'View') {
            this.Approver1 = true;
            this.Creator = true;
            this.view = true;
        }
        if (value == 'Copy') {
            customermasterchanges.modifiedBy = null;
            customermasterchanges.modifiedDate = null;
            customermasterchanges.status = null;
            customermasterchanges.attachments = null
        }
        if (customermasterchanges.attachments != null || customermasterchanges.attachments != undefined) {
            this.attachments = customermasterchanges.attachments.split(',');
        }
        this.stateList1 = this.stateList.filter(x => x.land1 == customermasterchanges.country);
        this.CustomerMasterChangesmodel = Object.assign({}, customermasterchanges);
        this.getApproversList(customermasterchanges);
        if (isprint) {
            let ln = this.locationList.find(x => x.code == this.CustomerMasterChangesmodel.plantCode);
            this.locationname = ln.code + '-' + ln.name;
            this.CustomerMasterChangesmodel.country = this.countrylist.find(x => x.land1 == this.CustomerMasterChangesmodel.country).landx;
            this.CustomerMasterChangesmodel.state = this.stateList.find(x => x.id == this.CustomerMastermodel.state).bezei;
            jQuery("#printModal").modal('show');
        }
        else {
            jQuery("#searchModal").modal('show');
        }
    }


    getCodeDetails() {
        let connection: any;
        this.isLoading = true;
        connection = this.httpService.getByParam(APIURLS.BR_CUSTOMERMASTERCHANGES_APPROVERS_GETBY_PARAM_ALL, this.customercode)
        connection.then((data) => {

            if (data.length > 0) {
                this.CustomerMasterChangesmodel.customerCode = data[0].sapCodeNo
                this.CustomerMasterChangesmodel.customerType = data[0].customerType;
                this.CustomerMasterChangesmodel.customerName = data[0].name;
                this.CustomerMasterChangesmodel.address = data[0].address1;
                this.CustomerMasterChangesmodel.city = data[0].city;
                this.CustomerMasterChangesmodel.state = data[0].state;
                this.CustomerMasterChangesmodel.gstinNumber = data[0].gstinNumber;
                this.CustomerMasterChangesmodel.country = data[0].countryId;
                this.CustomerMasterChangesmodel.plant = data[0].plantCode;

                this.getApproversList(data[0]);
            }
            this.reInitDatatable();
            this.isLoading = false;

        }).catch((error) => {
            this.isLoading = false;
        })
    }

    isValid: boolean = false;
    validatedForm: boolean = true;
    onSaveEntry(status) {

        this.errMsg = "";
        let connection: any;
        let savecmmodel: any = {};
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
                this.CustomerMasterChangesmodel.customerCode = this.customercode;
                this.CustomerMasterChangesmodel.createdBy = this.currentUser.employeeId;
                this.CustomerMasterChangesmodel.requestedBy = this.currentUser.employeeId;
                //this.CustomerMasterChangesmodel.reason = this.CustomerMasterChangesmodel.reasonForrequisition;
                // let filepath='jsp/EMicro Files/ESS/sapMasterRequest/Customer master Files/UploadFiles/';
                if (this.fileslist != null || this.fileslist != undefined) {
                    // let file:any='';           
                    let file: any = this.fileslist[0];
                    for (let i = 1; i < this.fileslist.length; i++) {
                        file = this.fileslist[i] + ',' + file;
                    }
                    this.CustomerMasterChangesmodel.attachments = file;
                }
                //this.CustomerMastermodel.attachments=file;
                this.CustomerMasterChangesmodel.lastApprover = 'No';
                this.CustomerMasterChangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
                this.CustomerMasterChangesmodel.status = status == "Submit" ? "Submitted" : "Created";

                connection = this.httpService.post(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, this.CustomerMasterChangesmodel);
            }
            connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data == 200 || data.id > 0) {
                    this.id = data;
                    this.uploadfile();
                    jQuery("#searchModal").modal('hide');
                    this.errMsgPop1 = status == 'Save' ? 'Request ' + '' + data.id + '' + ' saved successfully!' : 'Request ' + '' + data.id + '' + ' Submitted Successfully!';
                    jQuery("#saveModal").modal('show');
                    if(data.status=="Submitted")
                    {
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

    onreview(status) {
        this.errMsg = "";
        let connection: any;
        let uid = this.currentUser.employeeId;
        if (status == "Rejected") {
            let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);
            this.CustomerMasterChangesmodel.pendingApprover = '';
            this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
        }
        else {
            let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

            this.CustomerMasterChangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
            this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
        }

        this.CustomerMasterChangesmodel.lastApprover = this.currentUser.fullName;
        this.CustomerMasterChangesmodel.modifiedBy = this.currentUser.employeeId;
        //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();
        this.CustomerMasterChangesmodel.status = status == "Rejected" ? status : status;
        connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, this.CustomerMasterChangesmodel.id, this.CustomerMasterChangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#searchModal").modal('hide');

                // var role=this.Approverslist.find(x=>x.role=='Approver')
                if (this.Role == "Approver") {
                    this.errMsgPop1 = status == "Rejected" ? "Request " + this.CustomerMasterChangesmodel.id + '' + status + " Successfully!" : "Request " + this.CustomerMasterChangesmodel.id + " Approved Successfully!";
                }
                else {
                    this.errMsgPop1 = status == "Rejected" ? "Request " + this.CustomerMasterChangesmodel.id + '' + status + " Successfully!" : "Request " + this.CustomerMasterChangesmodel.id + " Reviewed Successfully!";
                }
                jQuery("#saveModal").modal('show');
                let id = status == "Rejected" ? 2 : 1;
                if (status != "Rejected") {
                       this.sendPendingMail(this.CustomerMasterChangesmodel)
                }
                // this.sendMail(status, this.CustomerMastermodel)
                this.Inserttransactions(this.CustomerMasterChangesmodel, id)
                this.getAllEntries();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = status == "Rejected" ? "Error Rejecting Request" + '' + this.CustomerMasterChangesmodel.id : "Error Reviewing Request" + '' + this.CustomerMasterChangesmodel.id;
        });
    }

    onRevertRequest(status) {
        this.errMsg = "";
        let connection: any;
        if (status == "ReverttoInitiator") {
            let usid = this.currentUser.employeeId;
            let user = this.Approverslist.find(x => x.approverId == usid || x.parllelApprover1 == usid || x.parllelApprover2 == usid
                || x.parllelApprover3 == usid || x.parllelApprover4 == usid);

            this.CustomerMasterChangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == 1).approverId;
            this.CustomerMasterChangesmodel.status = "Reverted to initiator";
            this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
        }
        else {
            let uid = this.CustomerMasterChangesmodel.modifiedBy;
            let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

            this.CustomerMasterChangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority).approverId;
            this.priority = this.Approverslist.find(x => x.priority == user.priority + 1).priority;
            this.CustomerMasterChangesmodel.status = "Reverted";
        }

        this.CustomerMasterChangesmodel.lastApprover = this.currentUser.fullName;
        this.CustomerMasterChangesmodel.modifiedBy = this.currentUser.employeeId;
        //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();

        connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, this.CustomerMasterChangesmodel.id, this.CustomerMasterChangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#searchModal").modal('hide');
                this.errMsgPop1 = "Request " + '' + this.CustomerMasterChangesmodel.id + '' + " Reverted Successfully!";
                jQuery("#saveModal").modal('show');
                let id = status == "ReverttoInitiator" ? 4 : 3;
                if (status != "ReverttoInitiator") {
                    //   this.sendPendingMail(this.CustomerMastermodel)
                }

                // this.sendMail(status, this.CustomerMastermodel)
                this.Inserttransactions(this.CustomerMasterChangesmodel, id)
                this.getAllEntries();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Reverting Request " + '' + this.CustomerMasterChangesmodel.id;
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
            this.CustomerMasterChangesmodel.pendingApprover = temp.approverId;
            this.CustomerMasterChangesmodel.status = 'InProcess';
        }
        else {
            this.CustomerMasterChangesmodel.pendingApprover = 'No';
            this.CustomerMasterChangesmodel.status = 'Completed';
        }
      //  this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
        this.CustomerMasterChangesmodel.lastApprover = this.currentUser.fullName;
        this.CustomerMasterChangesmodel.modifiedBy = this.currentUser.employeeId;
        //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();
        this.CustomerMasterChangesmodel.sapCreatedBy = this.currentUser.employeeId + '-' + this.currentUser.fullName;
        this.CustomerMasterChangesmodel.sapCreationDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, this.CustomerMasterChangesmodel.id, this.CustomerMasterChangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#searchModal").modal('hide');
                this.errMsgPop1 = "Customer Code " + '' + this.CustomerMasterChangesmodel.customerCode + '' + " Modified Successfully!";
                jQuery("#saveModal").modal('show');
                if (this.CustomerMasterChangesmodel.pendingApprover != 'No') {
                    //   this.sendPendingMail(this.CustomerMastermodel)
                }
                this.sendMail(this.CustomerMasterChangesmodel)
                this.Inserttransactions(this.CustomerMasterChangesmodel, 1)
                this.getAllEntries();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Creating Customer Code " + '' + this.CustomerMasterChangesmodel.sapCodeNo;
        });

    }
    //   priority: number;
    oncloserequest(status) {
        this.errMsg = "";
        let connection: any;

        if (status == 'Completed') {
            let uid = this.currentUser.employeeId;
            let user = this.Approverslist.find(x => x.approverId == uid || x.parllelApprover1 == uid || x.parllelApprover2 == uid
                || x.parllelApprover3 == uid || x.parllelApprover4 == uid);

            this.CustomerMasterChangesmodel.pendingApprover = this.Approverslist.find(x => x.priority == user.priority + 1).approverId;
            this.priority = this.Approverslist.find(x => x.priority == user.priority).priority;
        }
        this.CustomerMasterChangesmodel.lastApprover = this.currentUser.fullName;
        this.CustomerMasterChangesmodel.modifiedBy = this.currentUser.employeeId;
        //this.CustomerMastermodel.modifiedDate = new Date().toLocaleString();
        this.CustomerMasterChangesmodel.status = 'Completed';
        this.CustomerMasterChangesmodel.pendingApprover = 'No';
        this.priority = 7;
        connection = this.httpService.put(APIURLS.BR_CUSTOMER_MASTER_CHANGES_POST_API, this.CustomerMasterChangesmodel.id, this.CustomerMasterChangesmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#searchModal").modal('hide');
                this.errMsgPop1 = "Request " + '' + this.CustomerMasterChangesmodel.sapCodeNo + '' + " Closed Successfully!";
                jQuery("#saveModal").modal('show');
                this.Inserttransactions(this.CustomerMasterChangesmodel, 1)
                // this.sendMail('Created', this.ItemCodeRequestModel)
                this.getAllEntries();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Closing Request " + '' + this.CustomerMasterChangesmodel.sapCodeNo;
        });
    }

    sendPendingMail(vendormasterchanges: CustomerMasterChanges) {
        let connection: any;
    
        connection = this.httpService.sendPutMail(APIURLS.SEND_CUSTOMER_MOD_MAIL, 'VendorPending', vendormasterchanges);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error in sending mail..';
        });
    
    }

    sendMail( vendormasterchanges: CustomerMasterChanges) {
        let connection: any;

        connection = this.httpService.sendPutMail(APIURLS.SEND_CUSTOMER_APPROVED_MOD_MAIL, 'VM', vendormasterchanges);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error in sending mail..';
        });

    }
}
