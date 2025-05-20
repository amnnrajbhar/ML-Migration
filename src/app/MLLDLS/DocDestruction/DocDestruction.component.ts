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
//import { DocCreate } from './DocCreate.model';
// import { Transactions } from '../eMicro/ItemCodeCreation/transactions.model';
// import { WorkFlowApprovers } from '../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { ExcelService } from '../../shared/excel-service';
//import { DocCreateHistory } from '../../MedicalServices/DocCreateHistory/DocCreateHistory.model';
import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { DocCreate } from '../DocCreate/DocCreate.model';
import { MediServiceBrand } from '../../MedicalServices/MediServiceBrand/MediServiceBrand.model';
import { MediServiceRequestHistory } from '../../MedicalServices/MediServiceRequestHistory/MediServiceRequestHistory.model';


import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DocDestruction } from './DocDestruction.model';
//import { MediServiceBrand } from '../MediServiceBrand/MediServiceBrand.model';

@Component({
    selector: 'app-DocDestruction',
    templateUrl: './DocDestruction.component.html',
    styleUrls: ['./DocDestruction.component.css']
})
export class DocDestructionComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

    @ViewChild('myInput') myInputVariable: ElementRef;

    public tableWidget: any;
    public tableWidget1: any;
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

    DocCreatemodel = {} as DocCreate;

    DocCreatelist: DocCreate[] = [];
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

    DocCreateFilter: DocCreate[] = [];
    DocCreatesearchlist: DocCreate[] = [];

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


    MedHead: string = 'Manjula  Suresh';
    MedHeadList: any[] = [];
    Reviewer: string = null;
    ReviewerList: any[] = [];
    MediRequestFilter: any[] = [];
    Approves: any;
    Comments: string;

    storeData: any;
    jsonData: any;
    fileUploaded: File;
    worksheet: any;
    Librarian:boolean=false;

    //DocCreatemodeldata = {} as ItemCodeExtension;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
        private http: HttpClient, private datePipe: DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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

    private initDatatable1(): void {
        let exampleId: any = jQuery('#userTable1');
        this.tableWidget1 = exampleId.DataTable({
            "order": []
        });
    }

    private reInitDatatable1(): void {
        if (this.tableWidget1) {
            this.tableWidget1.destroy()
            this.tableWidget1 = null
        }
        setTimeout(() => this.initDatatable1(), 0)
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
        this.Approves = 'Approve';
        this.getAllEntries();
        this.getLocationMaster();
        this.getbase64image();
    }

    isMasterSel: boolean = false;
    checkUncheckAll() {
      for (var i = 0; i < this.DocCreateFilter.length; i++) {
        this.DocCreateFilter[i].isSelected = this.isMasterSel;
      }
      this.getCheckedItemList();
    }
    isAllSelected() {
      this.isMasterSel = this.DocCreateFilter.every(function (item: any) {
        return item.isSelected == true;
      })
      this.getCheckedItemList();
    }
    checkedRequestList: any[]=[];
    checkedlist: any[] = [];
    getCheckedItemList() {
      this.checkedRequestList = [];
      this.checkedlist = [];
      for (var i = 0; i < this.DocCreateFilter.length; i++) {
        if (this.DocCreateFilter[i].isSelected)
          this.checkedlist.push(this.DocCreateFilter[i]);
      }
      this.checkedRequestList = this.checkedlist;
    }


    locationAllList: any[] = [[]];
    getLocation(id) {
        let temp = this.locationList.find(e => e.id == id);
        return temp ? temp.code : '';
    }
    getloc(loc) {
        let loccode = loc.keyValue.split('~');
        return loccode ? loccode[0] : '';
    }

    statuslist: any[] = [
        { id: 1, name: 'Saved' },
        { id: 2, name: 'InProcess' },
        { id: 3, name: 'Rejected' },
        { id: 4, name: 'Completed' }
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
        this.filterdocno = null;
        this.filterplace = null;
        this.filterbarcode = null;
        this.filterBrand = null;
        this.Approves = null;

    }

    DocCreateFilter1: DocCreate[] = [];
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

        this.DocCreatemodel.docType = this.filterdocno;       
        this.DocCreatemodel.location = this.locationCode;       
        filterModel.FromDate = this.getFormatedDateTime(this.from_date);
        filterModel.ToDate = this.getFormatedDateTime(this.to_date);
        this.httpService.DLSpost(APIURLS.BR_DOC_DEST_REQUEST_FILTER, this.DocCreatemodel).then((data: any) => {
            if (data) {
               
                    this.DocCreateFilter = data;
                    this.DocCreateFilter.reverse();
             }
            this.reInitDatatable1();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.DocCreateFilter = [];
        });

    }

    
    getAllEntries1() {
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

        filterModel.requestNo = this.filterdocno;   
        filterModel.location=this.locationCode;    
        filterModel.barcode = this.filterbarcode;  
        filterModel.status=this.filterstatus  ;   
        filterModel.FromDate = this.getFormatedDateTime(this.from_date);
        filterModel.ToDate = this.getFormatedDateTime(this.to_date);
        this.httpService.DLSpost(APIURLS.BR_DOC_DEST_FILTER, filterModel).then((data: any) => {
            if (data) {
               
                    this.DocCreateFilter1 = data;
                    this.DocCreateFilter1.reverse();
             }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.DocCreateFilter = [];
        });

    }


    getLibrarianDetails(cat)
    {
        let searchtr=this.locationCode;
        this.httpService.DLSgetByParam(APIURLS.BR_DOC_DEST_APPROVERS, searchtr).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.Approverslist = data;
                 var temp=this.Approverslist.find(x=>x.approverId==this.currentUser.employeeId);
                 temp ? this.Librarian=true:this.Librarian=false;
                // this.Approver ='Medical';
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.Approverslist = [];
        });
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
               // this.getCategoryList();
               // this.getRackList();
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
        this.DocCreatemodel = {} as DocCreate;
        this.Comments = null;
    }


    transactionslist: any[] = [];
    gettransactions(data) {
        this.httpService.DLSpost(APIURLS.BR_DOC_DESTRUCTION_HISTORY, data).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.transactionslist = data;
                // var temp=this.transactionslist.find(x=>x.doneBy==this.currentUser.employeeId && x.transactionType=='Pending');
                // this.Approver ='Medical';
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.transactionslist = [];
        });

    }
    Approverslist: any[] = [];
    accountGroupList: any[] = [];
    Aprlpriority: number;
    ApprovingManager: any;
    ApprvrM: boolean = false;
  
    empId: string;
    view: boolean = false;
    locationName: string;
    attachments: any[] = [];
    status:string;
    onUserActions(isedit: boolean, DocCreate: DocCreate, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.view = false;
        this.errMsg1 = "";
        this.status="";
        this.errMsgPop = "";
        this.transactionslist = [];
        this.Approverslist = [];
        this.ReviewerList = [];
        this.attachments = [];
   
        this.Reviewer = null;

        if (isedit) {
            this.DocCreatemodel = Object.assign({}, DocCreate);
            this.getLibrarianDetails(this.DocCreatemodel);
            this.gettransactions(this.DocCreatemodel);  
  //          this.CategoryList1 = this.CategoryList;    
           this.docDestRequest=this.DocCreateFilter1.filter(x=>x.initialDocNo==this.DocCreatemodel.initialDocNo);    
        }
        if(value == 'Saved')
        {
            this.status='Saved';
            this.DocCreatemodel = Object.assign({}, DocCreate);
            this.getLibrarianDetails(this.DocCreatemodel);
            this.gettransactions(this.DocCreatemodel);  
  //          this.CategoryList1 = this.CategoryList;    
           this.docDestRequest=this.DocCreateFilter1.filter(x=>x.initialDocNo==this.DocCreatemodel.initialDocNo); 
        }
        else {

            this.DocCreatemodel = {} as DocCreate;
            this.DocCreatemodel.empCode = this.currentUser.employeeId;
            this.DocCreatemodel.location = this.locationCode + '-' + this.locationList.find(x => x.id == this.currentUser.baselocation).name;
            this.DocCreatemodel.fromDept = this.currentUser.department;
            this.DocCreatemodel.initialDocDate = new Date().toLocaleString();
            this.getLibrarianDetails(this.DocCreatemodel);
        }



        if (value == 'View') {
            this.Approver1 = true;
            this.Creator = true;
            this.view = true;

        }


        jQuery("#searchModal").modal('hide');
        jQuery('#myModal').modal('show');


    }
    docdestructionModel={} as DocDestruction;
    docDestRequest:any[]=[];
    onApproverActions(isedit: boolean, DocDest: DocDestruction, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.view = false;
        this.errMsg1 = "";
        this.errMsgPop = "";
        this.transactionslist = [];
        this.Approverslist = [];
        this.ReviewerList = [];
        this.attachments = [];
   
        this.Reviewer = null;

        if (isedit) {
            this.docdestructionModel = Object.assign({}, DocDest);
            this.getLibrarianDetails(this.docdestructionModel);
            this.gettransactions(this.docdestructionModel); 
            this.docDestRequest=this.DocCreateFilter1.filter(x=>x.initialDocNo==this.docdestructionModel.initialDocNo); 
  //          this.CategoryList1 = this.CategoryList;       
        }

        else {

            this.docdestructionModel = {} as DocDestruction;
            this.docdestructionModel.empCode = this.currentUser.employeeId;
            this.docdestructionModel.location = this.locationCode + '-' + this.locationList.find(x => x.id == this.currentUser.baselocation).name;
            this.docdestructionModel.fromDept = this.currentUser.department;
            this.docdestructionModel.initialDocDate = new Date().toLocaleString();
            this.getLibrarianDetails(this.docdestructionModel);
        }



        if (value == 'View') {
            this.Approver1 = true;
            this.Creator = true;
            this.view = true;

        }


        jQuery("#searchModal").modal('hide');
        jQuery('#approverModal').modal('show');


    }

    isValid: boolean = false;
    validatedForm: boolean = true;

    onSaveEntry(status) {
        this.errMsg = "";
        let connection: any;
        if (this.Approverslist.length == 0) {
            swal({
                title: "Message",
                text: "Approvers are not defined",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            });
        }
       else {
            if (!this.isEdit) {
                this.DocCreatemodel.location=this.locationCode;
                this.DocCreatemodel.empCode = this.currentUser.employeeId;
                this.DocCreatemodel.docNo=this.checkedRequestList.map(x => x.docNo).join();
                this.DocCreatemodel.reqStatus = status;
                this.DocCreatemodel.comments=this.Comments;
                connection = this.httpService.DLSpost(APIURLS.BR_DOC_DESTR_REQUEST_INSERT, this.DocCreatemodel);
            }
            connection.then((output: any) => {
                this.isLoadingPop = false;
                if (output == 200 || output.id >= 0) {
                    if(output.type!='S')
                    {
                        swal({
                            title: "Message",
                            text: output.message,
                            icon: "warning",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                    }
                    else{
                        jQuery("#myModal").modal('hide');
                        swal({
                            title: "Message",
                            text: output.message,
                            icon: "success",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                        }
                    
                    
                    
                    // this.reset();
                }
                this.getAllEntries1();
            }).catch(error => {
                this.isLoadingPop = false;
                this.errMsgPop = 'Error saving Request..';
            });

        }


    }

    onSubmitEntry(DocCreate: DocCreate) {

        this.DocCreatemodel = {} as DocCreate;
        this.DocCreatemodel = Object.assign({}, DocCreate);
        this.errMsg = "";
        let connection: any;
        this.DocCreatemodel.reqStatus='Submitted';


        connection = this.httpService.DLSpost(APIURLS.BR_DOC_DESTR_REQUEST_INSERT, this.DocCreatemodel);
        connection.then((output: any) => {
            this.isLoadingPop = false;
            if (output == 200 || output.id >= 0) {
                if(output.type!='S')
                    {
                        swal({
                            title: "Message",
                            text: output.message,
                            icon: "warning",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                    }
                    else{
                        jQuery("#myModal").modal('hide');
                        swal({
                            title: "Message",
                            text: output.message,
                            icon: "success",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                        }
                    
                //this.sendMail(this.DocCreatemodel)
                this.getAllEntries1();
                // this.reset();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error Submitting Request' + '' + this.DocCreatemodel.barcode;
        });
    }

    onreview(status) {
        this.errMsg = "";
        let connection: any;
        let uid = this.currentUser.employeeId;
        if (status == "Rejected") {
            // this.DocCreatemodel.pendingApprover = 'No';
            this.DocCreatemodel.reqStatus = "Rejected";
            // this.DocCreatemodel.rejectedFlag='1';
        }

        this.DocCreatemodel.docNo=this.docdestructionModel.docNo;
        this.DocCreatemodel.initialDocNo=this.docdestructionModel.initialDocNo;
        this.DocCreatemodel.location=this.docdestructionModel.location;
        this.DocCreatemodel.initialDocNo=this.docdestructionModel.initialDocNo;
         this.DocCreatemodel.lastApprover=this.currentUser.employeeId;         
         this.DocCreatemodel.lastApprover=this.currentUser.employeeId;
         this.DocCreatemodel.comments=this.Comments;
         let temp=this.Approverslist.find(x=>x.priority==2);
         if(temp.approverId==this.currentUser.employeeId)
         {
            this.DocCreatemodel.pendingApprover='No';
            this.DocCreatemodel.reqStatus='Librarian';
         }
         else{
            this.DocCreatemodel.pendingApprover=temp.approverId;
            this.DocCreatemodel.reqStatus=status;
         }
        
        // this.DocCreatemodel.lastApprover = this.currentUser.fullName;
        // this.DocCreatemodel.mo = this.currentUser.employeeId;
        // this.DocCreatemodel.modifiedDate = new Date().toLocaleString();

        connection = this.httpService.DLSpost(APIURLS.BR_DOC_DESTR_REQUEST_UPDATE,this.DocCreatemodel);
        connection.then((output: any) => {
            this.isLoadingPop = false;
            if (output == 200 || output.id >= 0) {
               
                //var data=output.result;
                if(output.type =='E')
                {
                    swal({
                        title: "Message",
                        text: output.message,
                        dangerMode: false,
                        buttons: [false, true]
                    }); 
                }
                else{
                    if(status == "Rejected")
                    {
                        swal({
                            title: "Message",
                            text: 'Doc Destruction Rejected Successfully',
                            icon: "success",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                    }
                    else{

                    if(temp.approverId==this.currentUser.employeeId)
                    {
                        swal({
                            title: "Message",
                            text: 'Document Destroyed Successfully',
                            icon: "success",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                    }
                    else{
                        swal({
                            title: "Message",
                            text: 'Doc Destruction Approved Successfully',
                            icon: "success",
                            dangerMode: false,
                            buttons: [false, true]
                        }); 
                    }
                   
                }
                    
                }
                jQuery("#approverModal").modal('hide');
               // this.errMsgPop1 = status == "Rejected" ? "Request " + '' + this.DocCreatemodel.barcode + '' + status + " Successfully!" : "Request " + '' + this.DocCreatemodel.barcode + '' + " Approved Successfully!";
             
                this.getAllEntries();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = status == "Rejected" ? "Error Rejecting Request.." + '' + this.DocCreatemodel.barcode : "Error Approving Request" + '' + this.DocCreatemodel.barcode;
        });
    }

    onRevertRequest(status) {
        this.errMsg = "";
        let connection: any;

        this.DocCreatemodel.pendingApprover = this.currentUser.employeeId;
        // this.DocCreatemodel.lastApprover = this.currentUser.fullName;
        // this.DocCreatemodel.modifiedBy = this.currentUser.employeeId;
        // this.DocCreatemodel.modifiedDate = new Date().toLocaleString();

        connection = this.httpService.post(APIURLS.BR_NPD_REQUEST_REVERT_API, this.DocCreatemodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = "Request " + '' + this.DocCreatemodel.barcode + '' + " Reverted Successfully!";
                jQuery("#saveModal").modal('show');
                if (status != "ReverttoInitiator") {
                    //   this.sendPendingMail(this.DocCreatemodel);
                }
                //  this.sendMail(status, this.DocCreatemodel);
                // this.Inserttransactions(this.DocCreatemodel, 'Revert')
                this.getAllEntries();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = "Error Reverting Request " + '' + this.DocCreatemodel.barcode;
        });
    }


    image:string;
    getbase64image()
    {
      this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image=event.target.result;
        };
  
      });
    }
    downloadPdf()
  {
    let temp=this.locationList.find(x=>x.id==this.currentUser.baselocation);
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICRO LABS LIMITED"+', '+temp.code+' - '+temp.name;
    var ReportName = "DOCUMENT DESTRUCTION REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate =new Date().toDateString();
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
      tablebordered:true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })
    var docDefinition = {
      info: {
        title: ReportName,
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
       // pageMargins: [30, 60, 10, 20],
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
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        return {
        // pageMargins: [40, 80, 40, 60],
         style: 'tableExample',
         color: '#444',
         table: {
            widths: [60, 350, 70],
           headerRows: 2,
           //heights: [20, 10, 10,10],
           // keepWithHeaderRows: 1,
           body: [
             [{rowSpan: 2,	image: logo,
             width: 50,height:40,
             opacity: 0.5,  alignment: 'center'}
             , {text: OrganisationName, arial: true,	bold: true, fontSize: 15,color: 'black',alignment: 'center'}, 
             {rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
              { text: pageCount.toString() }], bold: true, fontSize: 10,color: 'black', alignment: 'center'}],
              [''
               , { text: ReportName, arial: true,bold: true, fontSize: 13,color: 'black', alignment: 'center'  },
               '']
           ]
         },

         
          margin: [40, 40, 40, 60]
        }
      },
      footer: function(){
        return {

          columns: [
           
            {
              alignment: 'left',
              stack: [
                { text: 'Printed By' + ": " + printedBy +', '+'Printed On' + ": " + jsDate+'.'  }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }
           
//imgData
          ],
          margin: 20
        }
      },
     
    };
    pdfMake.createPdf(docDefinition).open();
  }
   
}
