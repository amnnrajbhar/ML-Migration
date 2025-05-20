import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { AuditLog } from '../masters/auditlog.model';
import { AuditLogFilter } from '../masters/auditlogfilter.model';
import { APIURLS } from '../shared/api-url';
import { AppService } from '../shared/app.service';
import { ExcelService } from '../shared/excel-service';
import { HttpService } from '../shared/http-service';
declare var $: any;

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auditlogreport',
  templateUrl: './auditlogreport.component.html',
  styleUrls: ['./auditlogreport.component.css']
})
export class AuditlogreportComponent implements OnInit {
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  tableWidget: any;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute, private excelService: ExcelService,
    private http: HttpClient) { pdfMake.vfs = pdfFonts.pdfMake.vfs;}

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // if (chkaccess == true) {
    //   this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //   this.AuditLogs();
    // }
    this.AuditLogs();
    this.getbase64image();
    this.getLocationList();
    this.getMastersList();
  }
  //get Audit Logs and Apply filters and paging to table..
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    var table = $('#AuditTable').DataTable(
      {
        "destroy": true,
        "columnDefs": [
          {
            render: function (data, type, full, meta) {
              return "<div style='word-break: break-all;height:7em;overflow-x:hidden;'>" + data + "</div>";
            },
            targets: 6
          }
        ]
      }
    );
    this.tableWidget = table;
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }

  locationList: any[] = [];
  locationname:string;
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data) {
        this.locationList = data.filter(x=>{ return x.isActive;}).map((i) => { i.location = i.code + '-' + i.name; return i; });
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a,b)=>{return collator.compare(a.code,b.code)});
        let temp=data.find(x=>x.id== this.currentUser.baselocation);
        this.locationname=temp.code +'-'+temp.name;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  //BR_AUDITLOG_MASTERS_LIST
  getMastersList() {
    this.httpService.get(APIURLS.BR_AUDITLOG_MASTERS_LIST).then((data: any) => {
      this.isLoading = true;
      if (data) {
        this.masterList = data.filter(x=>{ return x.isActive;});
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.masterList.sort((a,b)=>{return collator.compare(a.masterName,b.masterName)});
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  //Page Load functions here...
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  auditLogList: AuditLog[] = [];
  AuditLogs() {
    this.isLoading = true;
    var AuditLogFilter = {} as AuditLogFilter;
    if (this.selectedMaster != null) {
      let locations = null;
      this.selectedMaster.forEach(loc => {
        locations = loc.masterName + ',' + locations;
      });
      AuditLogFilter.masterName = locations;
    }
    if (this.selectedActionType != null) {
      let status = null;
      this.selectedActionType.forEach(loc => {
        status = loc.name + ',' + status;
      });
      AuditLogFilter.auditType = status;
    }
    if (this.from_date != null)
      AuditLogFilter.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      AuditLogFilter.todate = this.getDateFormate(this.to_date);
    this.httpService.post(APIURLS.BR_AUDITLOG_AUDITLOGREPORT_API, AuditLogFilter).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
        this.exportpdfdata(data);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.auditLogList = [];
    });

  }
  objParser(val) {
    return JSON.parse(val);
  }
  //Date Time Convertors...
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  //Static Filter for Action:
  ddlActionSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  ActionTypeList: any[] = [
    { id: 1, name: 'Create' },
    { id: 2, name: 'Update' },
    { id: 3, name: 'Delete' }
  ];
  selectedActionType: any = null;
  onActionDeSelect(item: any) {
  }
  onActionDeSelectAll(items: any) {
    this.selectedActionType = [];
  }
  onActionSelectAll(items: any) {
    this.selectedActionType = items;
  }
  //Masters List
  ddlMasterSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'masterName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  masterList: any[] = [];
  //   { id: 1, name: 'Employee Master' },
  //   { id: 2, name: 'Department' },
  //   { id: 3, name: 'Designation' },
  //   { id: 4, name: 'Visitor Type' },
  //   { id: 5, name: 'Visitor Purpose' },
  //   { id: 6, name: 'Visitor Belongings' },
  //   { id: 7, name: 'Locatoin Master' },
  //   { id: 8, name: 'Material Type' },
  //   { id: 9, name: 'UOM Master' },
  //   { id: 10, name: 'Purpose master' },
  //   { id: 11, name: 'Daily Report Mail Configuration' },
  //   { id: 12, name: 'Room Facility Master' },
  //   { id: 13, name: 'Guest House Facility master' },
  //   { id: 14, name: 'Guest House Maintenance' },
  //   { id: 15, name: 'Room Maintenance' },
  //   { id: 16, name: 'Guest House Location Master' },
  //   { id: 17, name: 'Password Policy' }
  // ];
  selectedMaster: any = null;
  onMasterDeSelect(item: any) {
  }
  onMasterDeSelectAll(items: any) {
    this.selectedMaster = [];
  }
  onMasterSelectAll(items: any) {
    this.selectedMaster = items;
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.selectedMaster = [];
    this.selectedActionType = [];
  }
  exportList: any[];
  exportAsXLSX(): void {
    this.exportList = [];
    let index = 0;
    this.auditLogList.forEach(item => {
      index = index + 1;
      let exportItem = {};
      // exportItem["SNo"] = index;
      if (this.objParser(item.changes).length > 0) {
        this.objParser(item.changes).forEach(element => {
          exportItem = {};
          exportItem["Master Name"] = item.masterName;
          exportItem["Action"] = item.auditType;
          exportItem["Action By"] = item.aduitUser;
          exportItem["Date Time"] = item.auditDateTime;
          exportItem["Key Field"] = item.keyValue;
          exportItem["Field name"] = element.fieldname;
          exportItem["Old value"] = element.oldvalue;
          exportItem["New value"] = element.newvalue;
          exportItem["Reason"] = item.purpose;
          this.exportList.push(exportItem);
        });
      }
      else {
        exportItem["Master Name"] = item.masterName;
        exportItem["Action"] = item.auditType;
        exportItem["Action By"] = item.aduitUser;
        exportItem["Date Time"] = item.auditDateTime;
        exportItem["Key Field"] = item.keyValue;
        exportItem["Field name"] = '';
        exportItem["Old value"] = '';
        exportItem["New value"] = '';
        exportItem["Reason"] = item.purpose;
        this.exportList.push(exportItem);
      }

    });

    this.excelService.exportAsExcelFile(this.exportList, 'Audit Log Report');
  }

  pdfdata:any=[{id:0,MasterName:'',Action:'',ActionBy:'',DateTime:'',KeyField:'',FieldName:'',OldValue:'',NewValue:'',Reason:''}];
  //this.pdfdata={}

  exportpdfdata(data)
  {
    this.pdfdata=[];    
    let index = 0;
    data.forEach(item => {
      index = index + 1;
      let exportItem = {};
      // exportItem["SNo"] = index;
      if (this.objParser(item.changes).length > 0) {
        this.objParser(item.changes).forEach(element => {
          let newpdfdata = {id:0,MasterName:'',Action:'',ActionBy:'',DateTime:'',KeyField:'',FieldName:'',OldValue:'',NewValue:'',Reason:''};
          newpdfdata.MasterName = item.masterName;
          newpdfdata.Action = item.auditType;
          newpdfdata.ActionBy = item.aduitUser;
          newpdfdata.DateTime = item.auditDateTime;
          newpdfdata.KeyField = item.keyValue;
          newpdfdata.FieldName = element.fieldname;
          newpdfdata.OldValue = element.oldvalue;
          newpdfdata.NewValue = element.newvalue;
          newpdfdata.Reason = item.purpose;
          this.pdfdata.push(newpdfdata);
        });
      }
      else {
        let newpdfdata = {id:0,MasterName:'',Action:'',ActionBy:'',DateTime:'',KeyField:'',FieldName:'',OldValue:'',NewValue:'',Reason:''};
        newpdfdata.MasterName = item.masterName;
        newpdfdata.Action = item.auditType;
        newpdfdata.ActionBy = item.aduitUser;
        newpdfdata.DateTime = item.auditDateTime;
        newpdfdata.KeyField = item.keyValue;
        newpdfdata.FieldName ='';
        newpdfdata.OldValue ='';
        newpdfdata.NewValue ='';
        newpdfdata.Reason = item.purpose;
        this.pdfdata.push(newpdfdata);
      }

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
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICROLABS LIMITED"+','+this.locationname;
    var ReportName = "AUDITLOG REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate =this.setFormatedDateTime(now);
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
        title:'AuditLog Report',
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
      pageSize: 'A3',
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          
          columns: [
            {
              alignment: 'left',
              image: logo,
              width: 80,
              height: 60,
  
              margin: [30, 0, 0, 0]
            },
            {
              alignment: 'center',
              stack: [
                { text: OrganisationName},
                { text: ReportName},
              ],
              bold: true,
              fontSize: 16,
              width:'*',
              margin: [250, 0, 0, 0]
            
            },
            {
              alignment: 'right',
              stack: [
                { text: ['page ', { text: currentPage.toString() }, ' of ', { text: pageCount.toString() }]},
                { text: 'printedBy' + ":" + printedBy},
                { text: 'printedOn' + ":" + jsDate},
              ],
              bold: true,
              fontSize: 10,
              margin: [0, 0, 30, 0]
            }
           
          ],
          margin: 20
        }
      },
  
    };
    pdfMake.createPdf(docDefinition).open();
  }
}
