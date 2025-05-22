import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { ExcelService } from '../../shared/excel-service';

import * as XLSX from 'xlsx';
type excelData = any[][];
declare var jQuery: any;


// inject httpclient from @angular/common/http
@Component({
  selector: 'app-UserIdsBulkUpload',
  templateUrl: './UserIdsBulkUpload.component.html',
  styleUrls: ['./UserIdsBulkUpload.component.css']
})
export class UserIdsBulkUploadComponent implements OnInit {
  currentUser: AuthData;
 @ViewChild('file', { static: false }) file: ElementRef;

  data: excelData = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';
  files: any[] = [];
  message: any;
  isLoading: boolean = false;
  errorData: any = {};
  constructor(private httpService: HttpService, private excelService: ExcelService) { }

  ngOnInit() {
    var chkaccess = true;
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    }
  }

  getFiles(event: any) {
    this.files = event.target.files;
    /* wire up file reader */
    // const target: DataTransfer = <DataTransfer>(evt.target);
    // if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    // const reader: FileReader = new FileReader();
    // reader.onload = (e: any) => {
    //   /* read workbook */
    //   const bstr: string = e.target.result;
    //   const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    //   /* grab first sheet */
    //   const wsname: string = wb.SheetNames[0];
    //   const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    //   /* save data */
    //   this.data = <excelData>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    //   console.log(this.data);
    // };
    // reader.readAsBinaryString(target.files[0]);
  }


  bulkUpload(): void {

    //this.isLoading = true;
    this.httpService.postAttachmentWithReturn(APIURLS.USERID_BULK_UPLOAD, this.data).then((data: any) => {
      // this.filterData = data;
      // for (var item of this.filterData.list) {
      //   item.statusColor = this.statusList.find(x => x.type == item.employeeAppraisalStatus).color;
      // }
      //this.isLoading = false;
    }).catch(error => {
      //this.isLoading = false;
    });
    /* generate worksheet */
    // const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    // /* generate workbook and add the worksheet */
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // /* save to file */
    // XLSX.writeFile(wb, this.fileName);
  }

  public uploadFile(): void {
    // if (this.fileInput.files.length === 0) {
    //    return; // maybe needs more checking
    // }
    if (this.files.length === 0) {
      alert("Please choose a file to upload..")
      return; // maybe needs more checking
    }
    //console.log(this.file.files.length );
    const formData = new FormData();
    formData.append('file', this.files[0]);
    let userId = this.currentUser.uid;
    //this.httpService.postAttachmentFile(APIURLS.HR_EMPLOYEE_BULK_APPRAISAL, formData).then((data: any) => {
    this.httpService.postAttachmentWithReturn(APIURLS.USERID_BULK_UPLOAD + "?userId=" + userId, formData).then((data: any) => {
      this.isLoading = false;
      // if (data == 200 || data.success) {
      //   swal('Details saved successfully!'); 
      // }
      // else
      //   swal(data.message + "Error Occurred");
      if (data.length > 0) {
        this.errorData = data;
        swal('Invalid data encountered in Upload file, The error file is being downloaded for review');
        if (this.errorData.find(x => x.employeeNo == "Invalid Columns") != null
          || this.errorData.find(x => x.employeeNo == "Duplicate Employees Found") != null
          || this.errorData.find(x => x.employeeNo == "Blank Values Found") != null
          || this.errorData.find(x => x.employeeNo == "Unexpected Error") != null) {
          this.getInitialErrorFile();
        }
        else {
          this.getErrorFile();
        }
      }
      else
        swal('Details saved successfully!');
      console.log(data);
      console.log(data.length);
      this.reset();
    }).catch(error => {
      this.isLoading = false;
    });
  }

  getErrorFile() {
    //this.filterModel.export = true;
    this.isLoading = true;

    // this.filterModel.export = false;
    var exportList = [];
    let index = 0;
    this.errorData.forEach(item => {
      index = index + 1;
      let exportItem = {
        "Row No": item.rowNo,
        "Employee No": item.employeeNo,
        "Error Message": item.errorMessage,
      };
      exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'Upload_Error_List');
    this.isLoading = false;
  }

  reset() {
    if (this.file != null || this.file != undefined) {
      this.file.nativeElement.value = "";
    }
  }

  getInitialErrorFile() {
    //this.filterModel.export = true;
    this.isLoading = true;

    // this.filterModel.export = false;
    var exportList = [];
    let index = 0;
    this.errorData.forEach(item => {
      index = index + 1;
      let exportItem = {
        "Row No": item.rowNo,
        "Error Type": item.employeeNo,
        "Error Message": item.errorMessage,
      };
      exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'Upload_Error_List');
    this.isLoading = false;
  }
  pageSize: any = 10;
  pageNo: any;
  totalCount: number;
  totalPages: number
  gotoPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    this.ViewHistory();
  }

  pageSizeChange() {
    this.pageNo = 1;
    this.ViewHistory();
  }
  getlist() {
    this.pageNo = 1
    this.ViewHistory();
  }
  HistoryList: any[]=[];
  ViewHistory() {
    this.isLoading = true;
    let connection: any;
    let filterModel:any={};
    filterModel.pageNo = this.pageNo;
    filterModel.pageSize = this.pageSize;
    connection = this.httpService.post(APIURLS.USERID_REQUEST_BULK_UPLOAD_HISTORY,filterModel);
    connection.then((data1) => {
      if (data1) {
        let data =data1.result;
        this.HistoryList = data.list;
        this.totalCount=data.totalCount;
        this.totalPages=data.totalPages;
      }
      this.isLoading = false;

    }).catch((error) => {
      this.isLoading = false;
      this.HistoryList = [];
    })
  }

  
  Approve(data:any)
  {
    let connection:any;
    connection = this.httpService.put(APIURLS.UPDATE_STATUS_OF_BULK_APPROVE,1,data);
    connection.then((data)=>{
      if(data==200)
      {
        this.ViewHistory();
        swal ("Approved Successfuuly..!")
      }
    }).catch((error)=>{
      
    })

  }
  gotoHPage(no) {
    if (this.pageNo == no) return;
    this.pageNo = no;
    //this.getRecords();
  }

  pageHSizeChange() {
    this.pageNo = 1;
   // this.getRecords();
  }
  getHlist(item) {
    this.pageNo = 1
    this.getRecords(item);
  }
  DetailedHistoryList:any[]=[];
  getRecords(item)
  {
    this.isLoading = true;
    let connection: any;
    let filterModel:any={};
   // filterModel.pageNo = this.pageNo;
    //filterModel.pageSize = this.pageSize;
    connection = this.httpService.post(APIURLS.GET_DETAILED_HISTORY,item);
    connection.then((data1) => {
      if (data1) {
        let data =data1.result;
        this.DetailedHistoryList = data.list;
        if(this.DetailedHistoryList.length>0)
        {
          jQuery("#HistoryModal").modal('show');
        }
      }
      this.isLoading = false;

    }).catch((error) => {
      this.isLoading = false;
      this.DetailedHistoryList = [];
    })
  }
}
