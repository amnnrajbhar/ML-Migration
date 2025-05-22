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
import * as FileSaver from 'file-saver';
import { ExcelService } from '../../shared/excel-service';

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
//import { T } from '@angular/core/src/render3';

@Component({
    selector: 'app-DLSReports',
    templateUrl: './DLSReports.component.html',
    styleUrls: ['./DLSReports.component.css']
})
export class DLSReportsComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;

@ViewChild('myInput', { static: false }) myInputVariable: ElementRef;


    public tableWidget: any;
    locListCon = [];

    isLoading: boolean = false;
    isEdit: boolean = false;

    path: string = '';
    errMsg:string='';
    locationList: any[] = [[]];

    //filter vaues
    filterbarcode: string = null;
    filterType: string = null;
    filterstatus: string = null;
    filterDocstatus: string = null;
    filterBoxstatus: string = null;
    filterDocType: string = null;
    filterlocation: string = null;
    filterdocno: string = null;
    filterCategory: string = null;
    filterDcDesc: string = null;
    filterBoxno: string = null;

    DLSDocReport: any[] = [];

    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;



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
        //this.filterlocation = this.currentUser.baselocation.toString();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // if (chkaccess == true) {
        //this.getAllEntries();
        this.getLocationMaster();
    }

    locationAllList: any[] = [[]];
    getLocation(id) {
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
        this.filterbarcode = null;
        this.filterType = null;
        this.filterstatus = null;
        this.filterDocstatus = null;
        this.filterBoxstatus = null;
        this.filterDocType = null;
        this.filterlocation = null;
        this.filterdocno = null;
        this.filterCategory = null;
        this.filterDcDesc = null;
        this.filterBoxno = null;

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
        filterModel.barcode = this.filterbarcode;
        filterModel.type = this.filterType;
        filterModel.status = this.filterstatus;
        filterModel.docStatus = this.filterDocstatus;
        filterModel.boxStatus = this.filterBoxstatus;
        filterModel.docType = this.filterDocType;
        filterModel.location = this.filterlocation;
        filterModel.docno = this.filterdocno;
        filterModel.category = this.filterCategory;
        filterModel.docDesc = this.filterDcDesc;
        filterModel.boxNo = this.filterBoxno;
        filterModel.fromdate = this.getFormatedDateTime(this.from_date);
        filterModel.todate = this.getFormatedDateTime(this.to_date);
        this.httpService.DLSpost(APIURLS.BR_GET_DLS_REPORT_DATA,filterModel).then((data: any) => {
            if (data) {

                this.DLSDocReport = data;
                this.DLSDocReport.reverse();
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.DLSDocReport = [];
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
                this.filterlocation=this.locationCode;
                this.getCategoryList();
                this.getAllEntries();
            }
            this.reInitDatatable();
        }).catch(error => {
            this.isLoading = false;
            this.locationList = [];
        });
    }

    currentUser: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }

    CategoryList: any[] = [];
    CategoryList1: any[] = [];
    getCategoryList() {
        this.httpService.DLSget(APIURLS.BR_GET_TYP_CAT_MASTER).then((data: any) => {
            if (data.length > 0) {
                this.CategoryList = data.filter(x => x.location == this.locationCode);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.CategoryList.sort((a, b) => { return collator.compare(a.type, b.type) });
                
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }

    GetCategory(type) {
        this.CategoryList1=[];
        this.filterCategory=null;
        this.CategoryList1 = this.CategoryList.filter(x => x.type == type && x.category != null);
      //  this.getLibrarianDetails(type);
    }


    generateExcel() {
        const title = 'Document List Report';
        const header = ["Sl NO","Type","Doc No","Barcode","Room/Rack/Bin","Desc","Created Date","Created by"," Approval Status"
        ,"Document Status","Person Responsible"  ]
        
        var exportList=[];
        var ts:any={};
        let index=0;
        this.DLSDocReport.forEach(element => {
          index=index+1;
          ts={};
          ts.sl=index;
          ts.docType=element.docType;
          ts.docNo=element.docNo;
          ts.barcode=element.barcode;
          ts.docRack=element.docRack;
          ts.docShtDesc=element.docShtDesc;
          ts.initialDocDate=this.datePipe.transform(element.initialDocDate,'dd/MM/yyyy');
          ts.empCode=element.empCode;
          ts.reqStatus=element.reqStatus;
          ts.borrowStatus=element.borrowStatus;
          ts.personResponsible=element.personResponsible;
          exportList.push(ts);     
          
        });
        var OrganisationName ="MICRO LABS LIMITED";
        const data = exportList;
        //Create workbook and worksheet
        let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Document List Report');
        //Add Row and formatting
        var head=worksheet.addRow([OrganisationName]);
        head.font = {size: 16, bold: true }
        head.alignment ={horizontal:'center'}
        //Blank Row 
       // worksheet.addRow([]);
        //Add Header Row
        let headerRow = worksheet.addRow(header);
        worksheet.mergeCells('A1:K1');
        // Cell Style : Fill and Border
        headerRow.eachCell((cell, number) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' },
            bgColor: { argb: 'FF0000FF' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
       //  worksheet.addRows(data);
        // Add Data and Conditional Formatting
        //data.forEach()
        
        for (let x1 of data)
        {
          let x2=Object.keys(x1);
          let temp=[]
          for(let y of x2)
          {
            temp.push(x1[y])
          }
          worksheet.addRow(temp)
        }
        // data.forEach((element) => {
        //   let eachRow = [];
        //   header.forEach((headers) => {
        //     eachRow.push(element.id);
        //   })   
         
        //   worksheet.addRow(eachRow); 
        // })
        worksheet.eachRow((cell,number)=>{
          cell.border = { top: { style:'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
        // worksheet.getColumn(2).width = 10;
        // worksheet.getColumn(4).width = 20;
        // worksheet.getColumn(5).width = 60;
        // worksheet.getColumn(6).width = 40;
        // worksheet.getColumn(7).width = 10;    
        // worksheet.getColumn(8).width = 20;    
        // worksheet.addRow([]);
        
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, 'Document List Report.xlsx');
        })
      
      }
}
