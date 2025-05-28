import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { AuditLog } from '../../masters/auditlog.model';
import { AuditLogFilter } from '../../masters/auditlogfilter.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { ExcelService } from '../../shared/excel-service';
import { HttpService } from '../../shared/http-service';
declare var $: any;
declare var jQuery: any;

// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-PrintLogReport',
  templateUrl: './PrintLogReport.component.html',
  styleUrls: ['./PrintLogReport.component.css']
})
export class PrintLogReportComponent implements OnInit {
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  tableWidget: any;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute, private excelService: ExcelService,
    private http: HttpClient,private datepipe:DatePipe) { 
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    // if (chkaccess == true) {
    //const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    //   this.AuditLogs();
    // }
    this.AuditLogs();
    this.getbase64image();
    this.getLocationList();
  }
  //get Audit Logs and Apply filters and paging to table..
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void { 
    let exampleId: any = jQuery('#AuditTable');
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

  locationList: any[] = [];
  locationname:string;
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data) {
        this.locationList = data.filter((x:any)=>{ return x.isActive;}).map((i:any) => { i.location = i.code + '-' + i.name; return i; });
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a:any,b:any)=>{return collator.compare(a.code,b.code)});
        let temp=data.find(x=>x.id== this.currentUser.baselocation);
        this.locationname=temp.code +'-'+temp.name;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }
  //Page Load functions here...
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  printLogList: any[] = [];
  AuditLogs() {
    this.isLoading = true;
    var PrintLogFilter = {} as AuditLogFilter;
    if (this.selectedMaster != null) {
      let locations = null;
      this.selectedMaster.forEach(loc => {
        locations = loc.name + ',' + locations;
      });
      PrintLogFilter.masterName = locations;
    }
   
    if (this.from_date != null)
      PrintLogFilter.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      PrintLogFilter.todate = this.getDateFormate(this.to_date);
    this.httpService.post(APIURLS.BR_PRINT_LOG_REPORT, PrintLogFilter).then((data: any) => {
      if (data) {
        this.printLogList = data;
        this.printLogList.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.printLogList = [];
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
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  masterList: any[] = [
    { id: 1, name: 'Item Code Request' },
    { id: 2, name: 'Customer Master' },
    { id: 3, name: 'Service Master' },
    { id: 4, name: 'Vendor Master' },
    { id: 5, name: 'User ID Request' }
  ];
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
  exportList!: any[];
  exportAsXLSX(): void {
    this.exportList = [];
    let index = 0;
    this.printLogList.forEach((item :any) => {
      index = index + 1;
      let exportItem = {};
      // exportItem["SNo"] = index;
      exportItem = {};
      exportItem["SL No"] = index;
      exportItem["Plant Code"] = item.plant;
      exportItem["Request No"] = item.requestNo;
      exportItem["Process Name"] = item.process;
      exportItem["Printing Reason"] = item.printingReason;
      exportItem["Printed By"] = item.printedBy;
      exportItem["Printed On"] =this.datepipe.transform(item.printedOn,'dd/MM/yyyy');
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'Print Log Report');
  }

  pdfdata:any=[{id:0,MasterName:'',Action:'',ActionBy:'',DateTime:'',KeyField:'',FieldName:'',OldValue:'',NewValue:'',Reason:''}];
  //this.pdfdata={}

  exportpdfdata(data)
  {
    this.pdfdata=[];    
    let index = 0;
    data.forEach((item :any) => {
      index = index + 1;
      let exportItem = {};
      // exportItem["SNo"] = index;
      if (this.objParser(item.changes).length > 0) {
        this.objParser(item.changes).forEach((element:any)=> {

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
    var printContents = document.getElementById('pdf')!.innerHTML;
    var OrganisationName ="MICROLABS LIMITED"+','+this.locationname;
    var ReportName = "AUDITLOG REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate =this.setFormatedDateTime(now);
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
        title:'AuditLog Report',
        },
      
      content: [
     //   htmnikhitml,
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
      header: function (currentPage:any, pageCount:any) {
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
    //pdfMake.createPdf(docDefinition).open();
  }
}
