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
import { DocBorrow } from '../DocBorrow/DocBorrow.model';
//import { MediServiceBrand } from '../MediServiceBrand/MediServiceBrand.model';

@Component({
    selector: 'app-DocCreate',
    templateUrl: './DocCreate.component.html',
    styleUrls: ['./DocCreate.component.css']
})
export class DocCreateComponent implements OnInit {
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

    filterArNumber:any=null;
    filterProduct:any=null;

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
       // this.getAllEntries();
        this.getLocationMaster();
        //   this.getCategoryList();
        this.getbase64image();

        // }
        // else
        //  this.router.navigate(["/unauthorized"]);
    }

    displayRetentionPeriod(model)
    {
        let cat=this.CategoryList.find(x=>x.type==model.docType);

        if(model.category==null || model.category == undefined )
        {
            swal({
                title: "Message",
                text: "Please select document category",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            });
        }
        else if (model.effectiveDate==null || model.effectiveDate==undefined)
        {
            swal({
                title: "Message",
                text: "Please enter effective date",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            });
        }
        else if(cat != null || cat !=undefined)
        {   
            let date=new Date(model.effectiveDate);
            if(cat.retentionPeriod=='Years')
            {
            this.DocCreatemodel.retentionPeriod=cat.retentionNo!=null? cat.retentionNo +' '+cat.retentionPeriod:'';
            this.DocCreatemodel.expiryDate=  new Date((date.getFullYear()+ cat.retentionNo ), date.getMonth(), date.getDate()).toLocaleString();
            }
            else if (cat.retentionPeriod=='Months')
            {
                this.DocCreatemodel.retentionPeriod=cat.retentionNo!=null? cat.retentionNo +' '+cat.retentionPeriod:'';
                this.DocCreatemodel.expiryDate=  new Date((date.getFullYear()), (date.getMonth()+ cat.retentionNo) , date.getDate()).toLocaleString();
            }
            else
            {
                this.DocCreatemodel.retentionPeriod=cat.retentionNo!=null? cat.retentionNo +' '+cat.retentionPeriod:'';
                this.DocCreatemodel.expiryDate=  new Date((date.getFullYear() ), date.getMonth(), (date.getDate()+ cat.retentionNo)).toLocaleString();
            }
        }
       
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
        this.httpService.DLSget(APIURLS.BR_GET_DOCK_RACK_MASTER).then((data: any) => {
            if (data.length > 0) {

                this.DocRackMasterList = data.filter(x => (x.location).toLocaleLowerCase() == this.locationCode.toLocaleLowerCase());
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.DocRackMasterList.sort((a, b) => { return collator.compare(a.name, b.name) });
                // this.CategoryList.filter(x=>x.location==this.locationCode);
                
                this.getLocRackList();
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

    GetBins(value:DocCreate)
    {
    this.success=null;
    this.DocCreatemodel.docBin=null;
    this.BinsList=[];    
    this.BinsList=this.LocRackList.filter(x=>x.room==value.docRoom && x.rack==value.docRack && x.bin != null && x.bin != '');
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
    
    RackList: any[] = [];
    GetRacMasterkList(Room) {
        this.success=null;
        this.DocCreatemodel.docBin=null;
        this.RackList=[];
        this.BinsList=[];
        this.DocCreatemodel.docRack=null;
        this.RackList = this.LocRackList.filter(x => x.room == Room )
                        .filter((item, i, arr) => arr.findIndex((t) => t.rack === item.rack) === i);;
    }
    CategoryList1: any[] = [];
    GetCategory(type) {
        this.CategoryList1=[];
        this.DocCreatemodel.category=undefined;
        let temp=this.CategoryList.find(x=>x.type==type);
        if(temp !=null)
        {
            if(temp.retentionNo != 0)
            {
                this.DocCreatemodel.retentionPeriod=temp.retentionNo+' '+temp.retentionPeriod
            }
            else{
                this.DocCreatemodel.retentionPeriod='NA';
            }
        }
        
        this.CategoryList1 = this.CategoryList.filter(x => x.type == type && x.category != null);
      //  this.getLibrarianDetails(type);
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
        this.filterArNumber=null;
        this.filterProduct=null;
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
        filterModel.Location=this.locationCode;
        filterModel.RequestNo = this.filterdocno;       
        filterModel.status = this.filterstatus;
        filterModel.Barcode = this.filterbarcode;
        filterModel.arNo=this.filterArNumber;
        filterModel.productName=this.filterProduct;
        filterModel.FromDate = this.getFormatedDateTime(this.from_date);
        filterModel.ToDate = this.getFormatedDateTime(this.to_date);
        this.httpService.DLSpost(APIURLS.BR_DOC_CREATE_REQUEST_FILTER, filterModel).then((data: any) => {
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

    Approver:boolean;
    getLibrarianDetails(cat)
    {
        let searchtr=this.locationCode+'~'+cat.category+'~'+cat.docType;
        this.httpService.DLSgetByParam(APIURLS.BR_GET_DOC_APPROVERS, searchtr).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.Approverslist = data.filter(x=>x.reqType.toLocaleLowerCase()=='create');
                 var temp=this.Approverslist.find(x=>x.approverId==this.currentUser.employeeId 
                                                || x.parllelApprover1==this.currentUser.employeeId
                                                || x.parllelApprover2==this.currentUser.employeeId
                                                || x.subApproverId==this.currentUser.employeeId
                                                || x.subParllelApprover1==this.currentUser.employeeId
                                                || x.subParllelApprover2==this.currentUser.employeeId);
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
                this.getCategoryList();
                this.getAllEntries();
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
        this.BinsList=[];
        this.Comments = null;
        this.DocCreatemodel.empCode = this.currentUser.employeeId;
        this.DocCreatemodel.location = this.locationCode + '-' + this.locationList.find(x => x.id == this.currentUser.baselocation).name;
        this.DocCreatemodel.fromDept = this.currentUser.department;
        this.DocCreatemodel.initialDocDate = new Date().toLocaleString();
    }

    getBoxDetails(value)
    {  
            var self = this;
            $('#boxNo').autocomplete({
              source: function (request, response) {
                //var searchTerm1 = 'description'+';'+request.term + ';' + matId;
                let connection = self.httpService.DLSgetByParam(APIURLS.BR_BOX_DETAILS_GETBYPARAM_API, value);
                connection.then((data: any) => {
                  if (data) {
                    let result =data.filter(x => { return x.boxNo!=null });
                    response(result.map((i) => { i.label = i.boxNo,i.boxdesc=i.boxDescription,i.barcode=i.boxBarcode1,
                            i.room=i.room,i.rack=i.rack,i.bin=i.bin; return i; }));
                  }
                }).catch(error => {
                });
              },
              select: function (event, ui) {
              self.DocCreatemodel.boxBarcode=ui.item.barcode;
              self.DocCreatemodel.boxDescription=ui.item.boxdesc;
              self.DocCreatemodel.boxNo=ui.item.boxNo;
              self.DocCreatemodel.docRoom=ui.item.room;
              self.DocCreatemodel.docRack=ui.item.rack;
              self.DocCreatemodel.docBin=ui.item.bin;
                return false;
              }
            });          
    }



    transactionslist: any[] = [];
    gettransactions(data) {
        this.httpService.DLSpost(APIURLS.BR_DOC_CREATE_HISTORY, data).then((data: any) => {
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
    onUserActions(isedit: boolean, DocCreate: DocCreate, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.success=null;
        this.view = false;
        this.errMsg1 = "";
        this.errMsgPop = "";
        this.transactionslist1 = [];
        this.transactionslist = [];
        this.Approverslist = [];
        this.ReviewerList = [];
        this.attachments = [];
        this.RackList=[];
        this.BinsList=[];
        this.Reviewer = null;

        if (isedit) {
            this.DocCreatemodel = Object.assign({}, DocCreate);
            this.getLibrarianDetails(this.DocCreatemodel);
            this.gettransactions(this.DocCreatemodel);  
            this.CategoryList1 = this.CategoryList;    
            this.DocCreatemodel.pendingApprover=this.currentUser.employeeId;  
            this.DocCreatemodel.agrregation='No'; 
        }

        else {

            this.DocCreatemodel = {} as DocCreate;
            this.DocCreatemodel.empCode = this.currentUser.employeeId;
            this.DocCreatemodel.location = this.locationCode + '-' + this.locationList.find(x => x.id == this.currentUser.baselocation).name;
            this.DocCreatemodel.fromDept = this.currentUser.department;
            this.DocCreatemodel.initialDocDate = new Date().toLocaleString();

        }



        if (value == 'View') {
            this.Approver1 = true;
            this.Creator = true;
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
            if (!this.isEdit) {
                this.DocCreatemodel.location=this.locationCode;
                this.DocCreatemodel.empCode = this.currentUser.employeeId;
                this.DocCreatemodel.pendingApprover =this.currentUser.employeeId;
                this.DocCreatemodel.lastApprover = 'No';
                this.DocCreatemodel.effectiveDate=this.getDateFormate(this.DocCreatemodel.effectiveDate);
                this.DocCreatemodel.pendingApprover=this.Approverslist[0].approverId;
                this.DocCreatemodel.reqStatus = "Submitted";
                connection = this.httpService.DLSpost(APIURLS.BR_DOC_CREATE_REQUEST_INSERT, this.DocCreatemodel);
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
                        this.errMsgPop1 = 'Document ' + '' + this.DocCreatemodel.docNo+' Submitted Successfully!';
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
                this.sendMail(this.DocCreatemodel)
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
            this.DocCreatemodel.reqStatus = "Reject";
            // this.DocCreatemodel.rejectedFlag='1';
        }
        else{
            this.DocCreatemodel.reqStatus='Approve'
        }
         this.DocCreatemodel.lastApprover=this.currentUser.employeeId;
         this.DocCreatemodel.comments=this.Comments;

        connection = this.httpService.DLSpost(APIURLS.BR_DOC_CREATE_REQUEST_UPDATE,this.DocCreatemodel);
        connection.then((output: any) => {
            this.isLoadingPop = false;
            if (output == 200 || output.id >= 0) {
               
                //var data=output.result;
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
                    swal({
                        title: "Message",
                        text: output.message,
                        icon: "success",
                        dangerMode: false,
                        buttons: [false, true]
                    }); 
                    
                }
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = status == "Rejected" ? "Request " + '' + this.DocCreatemodel.barcode + '' + status + " Successfully!" : "Request " + '' + this.DocCreatemodel.barcode + '' + " Approved Successfully!";
              //  jQuery("#saveModal").modal('show');
                if (status != "Rejected") {
                    //   this.sendPendingMail(this.DocCreatemodel);
                }
                this.sendMail(this.DocCreatemodel)
                // this.Inserttransactions(this.DocCreatemodel, status)
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


    transactions = {} as MediServiceRequestHistory;
    Inserttransactions(data, status) {
        this.errMsg = "";
        let connection: any;
        this.transactions.doneBy = this.currentUser.employeeId;
        this.transactions.doneOn = new Date().toLocaleString();
        this.transactions.requestNo = data.requestNo;
        this.transactions.comments = this.Comments;
        this.transactions.approvalPriority = data.stage;
        if (data.stage == '5') {
            this.transactions.transactionType = "Completed";
        }
        else {
            this.transactions.transactionType = status;
        }
        if (data.stage == '1' || data.stage == '3') {
            this.transactions.role = 'HOD';
        }
        else if (data.stage == '2' || data.stage == '5') {
            this.transactions.role = 'MED_HEAD';
        }
        else if (data.stage == '3') {
            this.transactions.role = 'REVIEWER';
        }

        this.transactions.approverName = this.currentUser.fullName;
        this.transactions.department = this.currentUser.department;
        this.transactions.designation = this.currentUser.designation;
        this.transactions.processType = "MedInput request";
        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_HISTORY_INSERT_API, this.transactions);

    }

    mailbody: any;
    sendMail(DocCreate: DocCreate) {
        let connection: any;

        connection = this.httpService.post(APIURLS.BR_NPD_REQUEST_SENDMAIL_API, DocCreate);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error in sending mail..';
        });

    }

    sendPendingMail(DocCreate: DocCreate) {
        let connection: any;

        connection = this.httpService.sendPutMail(APIURLS.BR_SEND_VENDOR_MASTER_PENDING_EMAIL_API, 'VendorPending', DocCreate);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error in sending mail..';
        });

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
    checkedRequestList: any;
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

    MassApprove(status) {
        this.checkedRequestList.forEach(element => {
            element.fullName = this.currentUser.fullName;
            element.action = status;

            if (element.stage == '0') {
                if (status == "Mass Approved") {
                    element.stage = '1';
                    element.pendingApprover = this.MedHead;
                }
                else {
                    element.stage = '1';
                    element.pendingApprover = 'No';
                }
            }
            else if (element.stage == '1') {


                if (status == "Mass Approved") {
                    element.stage = '2';
                    element.reviewerAssignFlag = 1;
                    element.pendingApprover = this.Reviewer;
                }
                else {
                    element.stage = '2';
                    element.pendingApprover = 'No';
                }

            }
            else if (element.stage == '2') {
                element.stage = '3';
            }
            else if (element.stage == '3') {
                element.stage = '4';
            }
            else if (element.stage == '4') {
                element.stage = '5';
            }

            element.department = this.currentUser.department;
            element.designation = this.currentUser.designation;
            element.lastApprover = this.currentUser.fullName;
            element.modifiedBy = this.currentUser.employeeId;
            element.modifiedDate = new Date().toLocaleString();
        });

        let connection = this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_MASSAPPROVE_API, this.checkedRequestList);
        connection.then((data: any) => {
            this.isLoadingPop = true;

            if (data != null) {
                this.getAllEntries();
                this.isMasterSel = false;
                this.Reviewer = null;
                this.checkUncheckAll();
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
        });
    }

    transactionslist1: MediServiceRequestHistory[] = [];
    Finalcopy: boolean = false;
    ShowHistory(data) {
        this.transactionslist1 = [];
        this.DocCreatemodel = data;
        this.httpService.getByParam(APIURLS.BR_MED_SERVICE_HISTORY_API, this.DocCreatemodel.barcode).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.transactionslist1 = data;
                this.transactionslistCMD = this.transactionslist1.filter(x => x.role == 'CMD')
                this.transactionslistHODI = this.transactionslist1.filter(x => x.role == 'HOD' && x.approvalPriority == 2)
                this.transactionslistHODF = this.transactionslist1.filter(x => x.role == 'HOD' && x.approvalPriority == 4)
                this.transactionslistCQA = this.transactionslist1.filter(x => x.role == 'CQA')
                this.transactionslistIPR = this.transactionslist1.filter(x => x.role == 'IPR')
                this.transactionslistSCM = this.transactionslist1.filter(x => x.role == 'SupplyChain')
                this.transactionslistSM = this.transactionslist1.filter(x => x.role == 'Strategic')
                this.transactionslistDIST = this.transactionslist1.filter(x => x.role == 'Distribution')
                this.transactionslistMED = this.transactionslist1.filter(x => x.role == 'Medical')
                this.transactionslistRND = this.transactionslist1.filter(x => x.role == 'RND')
                var temp = this.transactionslist1.find(x => x.role != 'CMD' && x.transactionType == 'Pending')
                this.Finalcopy = temp == undefined ? true : false;
                //this.transactionslist.reverse();
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.transactionslist1 = [];
        });



        // jQuery("#HistoryModal").modal('show');
    }

    printModel: any = {}
    printModelM: any = {}
    printModelI: any = {}
    printModelC: any = {}
    printModelSC: any = {}

    transactionslistCMD: any[] = [];
    transactionslistHODI: any[] = [];
    transactionslistHODF: any[] = [];
    transactionslistCQA: any[] = [];
    transactionslistIPR: any[] = [];
    transactionslistSCM: any[] = [];
    transactionslistSM: any[] = [];
    transactionslistDIST: any[] = [];
    transactionslistMED: any[] = [];
    transactionslistRND: any[] = [];



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
  


    Inserttransactions1(data, status) {
        this.errMsg = "";
        let connection: any;

        if (status == 'Pending') {
            this.transactions.doneBy = this.Reviewer;
            this.transactions.requestNo = data.requestNo;
            this.transactions.approvalPriority = data.stage;
            this.transactions.transactionType = status;
            this.transactions.role = 'MED_REVIEWER';
            let rev = this.ReviewerList.find(x => x.employeeId == this.Reviewer)
            this.transactions.approverName = rev.fullName;
            this.transactions.department = rev.department;
            this.transactions.designation = rev.designation;
            this.transactions.processType = "NPD request";
            connection = this.httpService.post(APIURLS.BR_MED_SERVICE_HISTORY_INSERT_API, this.transactions);
        }
        else {
            var temp = this.transactionslist.find(x => x.role == 'MED_REVIEWER');
            this.transactions = temp;
            this.transactions.transactionType = status;
            this.transactions.doneOn = new Date().toLocaleString();
            this.transactions.comments = this.Comments;
            connection = this.httpService.put(APIURLS.BR_MED_SERVICE_HISTORY_INSERT_API, this.transactions.id, this.transactions);
        }

    }


    DocBorrowmodel={} as DocBorrow
    onUserBorrowActions(isedit: boolean, DocCreate: DocCreate, isprint: boolean, value: string) {
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
        jQuery('#borrowModal').modal('show');


    }

    

    onSaveBorrowEntry(status) {
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
                        jQuery("#borrowModal").modal('hide');
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

    onSubmitBorrowEntry(DocCreate: DocCreate) {

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
                jQuery("#borrowModal").modal('hide');
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

}
