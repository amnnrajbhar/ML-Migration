import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { AuthData } from '../../../auth/auth.model';
import swal from 'sweetalert';
import { ExcelService } from '../../../shared/excel-service';

import * as XLSX from 'xlsx';
type excelData = any[][];
@Component({
  selector: 'app-bulk-confirmation',
  templateUrl: './bulk-confirmation.component.html',
  styleUrls: ['./bulk-confirmation.component.css']
})
export class BulkConfirmationComponent implements OnInit {
  currentUser: AuthData;
  @ViewChild('file') file;
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
    this.httpService.HRpostAttachmentFileWithReturn(APIURLS.HR_EMPLOYEE_BULK_UPLOAD_CONFIRMATION, this.data).then((data: any) => {
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
      return; // maybe needs more checking
    }
    //console.log(this.file.files.length );
    const formData = new FormData();
    formData.append('file', this.files[0]);
    let userId = this.currentUser.uid;
    //this.httpService.HRpostAttachmentFile(APIURLS.HR_EMPLOYEE_BULK_APPRAISAL, formData).then((data: any) => {
    this.httpService.HRpostAttachmentFileWithReturn(APIURLS.HR_EMPLOYEE_BULK_UPLOAD_CONFIRMATION + "?userId=" + userId, formData).then((data: any) => {
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

}

