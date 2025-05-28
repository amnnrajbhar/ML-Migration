import { AuthData } from '../../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import swal from 'sweetalert';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import * as XLSX from 'xlsx';
//import * as FileSaver from 'file-saver';
import { ExcelService } from '../../shared/excel-service';

// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
//import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
//import * as fs from 'file-saver';
//import { T } from '@angular/core/src/render3';

@Component({
    selector: 'app-DLSSubstitute',
    templateUrl: './DLSSubstitute.component.html',
    styleUrls: ['./DLSSubstitute.component.css']
})
export class DLSSubstituteComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;

@ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;


    public tableWidget: any;
    locListCon = [];

    isLoading: boolean = false;
    isEdit: boolean = false;

    path: string = '';
    errMsg:string='';
    locationList: any[] = [[]];

    //filter vaues
    filterType: string = ' ';
    filterstatus: string = ' ';
    filterDocType: string = ' ';
    filterlocation: string = ' ';
    filterdocno: string = ' ';
    substituteFrom:string=null;
    substituteTo:string=null;
    substituteFromName:string=null;
    filterBarcode:string=null;


    DLSDocReport: any[] = [];

    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;



    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
        private http: HttpClient, private datePipe: DatePipe) {
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
        //this.filterlocation = this.currentUser.baselocation.toString();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // if (chkaccess == true) {
        //this.getAllEntries();
        this.getLocationMaster();
    }

    locationAllList: any[] = [[]];
    getLocation(id:any) {
        let temp = this.locationList.find(e => e.id == id);
        return temp ? temp.code : '';
    }


    statuslist: any[] = [
        { id: 1, name: 'Pending' },
        { id: 2, name: 'Rejected' },
        { id: 3, name: 'Completed' }
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
        this.filterBarcode = null;
        //this.filterType = null;
this.filterType = '';
      // this.filterstatus = null;
  this.filterstatus = '';
        this.filterDocType = null;
        this.filterlocation = this.locationCode;
        this.filterdocno = null;

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
        filterModel.barcode = this.filterBarcode;
        filterModel.type = this.filterType;
        filterModel.docType = this.filterDocType;
        filterModel.location = this.filterlocation;
        filterModel.docno = this.filterdocno;
        filterModel.EmpCode=this.substituteFrom;
        filterModel.subStituteTo=this.substituteTo;
        this.httpService.DLSpost(APIURLS.BR_GET_SUBSTITUTE_RECORDS_INSERT,filterModel).then((data: any) => {
            if (data) {

                this.DLSDocReport = data;
                this.DLSDocReport.reverse();
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.DLSDocReport = [];
        });

    }

    locationCode: string
    getLocationMaster() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            if (data.length > 0) {
                this.locationAllList = data;
                this.locationList = data.filter((x:any)  => x.isActive);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
                this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
                this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
                this.locationCode = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation).code;
                this.filterlocation=this.locationCode;
              //  this.getAllEntries();
            }
            this.reInitDatatable();
        }).catch((error)=> {
            this.isLoading = false;
            this.locationList = [];
        });
    }

    currentUser!: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }

    isMasterSel: boolean = false;
    isLoadingReq:boolean=false;
    checkUncheckAll() {
      for (var i = 0; i < this.DLSDocReport.length; i++) {
        this.DLSDocReport[i].isSelected = this.isMasterSel;
      }
      this.getCheckedItemList();
    }
    isAllSelected() {
      this.isMasterSel = this.DLSDocReport.every(function (item: any) {
        return item.isSelected == true;
      })
      this.getCheckedItemList();
    }
    checkedRequestList: any[]=[];
    checkedlist: any[] = [];
    getCheckedItemList() {
      this.checkedRequestList = [];
      this.checkedlist = [];
      for (var i = 0; i < this.DLSDocReport.length; i++) {
        if (this.DLSDocReport[i].isSelected)
          this.checkedlist.push(this.DLSDocReport[i]);
      }
      this.checkedRequestList = this.checkedlist;
    }


    substitute()
    {
        this.isLoading = true;
        let td = new Date();
       
        var filterModel: any = {};
       
        filterModel.type = this.filterType;
        filterModel.location = this.filterlocation;
        filterModel.EmpCode=this.currentUser.employeeId;
        filterModel.InitialDocNo=this.checkedRequestList.map((x:any)  => x.initialDocNo).join();
        filterModel.SubFrom=this.substituteFrom;
        filterModel.SubPerson=this.substituteTo;
        this.httpService.DLSpost(APIURLS.BR_DOC_SUBSTITUTE_REQUEST_INSERT,filterModel).then((data: any) => {
            if (data) {

              swal(data.message);
            }
           this.getAllEntries();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.DLSDocReport = [];
        });

    }
}
