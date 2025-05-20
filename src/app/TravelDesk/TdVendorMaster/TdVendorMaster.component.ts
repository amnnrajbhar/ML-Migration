import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { TdVendorMaster } from './TdVendorMaster.model';
import * as _ from "lodash";
//import { AuditLog } from 'src/app/masters/auditlog.model';
import { AuthData } from '../../auth/auth.model';

declare var jQuery: any;

@Component({
  selector: 'app-TdVendorMaster',
  templateUrl: './TdVendorMaster.component.html',
  styleUrls: ['./TdVendorMaster.component.css']
})
export class TdVendorMasterComponent implements OnInit {

  @ViewChild(NgForm) TdVendorMasterForm: NgForm;
  public tableWidget: any;
  id: number;
  TdVendorMasterList: TdVendorMaster[] = [];
  TdVendorMasterItem: TdVendorMaster = new TdVendorMaster();
  isLoading: boolean = false;
  entityTabHeader: string;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
    masterName: string;
    reinitPOUPDatatable: any;
    isActive: boolean;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#TdVendorMasterTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    this.isLoading = false;
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }
  currentUser = {} as AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getTdVendorMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddTdVendorMaster(isEdit: boolean, data: TdVendorMaster) {
    this.TdVendorMasterForm.form.markAsPristine();
    this.TdVendorMasterForm.form.markAsUntouched();
    this.TdVendorMasterForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;

    if (this.isEdit) {
      // this.TdVendorMasterItem = data;
      Object.assign(this.TdVendorMasterItem, data);
    }
    else {
      this.TdVendorMasterItem = new TdVendorMaster();
    }
    jQuery("#myModal").modal('show');
  }

  //auditLogList: AuditLog[] = [];

//   openAuditLogs(id) {
//     jQuery("#auditModal").modal('show');
//     let stringparms = this.masterName + ',' + id;
//     this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
//       if (data) {
//         this.auditLogList = data;
//         this.auditLogList.reverse();
//       }
//       this.reinitPOUPDatatable();
//     }).catch(() => {
//     });

//   }

  getTdVendorMasterList() {
    this.httpService.get(APIURLS.BR_TDVENDOR_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.TdVendorMasterList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.TdVendorMasterList = [];
    });
  }

  onSaveTdVendorMaster(status: boolean) {
    this.errMsg = "";
    let connection: any;
    if (!this.TdVendorMasterList.some(s => s.name.trim().toLowerCase() === this.TdVendorMasterItem.name.trim().toLowerCase() && s.id != this.TdVendorMasterItem.id)) {
      if (!this.isEdit)
       {
           if (this.TdVendorMasterItem.IsActive == true)
           {
            this.TdVendorMasterItem.IsActive= true;
           }
           else
           {
            this.TdVendorMasterItem.IsActive= false;
           }
       
        this.TdVendorMasterItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.post(APIURLS.BR_TDVENDOR_MASTER_POST_PUT_API, this.TdVendorMasterItem);
      }
        
      else
      {
        this.TdVendorMasterItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.put(APIURLS.BR_TDVENDOR_MASTER_POST_PUT_API, this.TdVendorMasterItem.id, this.TdVendorMasterItem);

      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Tdvendor master code saved successfully!';
          jQuery("#saveModal").modal('show');
          this.getTdVendorMasterList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving tdvendor data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Entered tdvendor code already exists';
    }
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }

}
