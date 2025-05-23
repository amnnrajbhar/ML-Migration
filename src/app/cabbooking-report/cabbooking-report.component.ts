import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { APIURLS } from '../shared/api-url';
import { AppService } from '../shared/app.service';
import { HttpService } from '../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CabBooking } from '../cabrequest/cabbooking.model';
import { GenericCabBookingFilters } from '../cabrequest/genericcabbookingfilters.model';
import { ExcelService } from '../shared/excel-service';
declare var $: any;

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';
//import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cabbooking-report',
  templateUrl: './cabbooking-report.component.html',
  styleUrls: ['./cabbooking-report.component.css']
})
export class CabbookingReportComponent implements OnInit {
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  tableWidget: any;
  cabBookings: CabBooking[] = [];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute, private excelService: ExcelService,
    private http: HttpClient) {pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getLocationList();
      this.getPurposeList();
      this.getbase64image();
      this.getCabBookings();
    }
  }
  //get My Meetings and Apply filters and paging to table..
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    var table = $('#roomsTable').DataTable(
      {
        "destroy": true,
        "columnDefs": [
          { "orderable": false, "targets": 0 }
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
  //Page Load functions here...
  today = new Date();
  from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
  to_date: any = this.today;
  getCabBookings() {
    this.isLoading = true;
    var genericBookingFilters = {} as GenericCabBookingFilters;
    if (this.selectedLocations != null) {
      let locations = null;
      this.selectedLocations.forEach(loc => {
        locations = loc.code + ',' + locations;
      });
      genericBookingFilters.empLocation = locations;
    }
    if (this.selectedTripType != null) {
      let types = null;
      this.selectedTripType.forEach(loc => {
        types = loc.type + ',' + types;
      });
      genericBookingFilters.tripType = types;
    }
    if (this.selectedServiceType != null) {
      let types = null;
      this.selectedServiceType.forEach(loc => {
        types = loc.type + ',' + types;
      });
      genericBookingFilters.serviceType = types;
    }
    if (this.selectedStatus != null) {
      let status = null;
      this.selectedStatus.forEach(loc => {
        status = loc.name + ',' + status;
      });
      genericBookingFilters.status = status;
    }
    if (this.selectedPurpose != null) {
      let purpose = null;
      this.selectedPurpose.forEach(loc => {
        purpose = loc.purpose + ',' + purpose;
      });
      genericBookingFilters.purpose = purpose;
    }
    if (this.from_date != null)
      genericBookingFilters.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      genericBookingFilters.todate = this.getDateFormate(this.to_date);
    this.httpService.post(APIURLS.BR_CAB_BOOKING_BY_FILTER_API, genericBookingFilters).then((data: any) => {
      if (data) {
        this.cabBookings = data;
        this.cabBookings.reverse();
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.cabBookings = [];
    });
  }
  locationSettings = {
    singleSelection: false,
    idField: 'code',
    textField: 'location',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  locationList: any[] = [];
  selectedLocations: any = null;
  onLocationDeSelect(item: any) {
  }
  onLocationDeSelectAll(items: any) {
    this.selectedLocations = [];
  }
  onLocationSelectAll(items: any) {
    this.selectedLocations = items;
  }

  locationname:string;
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data) {
        this.locationList = data.filter(x=>{return x.isActive}).map((i) => { i.location = i.code + '-' + i.name; return i; });
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
  //Trip Type
  ddltripTypeSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  tripTypeList: any[] = [
    { id:0,type: "Local" },
    { id:1,type: "Outstation" }
  ];
  selectedTripType: any = null;
  onTripTypeDeSelect(item: any) {
  }
  onTripTypeDeSelectAll(items: any) {
    this.selectedTripType = [];
  }
  onTripTypeSelectAll(items: any) {
    this.selectedTripType = items;
  }
  //Service Type
  ddlServiceTypeSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  serviceTypeList: any[] = [
    { id:0,type: "One way" },
    { id:1,type: "Round" }
  ];
  selectedServiceType: any = null;
  onServiceTypeDeSelect(item: any) {
  }
  onServiceTypeDeSelectAll(items: any) {
    this.selectedServiceType = [];
  }
  onServiceTypeSelectAll(items: any) {
    this.selectedServiceType = items;
  }

  ddlPurposeSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'purpose',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  purposeList: any[] = [];
  selectedPurpose: any = null;
  onPurposeDeSelect(item: any) {
  }
  onPurposeDeSelectAll(items: any) {
    this.selectedPurpose = [];
  }
  onPurposeSelectAll(items: any) {
    this.selectedPurpose = items;
  }
  getPurposeList() {
    this.httpService.get(APIURLS.BR_BOOK_PURPOSE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter(x=>x.type=="Cab Request" && x.isActive).sort((a,b)=>{if(a.purpose > b.purpose) return 1; if(a.purpose < b.purpose) return -1; return 0;});
      }
    }).catch(error => {
      this.purposeList = [];
    });
  }
  //Static Filter for Status:
  ddlStatusSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  StatusList: any[] = [
    { id: 1, name: 'Pending with Manager' },
    { id: 2, name: 'Pending with Admin' },
    { id: 3, name: 'Rejected by Manager' },
    { id: 4, name: 'Rejected by Admin' },
    { id: 5, name: 'Approved' },
    { id: 6, name: 'Cancelled' }
  ];
  selectedStatus: any = null;
  onStatusDeSelect(item: any) {
  }
  onStatusDeSelectAll(items: any) {
    this.selectedStatus = [];
  }
  onStatusSelectAll(items: any) {
    this.selectedStatus = items;
  }
  //Date Time Convertors...
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  //bind formatted location and date/time
  bindLocation(meeting: any) {
    return meeting.roomLocationCode + ' - ' + meeting.roomLocationName;
  }
  binddatetime(time) {
    let datetime = new Date();
    let times = time.split(':');
    datetime.setHours(parseInt(times[0]));
    datetime.setMinutes(parseInt(times[1]));
    datetime.setSeconds(parseInt(times[2]));
    return datetime;
  }
  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    this.to_date = this.today;
    this.selectedLocations = [];
    this.selectedPurpose = [];
    this.selectedTripType = [];
    this.selectedServiceType = [];
    this.selectedStatus = [];
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }
  setEndDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +'23' + ":" +'59'+ ":" +'59';
  }
  exportList: any[];
  exportAsXLSX(): void {
    this.exportList = [];
    let index = 0;
    this.cabBookings.forEach(item => {
      index = index + 1;
      let exportItem = {
        "SNo": index,
        "REQ.No.":item.requestNo,
        "Emp. Name": item.empName,
        "Emp. Department": item.empDepartment,
        "Emp. Location": item.empLocatonCode + '-' + item.empLocation,
        "TypeofTrip": item.typeofTrip,
        "Service Type": item.serviceType,
        "Purpose": item.purpose,
        "From Location": item.fromLocation,
        "To Location": item.toLocation,
        "Start Time": item.fromDateTime,
        "End Time": item.toDateTime,
        "Status": item.status,
        "1st Approver": item.managerName ? item.managerName : 'NA',
        "1st Approver Commnets": item.managerComments,
        "2nd Approver": item.adminName != null ? item.adminName : 'NA',
        "2nd Approver Commnets": item.adminComments,
        "Emp. Commnets": item.comments,
        "Cancel Commnets": item.cancelComments,
      }

      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'Cab Booking Report');
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
    var ReportName = "CAB BOOKING REPORT"
    var printedBy = this.currentUser.fullName;
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
        title:'CabBooking Report',
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
