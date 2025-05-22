import { AuthData } from '../../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Location } from '../../masters/employee/location.model';
import { MatAutocompleteTrigger } from '@angular/material';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { stringify } from 'querystring';
import { saveAs } from 'file-saver';
declare var require: any;
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
// import { Transactions } from '../eMicro/ItemCodeCreation/transactions.model';
// import { WorkFlowApprovers } from '../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { ExcelService } from '../../shared/excel-service';
//import { DocCreateHistory } from '../../MedicalServices/DocCreateHistory/DocCreateHistory.model';
import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { AssignApprover } from '../AssignApprovers/AssignApprover.model';
import { MediServiceBrand } from '../../MedicalServices/MediServiceBrand/MediServiceBrand.model';
import { MediServiceRequestHistory } from '../../MedicalServices/MediServiceRequestHistory/MediServiceRequestHistory.model';


import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
//import { MediServiceBrand } from '../MediServiceBrand/MediServiceBrand.model';

@Component({
    selector: 'app-AssignApprover',
    templateUrl: './AssignApprover.component.html',
    styleUrls: ['./AssignApprover.component.css']
})
export class AssignApproverComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

    @ViewChild('myInput') myInputVariable: ElementRef;

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

    filterbarcode: string = null;
    filterBrand: string = null;

    AssignApprovermodel = {} as AssignApprover;
    AssignApproverlist: AssignApprover[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype: string;
    filterMaterialCode: string = null;
    filterstatus: string = null;
    filterlocation: string = null;
    filterdocno: string = null;
    filterplace: string = null;
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    DocCreateFilter: AssignApprover[] = [];
    DocCreatesearchlist: AssignApprover[] = [];

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

    //AssignApprovermodeldata = {} as ItemCodeExtension;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
        private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

    private initDatatable(): void {
        let exampleId: any = jQuery('#USERSTable');
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
        this.userid = this.currentUser.employeeId;
        this.requestdate = new Date(this.today);
        this.filterlocation = this.currentUser.baselocation.toString();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // if (chkaccess == true) {
        this.getApproverdetails();
        this.getLocationMaster();
        //this.getCategoryList();
    }

    CategoryList: any[] = [];
    getCategoryList(code) {
        this.httpService.DLSgetByParam(APIURLS.BR_GET_TYP_CAT_GET_BYPARAM_MASTER,code).then((data: any) => {
            if (data.length > 0) {
                this.CategoryList = data
                this.CategoryListfilterd=this.CategoryList.filter(x=>x.location==code);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.CategoryListfilterd.sort((a, b) => { return collator.compare(a.type, b.type) });
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }

   
    LocRackList:any[]=[];
    BinsList:any[]=[];
    getLocRackList() {
        this.httpService.DLSget(APIURLS.BR_LOC_RACK_DETAILS_MASTER).then((data: any) => {
            if (data.length > 0) {

                this.LocRackList = data.filter(x => (x.location).toLocaleLowerCase() == this.locationCode.toLocaleLowerCase());
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.LocRackList.sort((a, b) => { return collator.compare(a.type, b.type) });
                // this.CategoryList.filter(x=>x.location==this.locationCode);
                //this.RoomList = this.DocRackMasterList.filter((item, i, arr) => arr.findIndex((t) => t.room === item.room) === i);
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }


    CategoryList1: any[] = [];
    GetCategory(type) {
        this.CategoryList1 = this.CategoryList.filter(x => x.type == type && x.category != null);
    }
    CategoryListfilterd:any[]=[];
    GetTypes(loc)
    {
        this.getCategoryList(loc);       
        var temp = this.locationList.find(x=>x.code==loc);
        this.getEmployeeMaster(temp.id);
    }

    locationAllList: any[] = [[]];
   
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
        this.filterdocno = null;
        this.filterplace = null;
        this.filterbarcode = null;
        this.filterBrand = null;

    }

    getAllEntries()
    {
        this.isLoading = true;
    }

    DocCreateFilter1: AssignApprover[] = [];
    getApproverdetails() {
        this.isLoading = true;       
        this.httpService.DLSget(APIURLS.BR_GET_DOC_APPROVER).then((data: any) => {
            if (data) {
                    this.AssignApproverlist  = data;
             }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.DocCreateFilter = [];
        });

    }
    dynamicArray: any = [];
    newDynamic: any = {};
    rowcount: number = 0;
    addRows() {
        this.rowcount = this.rowcount + 1;
        this.newDynamic = { id: this.rowcount, competitorBrand: "", competitorDetails: "", competitorExistingmarketshare: "", competitorMrp: "", stored: "0" };
        this.dynamicArray.push(this.newDynamic);
    }
    removeRows(item) {
        if (this.dynamicArray.length > 1) {
            const index = this.dynamicArray.indexOf(item);
            this.dynamicArray.splice(index, 1);
        }
    }

    locationCode: string;
    getLocationMaster() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            if (data.length > 0) {
                this.locationAllList = data;
                this.locationList = data.filter(x => x.isActive);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
                this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
                this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
                this.locationCode = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
                //this.getCategoryList(this.locationCode);
            }
        }).catch(error => {
            this.isLoading = false;
            this.locationList = [];
        });
    }

    EmpCode: string;
    EmpMaster: any []= [];
    getEmployeeMaster(id) {
        this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API,id).then((data: any) => {
            if (data.length > 0) {
                this.EmpMaster = data;
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
        this.errMsg1 = "";
        this.AssignApprovermodel = {} as AssignApprover;
        this.BinsList=[];
    }

    empId: string;
    view: boolean = false;
    locationName: string;
    onUserActions(isedit: boolean, AssignApprover: AssignApprover, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.view = false;
        this.errMsg1 = "";
        this.errMsgPop = "";
        if (isedit) {
            this.CategoryListfilterd = this.CategoryList;
            let temp=this.locationList.find(x=>x.code==AssignApprover.location);
            this.getEmployeeMaster(temp.id);
            this.getCategoryList(AssignApprover.location);
            this.CategoryList1 = this.CategoryList;
            this.AssignApprovermodel = Object.assign({}, AssignApprover);
        }
        else {
            this.AssignApprovermodel = {} as AssignApprover;
        }
        jQuery("#searchModal").modal('hide');
        jQuery('#myModal').modal('show');
    }
    isValid: boolean = false;
    validatedForm: boolean = true;

    onSaveEntry(status) {
        this.errMsg = "";
        let connection: any;
     
            if (!this.isEdit) {
                
            this.AssignApprovermodel.createdBy = this.currentUser.employeeId;
            this.AssignApprovermodel.createdDate = new Date().toLocaleString();
                connection = this.httpService.DLSpost(APIURLS.BR_MASTER_DOC_APPROVER_INSERT, this.AssignApprovermodel);
            }
            else 
            {
                this.AssignApprovermodel.modifiedBy = this.currentUser.employeeId;
            this.AssignApprovermodel.modifiedDate = new Date().toLocaleString();
                connection = this.httpService.DLSput(APIURLS.BR_MASTER_DOC_APPROVER_INSERT, this.AssignApprovermodel.id,this.AssignApprovermodel); 
            }
            connection.then((output: any) => {
                this.isLoadingPop = false;
                if (output == 200 || output.id > 0) {
                   
                        jQuery("#myModal").modal('hide');
                        this.errMsgPop1 = 'Approvers saved successfully!';
                        jQuery("#saveModal").modal('show');
                     
                     this.getApproverdetails();
                  
                    
                    // this.reset();
                }
            }).catch(error => {
                this.isLoadingPop = false;
                this.errMsgPop = 'Error saving Request..';
            });

      //  }


    }

}
