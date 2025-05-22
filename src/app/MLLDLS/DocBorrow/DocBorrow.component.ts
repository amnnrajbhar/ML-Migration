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
import { DocBorrow } from './DocBorrow.model';
//import { MediServiceBrand } from '../MediServiceBrand/MediServiceBrand.model';

@Component({
    selector: 'app-DocBorrow',
    templateUrl: './DocBorrow.component.html',
    styleUrls: ['./DocBorrow.component.css']
})
export class DocBorrowComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

    @ViewChild('myInput') myInputVariable: ElementRef;
    searchTerm = new FormControl();
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


    DocCreatemodel = {} as DocCreate;
    DocBorrowmodel={} as DocBorrow;
    DocCreatelist: DocCreate[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype: string;
    filterMaterialCode: string = null;
    filterstatus: string = null;
    filterlocation: string = null;
    filterdocno: string = null;
    filterplace: string = null;
    filterbarcode:string=null;
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    DocCreateFilter: DocCreate[] = [];
    DocCreatesearchlist: DocCreate[] = [];

   
    Comments: string;
    LibrarianName:string;
    
    SubCategoryList1:any;

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

    ngOnInit() {
        this.path = this.router.url;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
        this.filterlocation = this.currentUser.baselocation.toString();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        //this.getAllEntries();
        this.getLocationMaster();
    }

    dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
    };
    selectedStatus:any[]=[];
    AddDoc:boolean;
    onItemSelect(item: any) {
      // debugger;
      let temp=this.selectedStatus.find(x=>x.id==15);
      return temp ? this.AddDoc=true:this.AddDoc=false;
  
    }
    onItemDeSelect(item: any) {
      // debugger;
      //  console.log(item);
  
    }
    onSelectAll(items: any) {
      //debugger;
      //  console.log(items);
  
    }
    onDeSelectAll(items: any) {
  
    }

    CategoryList: any[] = [];
    getCategoryList() {
        this.httpService.DLSgetByParam(APIURLS.BR_GET_TYP_CAT_GET_BYPARAM_MASTER,this.locationCode).then((data: any) => {
            if (data.length > 0) {
                this.CategoryList = data.filter(x => x.location == this.locationCode);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.CategoryList.sort((a, b) => { return collator.compare(a.type, b.type) });
                // this.CategoryList.filter(x=>x.location==this.locationCode);
                this.getRackList();
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }

    DocRackMasterList: any[] = [];
    RoomList: any[] = [];
    RoomList1: any[] = [];
    getRackList() {
        this.httpService.DLSget(APIURLS.BR_LOC_RACK_DETAILS_MASTER).then((data: any) => {
            if (data.length > 0) {

                this.LocRackList = data.filter(x => (x.location).toLocaleLowerCase() == this.locationCode.toLocaleLowerCase());
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.LocRackList.sort((a, b) => { return collator.compare(a.room, b.room) });
                // this.CategoryList.filter(x=>x.location==this.locationCode);
                this.RoomList = this.LocRackList.filter((item, i, arr) => arr.findIndex((t) => t.room === item.room) === i);
                this.RoomList1 = this.LocRackList.filter((item, i, arr) => arr.findIndex((t) => t.rack === item.rack) === i);
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

                this.LocRackList = data.filter(x => (x.location) == this.locationCode);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.LocRackList.sort((a, b) => { return collator.compare(a.name, b.name) });
                // this.CategoryList.filter(x=>x.location==this.locationCode);
                //this.RoomList = this.DocRackMasterList.filter((item, i, arr) => arr.findIndex((t) => t.room === item.room) === i);
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }

    GetBins(value:DocCreate)
    {
    this.BinsList=this.LocRackList.filter(x=>x.room==value.docRoom && x.rack==value.docRack);
    this.BinsList.forEach(element => {       
            element.docNo=null;
    });
    }

    docNo:any;
    success:any;
    det(bin)
    {
        this.success=null;
        this.DocCreatemodel.docBin=bin;
        this.BinsList.forEach(element => {
            if(element.bin==bin)
            {
                element.docNo=this.DocCreatemodel.docNo;
                this.success="Bin "+bin +" assigned sucessfully"
            }
            else{
                element.docNo=null;
            }
        });
       
        
    }
    GetRacMasterkList(Room) {
        this.success=null;
        this.DocCreatemodel.docBin=null;
        this.RackList=[];
        this.BinsList=[];
        this.DocCreatemodel.docRack=null;
        this.RackList = this.RoomList1.filter(x => x.room == Room);
    }
    RackList: any[] = [];
    GetRackList(Room) {
        this.RackList = this.LocRackList.filter(x => x.room == Room);
    }
    CategoryList1: any[] = [];
    GetCategory(type) {
        this.CategoryList1 = this.CategoryList.filter(x => x.type == type && x.category != null);
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
        filterModel.location=this.locationCode;
        filterModel.RequestNo = this.filterdocno;       
        filterModel.status = this.filterstatus;
        filterModel.Barcode = this.filterbarcode;
        filterModel.FromDate = this.getFormatedDateTime(this.from_date);
        filterModel.ToDate = this.getFormatedDateTime(this.to_date);
        this.httpService.DLSpost(APIURLS.BR_DOC_BORROW_REQUEST_FILTER, filterModel).then((data: any) => {
            if (data) {
               
                    this.DocCreateFilter = data;
                    this.DocCreateFilter.reverse();
             }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.DocCreateFilter = [];
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
                this.getCategoryList();
                this.getAllEntries();
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
        this.BinsList=[];
        this.Comments = null;
    }
    Librarian:boolean=false;
    getLibrarianDetails(cat)
    {
        let searchtr=this.locationCode+'~'+cat.category+'~'+cat.docType;
        this.httpService.DLSgetByParam(APIURLS.BR_GET_DOC_APPROVERS, searchtr).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.Approverslist = data.filter(x=>x.reqType.toLocaleLowerCase()=='borrow');
                 var temp=this.Approverslist.find(x=>x.approverId==this.currentUser.employeeId);
                 temp ? this.Librarian=true:this.Librarian=false;
                // this.Approver ='Medical';
                this.Approverslist1 = this.Approverslist.map((i) => { i.librarian = i.approverId + ' - '+i.approverName+ ' - '+i.role+' - '+i.location; return i; });     
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.Approverslist = [];
        });
    }
    transactionslist: any[] = [];
    gettransactions(data) {
        this.httpService.DLSpost(APIURLS.BR_DOC_BORROW_HISTORY, data).then((data: any) => {
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
    Approverslist1: any[] = [];

    view: boolean = false;
    locationName: string;
    onUserActions(isedit: boolean, DocCreate: DocCreate, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.success=null;
        this.view = false;
        this.errMsg1 = "";
        this.errMsgPop = "";
        this.transactionslist = [];
        this.Approverslist = [];

        if (isedit) {
            this.DocCreatemodel = Object.assign({}, DocCreate);
            this.getLibrarianDetails(this.DocCreatemodel)
            this.DocBorrowmodel.empCode = this.DocCreatemodel.empCode;
            this.DocBorrowmodel.location = this.DocCreatemodel.location;
            this.DocBorrowmodel.initialDocNo=this.DocCreatemodel.initialDocNo;
            this.DocBorrowmodel.initialDocDate=this.DocCreatemodel.initialDocDate;
            this.DocBorrowmodel.fromDept = this.DocCreatemodel.fromDept;
            this.DocBorrowmodel.pendingApprover=this.DocCreatemodel.pendingApprover;
            this.DocBorrowmodel.fullName=this.DocCreatemodel.fullName;
            this.DocBorrowmodel.designation=this.DocCreatemodel.designation;
            this.DocBorrowmodel.reason=this.DocCreatemodel.reason;
            this.DocBorrowmodel.id=this.DocCreatemodel.id;
            this.gettransactions(this.DocBorrowmodel);
        }

        else {
            this.DocBorrowmodel = {} as DocBorrow;
            this.DocCreatemodel = {} as DocCreate;
            this.DocCreatemodel = Object.assign({}, DocCreate);
            this.DocBorrowmodel.empCode = this.currentUser.employeeId;
            this.DocBorrowmodel.location = this.locationCode + '-' + this.locationList.find(x => x.id == this.currentUser.baselocation).name;
            this.DocBorrowmodel.fromDept = this.currentUser.department;
            this.getLibrarianDetails(this.DocCreatemodel)
            this.DocBorrowmodel.empCode = this.currentUser.employeeId;
            this.DocBorrowmodel.location = this.locationCode;
            this.DocBorrowmodel.initialDocNo=this.DocCreatemodel.initialDocNo;
            this.DocBorrowmodel.initialDocDate=this.DocCreatemodel.initialDocDate;
            this.DocBorrowmodel.fromDept = this.currentUser.department;
            this.DocBorrowmodel.pendingApprover=this.DocCreatemodel.pendingApprover;
        }



        if (value == 'View') {
            this.view = true;

        }


        jQuery("#searchModal").modal('hide');
        jQuery('#myModal').modal('show');


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
            //if (this.isEdit) {
                this.DocBorrowmodel.location=this.DocCreatemodel.location;
                this.DocBorrowmodel.docNo=this.DocCreatemodel.docNo;                
                this.DocBorrowmodel.initialDocNo=this.DocCreatemodel.initialDocNo;  
                this.DocBorrowmodel.empCode = this.currentUser.employeeId;
                this.DocBorrowmodel.initialDocDate = new Date().toLocaleString();
                this.DocBorrowmodel.docType = this.DocCreatemodel.docType;
                this.DocBorrowmodel.docLocation=this.DocCreatemodel.location;
                this.DocBorrowmodel.approverType=1;
                this.DocBorrowmodel.docCategory=this.DocCreatemodel.category;
                this.DocBorrowmodel.reqStatus = "Submitted";
                connection = this.httpService.DLSpost(APIURLS.BR_DOC_BORROW_REQUEST_INSERT, this.DocBorrowmodel);
          //  }
            connection.then((output: any) => {
                this.isLoadingPop = false;
                if (output) {
                    //this.id = data.requestNo;
                    // this.uploadfile()
                    //var data=output.result;
                    if(output.type=='E')
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
                        this.errMsgPop1 = 'Borrow Request for Document ' + '' + this.DocBorrowmodel.docNo+' Submitted Successfully!';
                        jQuery("#saveModal").modal('show');
                        if (status == 'Submit') {
                          //  this.sendMail(data);
                        }
                     this.getAllEntries();
                    }
                    
                    // this.reset();
                }
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


        connection = this.httpService.DLSput(APIURLS.BR_DOC_CREATE_MASTER_INSERT, this.DocCreatemodel.id, this.DocCreatemodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                // this.id = this.DocCreatemodel.barcode;
                // this.uploadfile();
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Request' + '' + this.DocCreatemodel.barcode + '' + ' submitted successfully!';
                jQuery("#saveModal").modal('show');
                //this.sendMail(this.DocCreatemodel)
                this.getAllEntries();
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
            this.DocBorrowmodel.reqStatus = "Reject";
            // this.DocCreatemodel.rejectedFlag='1';
        }
        else
        {
            this.DocBorrowmodel.reqStatus = "Approve"; 
        }


        this.DocBorrowmodel.docCategory=this.DocCreatemodel.category;
        this.DocBorrowmodel.docType=this.DocCreatemodel.docType;
        this.DocBorrowmodel.lastApprover = this.currentUser.employeeId;       
        let temp=this.Approverslist.find(x=>x.reqType.toLocaleLowerCase()=='borrow' && x.approverId==this.currentUser.employeeId 
        || x.parallelApprover1==this.currentUser.employeeId || x.parallelApprover2==this.currentUser.employeeId || x.parallelApprover3==this.currentUser.employeeId
        ||  x.parallelApprover4==this.currentUser.employeeId);
        if(temp.role.toLocaleLowerCase()=='librarian')
        {
            this.DocBorrowmodel.pendingApprover='No';
        }
        else{
            this.DocBorrowmodel.pendingApprover=this.Approverslist.find(x=>x.priority==(temp.priority+1) && x.reqType.toLocaleLowerCase()=='borrow' ).approverId;
        }
        this.DocBorrowmodel.comments=this.Comments;
        connection = this.httpService.DLSpost(APIURLS.BR_DOC_BORROW_REQUEST_UPDATE, this.DocBorrowmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id >= 0) {
                if(data.type=='E')
                {
                    swal({
                        title: "Message",
                        text: data.message,
                        icon: "warning",
                        dangerMode: false,
                        buttons: [false, true]
                    }); 
                }
                else{
                jQuery("#myModal").modal('hide');
                if(status =='Rejected')
                {
                    this.errMsgPop1 = "Request Rejected Successfully!";
                }
                else
                {
                    if(this.DocBorrowmodel.pendingApprover=='No')
                    {
    
                        this.errMsgPop1 = "Document "+this.DocCreatemodel.docNo+" Issued to Borrower!";
                    }  
                    else{
                         this.errMsgPop1 = "Request Approved Successfully!";
                    }  
                }
               
                
                jQuery("#saveModal").modal('show');
                if (status != "Rejected") {
                    //   this.sendPendingMail(this.DocCreatemodel);
                }
               // this.sendMail(this.DocCreatemodel)
                // this.Inserttransactions(this.DocCreatemodel, status)
                this.getAllEntries();
            }
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
    ShowIssueForm(data)
    {
        this.getLibrarianDetails(data);
        this.DocCreatemodel=Object.assign({},data)
        this.DocBorrowmodel=Object.assign({},data)
        jQuery('#issueModal').modal('show');
    }
    ShowInwardForm(data)
    {
        this.getLibrarianDetails(data);
        this.DocCreatemodel=Object.assign({},data)
        this.DocBorrowmodel=Object.assign({},data)
        jQuery('#inwardModal').modal('show');

    }
    DocumentIssue(type)
    {
        if(type=='Inward')
        {
            this.DocBorrowmodel.person=this.currentUser.employeeId;
        }
        else
        {
            this.DocBorrowmodel.person=this.LibrarianName;
        }
        this.DocBorrowmodel.type=type;
        this.DocBorrowmodel.empCode=this.currentUser.employeeId;
        this.DocBorrowmodel.docRack=this.DocCreatemodel.docRack;
        this.DocBorrowmodel.docRoom=this.DocCreatemodel.docRoom;
        this.DocBorrowmodel.docBin=this.DocCreatemodel.docBin;
        let connection = this.httpService.DLSpost(APIURLS.BR_DOC_BORROW_ISSUE,this.DocBorrowmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data) {
                // this.id = this.DocCreatemodel.barcode;
                // this.uploadfile();
                if(data.type=='S')
                {
                    if(type=='Inward')
                    {
                        jQuery("#inwardModal").modal('hide');
                        this.errMsgPop1 = 'Document Inwarded Successfully';
                    }
                    else{
                        jQuery("#issueModal").modal('hide');
                        this.errMsgPop1 = 'Document Issued to '+ this.LibrarianName; 
                    }
                    jQuery("#saveModal").modal('show');
                   //this.sendMail(this.DocCreatemodel)
                    this.getAllEntries();
                   
                }
                else{
                    swal({
                        title: "Message",
                        text: data.message,
                        icon: "warning",
                        dangerMode: false,
                        buttons: [false, true]
                    });
                }
               
                // this.reset();
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error Submitting Request' + '' + this.DocCreatemodel.barcode;
        });
    }
    getlibrarian(value)
    {
        var self = this;
        var data=this.Approverslist1;
        $('#librarian1').autocomplete({
          source: function (request, response) {
    
            let result  =data.filter(x =>x.librarian.toLowerCase().includes(value));;
            response(result.map((i) => { i.label =i.librarian ,i.val=i.approverId; return i; }));
          },
          select: function (event, ui) {
            self.LibrarianName = ui.item.val;
            return false;
          }
        });
    }
    
}
